import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AppointmentDto,
  AppointmentStatus,
  CreateAppointmentDto,
  DailyQueueItemDto,
  FollowUpDto,
  RescheduleAppointmentDto
} from '../models/appointment.models';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/appointments';

  getAppointments(patientId?: string, doctorId?: string, clinicId?: string): Observable<AppointmentDto[]> {
    let params = new HttpParams();
    if (patientId) params = params.set('patientId', patientId);
    if (doctorId) params = params.set('doctorId', doctorId);
    if (clinicId) params = params.set('clinicId', clinicId);

    return this.http.get<AppointmentDto[]>(this.baseUrl, { params });
  }

  getAppointmentById(id: string): Observable<AppointmentDto> {
    return this.http.get<AppointmentDto>(`${this.baseUrl}/${id}`);
  }

  createAppointment(dto: CreateAppointmentDto): Observable<AppointmentDto> {
    return this.http.post<AppointmentDto>(this.baseUrl, dto);
  }

  rescheduleAppointment(id: string, dto: RescheduleAppointmentDto): Observable<AppointmentDto> {
    return this.http.put<AppointmentDto>(`${this.baseUrl}/${id}/reschedule`, dto);
  }

  updateStatus(id: string, status: AppointmentStatus): Observable<AppointmentDto> {
    return this.http.put<AppointmentDto>(`${this.baseUrl}/${id}/status`, { status });
  }

  getDailyQueue(clinicId: string, date?: string): Observable<DailyQueueItemDto[]> {
    let params = new HttpParams().set('clinicId', clinicId);
    if (date) params = params.set('date', date);

    return this.http.get<DailyQueueItemDto[]>(`${this.baseUrl}/queue`, { params });
  }

  getFollowUps(patientId?: string, doctorId?: string): Observable<FollowUpDto[]> {
    let params = new HttpParams();
    if (patientId) params = params.set('patientId', patientId);
    if (doctorId) params = params.set('doctorId', doctorId);

    return this.http.get<FollowUpDto[]>(`${this.baseUrl}/follow-ups`, { params });
  }
}

