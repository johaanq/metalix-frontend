import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/municipality-dashboard/municipality-dashboard').then(m => m.MunicipalityDashboard)
  },
  {
    path: 'rewards',
    children: [
      {
        path: 'create',
        loadComponent: () => import('../reward-management/pages/reward-form/reward-form').then(m => m.RewardFormComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('../reward-management/pages/reward-form/reward-form').then(m => m.RewardFormComponent)
      },
      {
        path: 'details/:id',
        loadComponent: () => import('../reward-management/pages/reward-details/reward-details').then(m => m.RewardDetailsComponent)
      }
    ]
  }
];
