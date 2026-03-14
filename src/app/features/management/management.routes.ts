import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';

export const MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/management-layout.component').then(
        (m) => m.ManagementLayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'subject',
        loadComponent: () =>
          import('./pages/subject/subject-list.component').then(
            (m) => m.SubjectListComponent
          ),
        title: 'Subjects - Management',
      },
      {
        path: 'grade',
        loadComponent: () =>
          import('./pages/grade/grade-list.component').then(
            (m) => m.GradeListComponent
          ),
        title: 'Grades - Management',
      },
      {
        path: 'teacher',
        loadComponent: () =>
          import('./pages/teacher/teacher-list.component').then(
            (m) => m.TeacherListComponent
          ),
        title: 'Teachers - Management',
      },
      {
        path: 'class',
        loadComponent: () =>
          import('./pages/class/class-list.component').then(
            (m) => m.ClassListComponent
          ),
        title: 'Classes - Management',
      },
      {
        path: 'consultation',
        loadComponent: () =>
          import('./pages/consultation/consultation-list.component').then(
            (m) => m.ConsultationListComponent
          ),
        title: 'Consultation - Management',
      },
      {
        path: 'news',
        loadComponent: () =>
          import('./pages/news/news-list.component').then(
            (m) => m.NewsListComponent
          ),
        title: 'News - Management',
      },
      {
        path: 'account',
        loadComponent: () =>
          import('./pages/account/account-list.component').then(
            (m) => m.AccountListComponent
          ),
        title: 'Accounts - Management',
      },
      {
        path: 'registration',
        loadComponent: () =>
          import('./pages/registration/registration-list.component').then(
            (m) => m.RegistrationListComponent
          ),
        title: 'Registration - Management',
      },
      {
        path: '',
        redirectTo: 'subject',
        pathMatch: 'full',
      },
    ],
  },
];
