import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'payments',
  },
  {
    path: 'payments',
    loadChildren: () =>
      loadRemoteModule({
        remoteName: 'payments',
        exposedModule: './routes',
      }).then((m) => m.default),
  },
  {
    path: '**',
    redirectTo: 'payments',
  },
];
// loadRemoteModule —— Native Federation 提供的函数,运行时加载 remote
// remoteName: 'payments' —— 对应 main.ts 里 initFederation({ payments: '...' }) 的 key
// exposedModule: './routes' —— 对应 Payments federation.config.js 里 exposes: { './routes': ... } 的 key
// .then((m) => m.default) —— 取默认导出(我们在 Payments 的 app.routes.ts 里写的 export default PAYMENTS_ROUTES)
// 根路径 / 重定向到 /payments(Payments 是 V1 唯一功能,直接进去)
// ** 通配路由也重定向到 payments(暂时这样,V2 加 404 页面)
