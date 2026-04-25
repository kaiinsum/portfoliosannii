import { Routes } from '@angular/router';

export const PORTFOLIO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./portfolio-shell/portfolio-shell.page').then((m) => m.PortfolioShellPage),
    children: [
      {
        path: 'design',
        data: { mode: 'design' },
        loadComponent: () => import('./pages/set-mode/set-mode.page').then((m) => m.SetModePage),
      },
      {
        path: 'technical',
        data: { mode: 'technical' },
        loadComponent: () => import('./pages/set-mode/set-mode.page').then((m) => m.SetModePage),
      },
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/about/about.page').then((m) => m.AboutPage),
      },
      {
        path: 'projects',
        loadComponent: () => import('./pages/projects/projects.page').then((m) => m.ProjectsPage),
      },
      {
        path: 'projects/:id',
        loadComponent: () =>
          import('./pages/project-detail/project-detail.page').then((m) => m.ProjectDetailPage),
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact.page').then((m) => m.ContactPage),
      },
    ],
  },
];

