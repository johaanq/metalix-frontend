import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/waste-collection-dashboard/waste-collection-dashboard').then(m => m.WasteCollectionDashboard)
  }
];
