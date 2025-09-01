import { Routes } from '@angular/router';
import { Login } from '@features/login/component/login.component';

export const appRoutes: Routes = [
  { path: '', component: Login },
  { path: 'login', component: Login },
  { path: 'home', 
    loadComponent: () => import('@features/home//component/home.component').then(c => c.Home), 
    children: [
      { path: 'jobs', loadComponent: () => import('@shared/components/in-development/in-development').then(c => c.InDevelopment) },
      { path: 'applies', loadComponent: () => import('@shared/components/in-development/in-development').then(c => c.InDevelopment) },
      { path: 'notifications', loadComponent: () => import('@shared/components/in-development/in-development').then(c => c.InDevelopment) },
      { path: 'profile', loadComponent: () => import('@shared/components/in-development/in-development').then(c => c.InDevelopment) },
    ],
  },
  { path: 'notfound', loadComponent: () => import('@shared/components/notfound/notfound').then(c => c.Notfound) },
  { path: '**', redirectTo: '/notfound' }
];
