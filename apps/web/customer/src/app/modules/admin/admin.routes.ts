import { Routes } from '@angular/router';

// Guards
import { authGuard } from '../../core/auth/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'users',
    loadComponent: () => import('./components/user-management/user-management.component').then((m) => m.UserManagementComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'salon-approvals',
    loadComponent: () => import('./components/salon-approval/salon-approval.component').then((m) => m.SalonApprovalComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'settings',
    loadComponent: () => import('./components/system-settings/system-settings.component').then((m) => m.SystemSettingsComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  { path: '**', redirectTo: '' },
];
