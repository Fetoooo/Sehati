import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then((module) => module.LandingComponent),
    pathMatch: 'full',
    title: 'Sehati - Unified Digital Health Platform | صِحّتي'
  },
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then((module) => module.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then((module) => module.LoginComponent),
        title: 'Sehati - Login | تسجيل الدخول'
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then((module) => module.RegisterComponent),
        title: 'Sehati - Register | إنشاء حساب'
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'emergency-public/:id',
    loadComponent: () => import('./features/patient/emergency-card/emergency-card.component').then((module) => module.EmergencyCardComponent),
    title: 'Sehati - Emergency Medical Profile'
  },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then((module) => module.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((module) => module.DashboardComponent),
        title: 'Sehati - Dashboard'
      },
      {
        path: 'passport',
        loadComponent: () => import('./features/patient/passport/passport.component').then((module) => module.PassportComponent),
        title: 'Sehati - Medical Passport'
      },
      {
        path: 'appointments',
        loadComponent: () => import('./features/appointments/appointments.component').then((module) => module.AppointmentsComponent),
        title: 'Sehati - Appointments & Scheduling'
      },
      {
        path: 'consent',
        loadComponent: () => import('./features/patient/consent/consent.component').then((module) => module.ConsentComponent),
        title: 'Sehati - Consent & Permissions'
      },
      {
        path: 'emergency',
        loadComponent: () => import('./features/patient/emergency-card/emergency-card.component').then((module) => module.EmergencyCardComponent),
        title: 'Sehati - Emergency Card'
      },
      {
        path: 'doctor/queue',
        loadComponent: () => import('./features/doctor/doctor-queue/doctor-queue.component').then((module) => module.DoctorQueueComponent),
        title: 'Sehati - Doctor Patient Queue'
      },
      {
        path: 'doctor/encounter',
        loadComponent: () => import('./features/doctor/encounter-builder/encounter-builder.component').then((module) => module.EncounterBuilderComponent),
        title: 'Sehati - Clinical Encounter & Rx'
      },
      {
        path: 'doctor/encounter/:id',
        loadComponent: () => import('./features/doctor/encounter-builder/encounter-builder.component').then((module) => module.EncounterBuilderComponent),
        title: 'Sehati - Clinical Encounter & Rx'
      },
      {
        path: 'receptionist',
        loadComponent: () => import('./features/receptionist/receptionist-desk/receptionist-desk.component').then((module) => module.ReceptionistDeskComponent),
        title: 'Sehati - Receptionist Desk'
      },
      {
        path: 'clinic/admin',
        loadComponent: () => import('./features/clinic/clinic-admin/clinic-admin.component').then((module) => module.ClinicAdminComponent),
        title: 'Sehati - Clinic Administration'
      },
      {
        path: 'admin/audit',
        loadComponent: () => import('./features/admin/audit-logs/audit-logs.component').then((module) => module.AuditLogsComponent),
        title: 'Sehati - Security Audit Trail'
      }
    ]
  },
  {
    path: 'preview',
    loadComponent: () => import('./features/preview/preview.component').then((module) => module.PreviewComponent),
    title: 'Sehati - Architecture & UI Showcase'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
