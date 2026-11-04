import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AccessPermissionDto,
  AuditLogDto,
  CreatePrescriptionDto,
  CreateVisitDto,
  GrantConsentDto,
  NotificationDto,
  PrescriptionDto,
  VisitDto
} from '../models/clinical.models';
import { PaginatedResult } from '../models/patient.models';

@Injectable({
  providedIn: 'root'
})
export class ClinicalService {
  private http = inject(HttpClient);

  // Visits
  getVisits(patientId?: string, doctorId?: string): Observable<VisitDto[]> {
    let params = new HttpParams();
    if (patientId) params = params.set('patientId', patientId);
    if (doctorId) params = params.set('doctorId', doctorId);

    return this.http.get<VisitDto[]>('/api/v1/visits', { params });
  }

  getVisitById(id: string): Observable<VisitDto> {
    return this.http.get<VisitDto>(`/api/v1/visits/${id}`);
  }

  createVisit(dto: CreateVisitDto): Observable<VisitDto> {
    return this.http.post<VisitDto>('/api/v1/visits', dto);
  }

  // Prescriptions
  getPrescriptions(patientId?: string, doctorId?: string): Observable<PrescriptionDto[]> {
    let params = new HttpParams();
    if (patientId) params = params.set('patientId', patientId);
    if (doctorId) params = params.set('doctorId', doctorId);

    return this.http.get<PrescriptionDto[]>('/api/v1/prescriptions', { params });
  }

  getPrescriptionById(id: string): Observable<PrescriptionDto> {
    return this.http.get<PrescriptionDto>(`/api/v1/prescriptions/${id}`);
  }

  createPrescription(dto: CreatePrescriptionDto): Observable<PrescriptionDto> {
    return this.http.post<PrescriptionDto>('/api/v1/prescriptions', dto);
  }

  // Dynamic Consent Engine
  getConsentPermissions(patientId: string): Observable<AccessPermissionDto[]> {
    return this.http.get<AccessPermissionDto[]>(`/api/v1/consent/patient/${patientId}`);
  }

  grantConsent(dto: GrantConsentDto): Observable<AccessPermissionDto> {
    return this.http.post<AccessPermissionDto>('/api/v1/consent/grant', dto);
  }

  revokeConsent(permissionId: string): Observable<void> {
    return this.http.post<void>(`/api/v1/consent/revoke/${permissionId}`, {});
  }

  verifyConsent(patientId: string, doctorId?: string, clinicId?: string): Observable<{ hasActiveConsent: boolean }> {
    let params = new HttpParams();
    if (doctorId) params = params.set('doctorId', doctorId);
    if (clinicId) params = params.set('clinicId', clinicId);

    return this.http.get<{ hasActiveConsent: boolean }>(`/api/v1/consent/verify/${patientId}`, { params });
  }

  // Notifications
  getNotifications(): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>('/api/v1/notifications');
  }

  markNotificationAsRead(id: string): Observable<void> {
    return this.http.put<void>(`/api/v1/notifications/${id}/read`, {});
  }

  // Security Audit Trail
  getAuditLogs(pageNumber = 1, pageSize = 20, entityName?: string): Observable<PaginatedResult<AuditLogDto>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (entityName) params = params.set('entityName', entityName);

    return this.http.get<PaginatedResult<AuditLogDto>>('/api/v1/audit', { params });
  }
}

