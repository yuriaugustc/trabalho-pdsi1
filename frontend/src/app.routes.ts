import { Routes } from '@angular/router';
import { Login } from '@features/login/component/login.component';

export const appRoutes: Routes = [
  { path: 'login', component: Login },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '', 
    loadComponent: () => import('@features/home/component/home.component').then(c => c.Home), 
    children: [
      { path: 'jobs', loadComponent: () => import('@features/jobs/components/list/jobs-list.component').then(c => c.JobsList) },
      { path: 'jobs/:id', loadComponent: () => import('@features/jobs/components/detail/job-detail.component').then(c => c.JobDetail) },
      { path: 'applies', loadComponent: () => import('@features/jobs/components/applied/jobs-applied.component').then(c => c.JobsApplied) },
      { path: 'saved', loadComponent: () => import('@features/jobs/components/saved/jobs-saved.component').then(c => c.JobsSaved) },
      { path: 'notifications', loadComponent: () => import('@shared/components/in-development/in-development').then(c => c.InDevelopment) },
      { path: 'profile', loadComponent: () => import('@shared/components/in-development/in-development').then(c => c.InDevelopment) },
      { path: 'company/jobs', loadComponent: () => import('@features/jobs/components/company/company-jobs.component').then(c => c.CompanyJobs) },
      { path: 'company/applies', loadComponent: () => import('@shared/components/in-development/in-development').then(c => c.InDevelopment) },
    ],
  },
  { path: 'home', redirectTo: '' },
  { path: 'notfound', loadComponent: () => import('@shared/components/notfound/notfound').then(c => c.Notfound) },
  { path: '**', redirectTo: '/notfound' }
];
