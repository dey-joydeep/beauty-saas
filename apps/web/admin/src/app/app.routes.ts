import { LoginComponent, RegisterComponent, ForgotPasswordComponent } from '@beauty-saas/web-admin/auth';
import { Routes } from '@angular/router';
import { authGuard } from '@beauty-saas/web-core/auth';
import { AppointmentCreateComponent } from './modules/appointment/appointment-create/appointment-create.component';
import { AppointmentListComponent } from './modules/appointment/appointment-list/appointment-list.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { HomeComponent } from './modules/home/home.component';
import { ProfileComponent } from './modules/profile/profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // Protected routes
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'salons',
    loadChildren: () => import('./modules/salon/salon.module').then((m) => m.SalonModule),
  },
  {
    path: 'appointments',
    component: AppointmentListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'appointments/book',
    component: AppointmentCreateComponent,
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
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
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },

  // Fallback route - redirect to home
  { path: '**', redirectTo: '' },
];
