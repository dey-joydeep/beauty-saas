import { Routes } from '@angular/router';
import { authGuard, roleGuard } from '@beauty-saas/web-core/auth';
import { HomeComponent } from './modules/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'auth',
    canActivate: [authGuard],
    loadChildren: () => import('@beauty-saas/web-admin/auth').then((m) => m.AUTH_ROUTES),
  },

  // Protected routes
  {
    path: 'dashboard',
    loadComponent: () => import('./modules/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'salons',
    loadChildren: () => import('./modules/salon/salon.module').then((m) => m.SalonModule),
  },
  {
    path: 'appointments',
    loadComponent: () =>
      import('./modules/appointment/appointment-list/appointment-list.component').then((m) => m.AppointmentListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'appointments/book',
    loadComponent: () =>
      import('./modules/appointment/appointment-create/appointment-create.component').then((m) => m.AppointmentCreateComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./modules/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },

  // Lazy loaded modules
  {
    path: 'owner',
    loadChildren: () => import('./modules/owner/owner.routes').then((m) => m.OWNER_ROUTES),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },

  // Fallback route - redirect to home
  { path: '**', redirectTo: '' },
];
