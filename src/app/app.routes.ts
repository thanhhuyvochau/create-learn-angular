import { Routes } from '@angular/router';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () =>
      import('./features/public/landing/landing.component').then(
        (m) => m.LandingComponent
      ),
  },
  {
    path: 'class',
    loadComponent: () =>
      import('./features/public/class-list/class-list.component').then(
        (m) => m.ClassListComponent
      ),
  },
  {
    path: 'class/subject/:id',
    loadComponent: () =>
      import('./features/public/class-by-subject/class-by-subject.component').then(
        (m) => m.ClassBySubjectComponent
      ),
  },
  {
    path: 'class/:id',
    loadComponent: () =>
      import('./features/public/class-detail/class-detail.component').then(
        (m) => m.ClassDetailComponent
      ),
  },
  {
    path: 'news',
    loadComponent: () =>
      import('./features/public/news-list/news-list.component').then(
        (m) => m.NewsListComponent
      ),
  },
  {
    path: 'news/:id',
    loadComponent: () =>
      import('./features/public/news-detail/news-detail.component').then(
        (m) => m.NewsDetailComponent
      ),
  },
  // Auth routes (login, etc.)
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  // Shortcut for /login
  {
    path: 'login',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  // Management routes (protected)
  {
    path: 'management',
    loadChildren: () =>
      import('./features/management/management.routes').then(
        (m) => m.MANAGEMENT_ROUTES
      ),
  },
  // Placeholder routes for pages not yet implemented
  {
    path: 'about',
    loadComponent: () =>
      import('./features/public/landing/landing.component').then(
        (m) => m.LandingComponent
      ),
  },
  {
    path: 'teachers',
    loadComponent: () =>
      import('./features/public/landing/landing.component').then(
        (m) => m.LandingComponent
      ),
  },
  {
    path: 'recruitment',
    title: 'Recruitment | AlgoCore Education',
    loadComponent: () =>
      import('./features/public/recruitment/recruitment.component').then(
        (m) => m.RecruitmentComponent
      ),
  },
  {
    path: 'recruitment/:id',
    title: 'Job Detail | AlgoCore Education',
    loadComponent: () =>
      import('./features/public/recruitment/job-detail/job-detail.component').then(
        (m) => m.JobDetailComponent
      ),
  },
  {
    path: 'subjects',
    redirectTo: 'class',
    pathMatch: 'full',
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/public/landing/landing.component').then(
        (m) => m.LandingComponent
      ),
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./features/public/landing/landing.component').then(
        (m) => m.LandingComponent
      ),
  },
  // Wildcard redirect
  {
    path: '**',
    redirectTo: '',
  },
];
