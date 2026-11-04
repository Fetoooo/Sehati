import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PreviewComponent } from './features/preview/preview.component';
import { PassportComponent } from './features/patient/passport/passport.component';
import { ConsentComponent } from './features/patient/consent/consent.component';
import { EmergencyCardComponent } from './features/patient/emergency-card/emergency-card.component';
import { AppointmentsComponent } from './features/appointments/appointments.component';
import { DoctorQueueComponent } from './features/doctor/doctor-queue/doctor-queue.component';
import { EncounterBuilderComponent } from './features/doctor/encounter-builder/encounter-builder.component';
import { ReceptionistDeskComponent } from './features/receptionist/receptionist-desk/receptionist-desk.component';
import { ClinicAdminComponent } from './features/clinic/clinic-admin/clinic-admin.component';
import { AuditLogsComponent } from './features/admin/audit-logs/audit-logs.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    pathMatch: 'full',
    title: 'Sehati - Unified Digital Health Platform | صِحّتي'
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent, title: 'Sehati - Login | تسجيل الدخول' },
      { path: 'register', component: RegisterComponent, title: 'Sehati - Register | إنشاء حساب' },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'emergency-public/:id',
    component: EmergencyCardComponent,
    title: 'Sehati - Emergency Medical Profile'
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, title: 'Sehati - Dashboard' },
      { path: 'passport', component: PassportComponent, title: 'Sehati - Medical Passport' },
      { path: 'appointments', component: AppointmentsComponent, title: 'Sehati - Appointments & Scheduling' },
      { path: 'consent', component: ConsentComponent, title: 'Sehati - Consent & Permissions' },
      { path: 'emergency', component: EmergencyCardComponent, title: 'Sehati - Emergency Card' },
      { path: 'doctor/queue', component: DoctorQueueComponent, title: 'Sehati - Doctor Patient Queue' },
      { path: 'doctor/encounter', component: EncounterBuilderComponent, title: 'Sehati - Clinical Encounter & Rx' },
      { path: 'doctor/encounter/:id', component: EncounterBuilderComponent, title: 'Sehati - Clinical Encounter & Rx' },
      { path: 'receptionist', component: ReceptionistDeskComponent, title: 'Sehati - Receptionist Desk' },
      { path: 'clinic/admin', component: ClinicAdminComponent, title: 'Sehati - Clinic Administration' },
      { path: 'admin/audit', component: AuditLogsComponent, title: 'Sehati - Security Audit Trail' }
    ]
  },
  {
    path: 'preview',
    component: PreviewComponent,
    title: 'Sehati - Architecture & UI Showcase'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
