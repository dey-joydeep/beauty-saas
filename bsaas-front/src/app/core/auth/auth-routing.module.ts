import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Guards
import { authBaseGuard } from './guards/auth.base.guard';

// Components
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [authBaseGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [authBaseGuard],
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [authBaseGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
