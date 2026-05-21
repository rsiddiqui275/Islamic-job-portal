import { Routes } from '@angular/router';
import { authGuard, candidateGuard, employerGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'jobs',
    loadComponent: () => import('./pages/jobs/job-list/job-list.component').then(m => m.JobListComponent)
  },
  {
    path: 'jobs/:id',
    loadComponent: () => import('./pages/jobs/job-detail/job-detail.component').then(m => m.JobDetailComponent)
  },
  {
    path: 'post-job',
    canActivate: [employerGuard],
    loadComponent: () => import('./pages/jobs/job-post/job-post.component').then(m => m.JobPostComponent)
  },
  {
    path: 'my-jobs',
    canActivate: [employerGuard],
    loadComponent: () => import('./pages/employer/my-jobs/my-jobs.component').then(m => m.MyJobsComponent)
  },
  {
    path: 'applications',
    canActivate: [employerGuard],
    loadComponent: () => import('./pages/employer/applications/applications.component').then(m => m.EmployerApplicationsComponent)
  },
  {
    path: 'my-applications',
    canActivate: [candidateGuard],
    loadComponent: () => import('./pages/candidate/my-applications/my-applications.component').then(m => m.MyApplicationsComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'messages',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/messages/messages.component').then(m => m.MessagesComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
