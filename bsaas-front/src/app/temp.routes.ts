import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';

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
