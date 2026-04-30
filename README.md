# Banking Portal

A micro-frontend banking portal built with Angular 18 and Native Federation, modeling retail banking flows.

> **V1**: Shell + Payments MFE with a complete Interac e-Transfer journey (recipient → amount → review → confirmation), end-to-end through NgRx Store + Effects.

[![Angular 18](https://img.shields.io/badge/Angular-18-DD0031)](https://angular.dev) [![Native Federation](https://img.shields.io/badge/Native_Federation-18-0F766E)](https://www.npmjs.com/package/@angular-architects/native-federation) [![NgRx Store](https://img.shields.io/badge/NgRx-Store_+_Effects-9333EA)](https://ngrx.io)

---

## Why this project

Large financial platforms face a recurring frontend challenge: dozens of teams, sprawling Angular monoliths, and release cycles that block each other. Micro-frontends are how the industry is responding — but most public examples are toy demos. This project is a deliberate, banking-flavoured MFE reference that shows:

- **Independent build artifacts** — Shell and Payments build and deploy separately
- **Runtime composition** — the user sees one app; underneath, two run-time-loaded Angular apps cooperate
- **Banking-grade state management** — NgRx Store with `exhaustMap`-based effect prevents duplicate submissions on double-click
- **Auditability** — every state change is an action; the action log is the audit log

The domain is retail banking — Interac e-Transfer specifically — drawn from 4 years of frontend work on frontend engineering at .

## Architecture

```mermaid
flowchart TB
subgraph Browser["User's browser"]
Shell["Shell App<br/>(host, port 4200)<br/>topbar · sidebar · routing"]
Payments["Payments MFE<br/>(remote, port 4201)<br/>e-Transfer flow"]
Shell -->|"loads at runtime via<br/>Native Federation"| Payments
end

    subgraph PaymentsInternal["Payments MFE internals"]
        UI["Step components<br/>(Recipient → Amount → Review → Success)"]
        Store["NgRx Store<br/>(state + selectors)"]
        Effects["NgRx Effects<br/>(submit$ — exhaustMap)"]
        UI <-->|"select / dispatch"| Store
        UI -->|"submitRequested"| Effects
        Effects -->|"submitSucceeded"| Store
    end

    style Shell fill:#ecfdf5,stroke:#0f766e
    style Payments fill:#ecfdf5,stroke:#0f766e
    style Store fill:#f1f5f9,stroke:#64748b
    style Effects fill:#f1f5f9,stroke:#64748b

​```

**Key architectural choices**:

- **Native Federation over Module Federation** — aligned with Angular 17+'s esbuild builder; Module Federation is Webpack-locked
- **NgRx Store + Effects over Signal Store** — financial submissions need an explicit action log for replayable action log; `exhaustMap` in the submit effect prevents duplicate transfers on double-click
- **Separate URL per step** — browser back button works naturally; deep-linking is possible; each step is independently lazy-loaded
- **Money in cents** — all monetary state stored as integers; floating-point arithmetic is produces precision errors

## Tech stack

- **Angular 18** with standalone components, signals, and the new `@for` / `@if` control flow
- **Native Federation** (`@angular-architects/native-federation@18`) for runtime MFE composition
- **NgRx Store + Effects + DevTools** for state management and async orchestration
- **Reactive Forms** with custom validators for amount limits and decimal patterns
- **TypeScript strict mode**, OnPush change detection across the board
- **SCSS** with BEM, no UI library (intentional — keeping bundle lean for MFE; design system is V2)

## Local development

Requires Node 20 (an `.nvmrc` is provided), npm 10.

```bash
npm install --legacy-peer-deps

# Terminal 1 — start Payments (must run first; Shell loads from it)

npm run start:payments

# Terminal 2 — start Shell

npm run start:shell
​```

- Shell: http://localhost:4200
- Payments standalone: http://localhost:4201

The Payments MFE is fully runnable in isolation — visit port 4201 directly to see the e-Transfer flow without the Shell. This is the same property that lets feature teams develop independently in production.

## Project structure

```
banking-portal/
├── projects/
│   ├── shell/                      # Host app (port 4200)
│   │   ├── src/main.ts             # initFederation() registers remotes
│   │   └── src/app/                # topbar, sidebar, routing to /payments
│   └── payments/                   # Remote MFE (port 4201)
│       ├── federation.config.js    # exposes ./routes
│       └── src/app/
│           ├── core/
│           │   ├── models/         # Recipient, Account, ETransferDraft
│           │   ├── mock/           # Seed data
│           │   └── state/e-transfer/
│           │       ├── e-transfer.actions.ts
│           │       ├── e-transfer.reducer.ts
│           │       ├── e-transfer.selectors.ts
│           │       └── e-transfer.effects.ts
│           └── features/
│               └── e-transfer/
│                   ├── flow-shell/         # Progress UI shell
│                   └── steps/              # recipient, amount, review, success
└── README.md
```

## Architectural decisions worth highlighting

### Why `exhaustMap`, not `switchMap`, in the submit effect

`switchMap` cancels the previous in-flight request when a new one starts. For money movement that is dangerous — the cancelled request may already have been processed by the backend. `exhaustMap` ignores new triggers while a submission is in flight, so duplicate clicks are dropped. Combined with the UI disabling the button on `submitting` state, this gives idempotent-by-construction submission.

### Why a "draft vs request" type split

​```typescript
interface ETransferDraft {
recipientId: string | null;
amountCents: number | null;
// ... all fields nullable — wizard in progress
}

interface ETransferRequest {
recipient: Recipient; // resolved, non-null
fromAccount: Account;
amountCents: number;
// ... all required — ready to submit
}
```

The type system enforces "only completed drafts can be submitted." It is impossible to dispatch a submit with half-filled state because the type does not compile.

### Why route-per-step, not in-component step state

Browser back button, URL deep-linking, and per-step lazy loading all become free. The cost is that step components must read state from the store rather than passing through props — but that is NgRx's job and it is already there.

### Why no Material UI (yet)

In MFE architectures, sharing UI libraries across remotes is a non-trivial decision (one shared bundle vs. per-MFE bundle, version drift risk). V1 keeps the dependency surface small. V2's plan is to extract a shared design system as its own federated remote.

## Roadmap

- [x] **V1** — Shell + Payments MFE; complete e-Transfer flow; NgRx Store + Effects
- [ ] **V1.1** — Bill Payments (utilities, CRA, credit cards)
- [ ] **V1.2** — Transaction history with filtering
- [ ] **V1.3** — Jest unit tests + Playwright E2E for the e-Transfer happy path
- [ ] **V2** — Accounts MFE (account summary, transactions); cross-MFE event bus
- [ ] **V2** — Migrate to Nx workspace as MFE count grows
- [ ] **V3** — Wealth MFE (portfolio, fixed-income); evolving from a separate project
- [ ] **V3** — Shared design system as a federated UI remote

## Production considerations not in V1

This is a portfolio demo. Real banking deployment would also need:

- **Data residency** — Canadian banks (OSFI-regulated) require data in Canada; AWS Canada Central or Azure Canada Central rather than US-hosted platforms like Vercel
- **Authentication** — currently the user context is hard-coded; production needs SSO + token refresh + per-route guards
- **Idempotency keys** — the submit effect prevents same-tab double-submit, but cross-session retries need a server-issued idempotency key on the request
- **CSP, SRI, audit logging** — enterprise CDN-level enforcement
- **Real backend** — currently mocked; the effect is shaped so swapping the mocked observable for `http.post('/api/e-transfers', request)` is a one-line change

## Author

Built by Lirui Cao. 4 years of frontend engineering on frontend engineering at ; this project demonstrates modern Angular MFE architecture.
