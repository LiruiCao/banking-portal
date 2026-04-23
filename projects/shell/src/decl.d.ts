// Native Federation loads remotes at runtime, so TypeScript can't resolve them
// statically. This declaration tells the compiler these module paths are valid.
declare module 'payments/routes' {
  import { Routes } from '@angular/router';
  const routes: Routes;
  export default routes;
}
