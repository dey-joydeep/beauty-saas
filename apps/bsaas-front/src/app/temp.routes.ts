import { Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';

export const tempRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
