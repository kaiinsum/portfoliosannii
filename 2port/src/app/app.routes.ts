import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/portfolio/portfolio.routes').then((m) => m.PORTFOLIO_ROUTES),
  },
  {
    path: 'animations',
    loadComponent: () => import('./features/animation-demo/animation-demo.component').then((m) => m.AnimationDemoComponent),
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
