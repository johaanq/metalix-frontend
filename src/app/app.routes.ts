import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Default route - redirect to dashboard
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Authentication routes
  {
    path: 'auth',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { 
        path: 'login', 
        loadComponent: () => import('./identity-access-management/pages/login/login').then(m => m.LoginComponent)
      },
      { 
        path: 'register', 
        loadComponent: () => import('./identity-access-management/pages/register/register').then(m => m.RegisterComponent)
      },
      { 
        path: 'register-municipality', 
        loadComponent: () => import('./identity-access-management/pages/register-municipality/register-municipality').then(m => m.RegisterMunicipalityComponent)
      }
    ]
  },
  
  // Dashboard route (protected)
  {
    path: 'dashboard',
    loadComponent: () => import('./shared/components/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  
  // Waste Collection routes (protected, citizen only)
  {
    path: 'waste-collection',
    loadChildren: () => import('./waste-collection/waste-collection.routes').then(m => m.routes),
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['CITIZEN'] }
  },
  
  // User Identification routes (protected)
  {
    path: 'user-identification',
    loadChildren: () => import('./user-identification/user-identification.routes').then(m => m.routes),
    canActivate: [AuthGuard]
  },
  
  // Reward Management routes (protected, citizen only)
  {
    path: 'rewards',
    loadChildren: () => import('./reward-management/reward-management.routes').then(m => m.routes),
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['CITIZEN'] }
  },
  
  // Municipality Management routes (protected, admin only)
  {
    path: 'municipality',
    loadChildren: () => import('./municipality-management/municipality-management.routes').then(m => m.routes),
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['MUNICIPALITY_ADMIN', 'SYSTEM_ADMIN'] }
  },
  
  // Monitoring & Reporting routes (protected, admin only)
  {
    path: 'monitoring',
    loadChildren: () => import('./monitoring-reporting/monitoring-reporting.routes').then(m => m.routes),
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['MUNICIPALITY_ADMIN', 'SYSTEM_ADMIN'] }
  },
  
  // Wildcard route - redirect to dashboard
  { path: '**', redirectTo: '/dashboard' }
];
