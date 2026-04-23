cat > README.md << 'README_EOF'

# Banking Portal

A micro-frontend banking portal built with Angular 18 and Native Federation, modeling retail banking flows.

> **Status**: Active development. Payments MFE scaffolded; e-Transfer flow in progress.

## Architecture

- **Shell** (`projects/shell`) — Host application, provides layout and routing
- **Payments MFE** (`projects/payments`) — Federated remote, exposes payment features

Shell loads Payments at runtime via Native Federation, enabling independent build and deploy pipelines per feature team.

## Local Development

Requires Node 20, npm 10.

```bash
npm install

# Start Payments (remote) — must run first
npm run start:payments

# Start Shell (host) — in a separate terminal
npm run start:shell
```

Shell: http://localhost:4200
Payments (standalone): http://localhost:4201

## Roadmap

- [x] Shell + Payments MFE scaffold with Native Federation
- [ ] Interac e-Transfer flow (recipient → amount → security question → confirmation)
- [ ] Bill Payments with payee management
- [ ] Transaction History
- [ ] Shared contracts library
- [ ] CI/CD + Vercel deployment
- [ ] Accounts MFE (V2)
- [ ] Wealth MFE (V3)

## Stack

Angular 18 · Native Federation · TypeScript (strict) · SCSS · Standalone Components · OnPush Change Detection
README_EOF
