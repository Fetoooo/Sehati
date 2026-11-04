import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClinicDto, DoctorDto, ReceptionistDto } from '../models/clinic.models';
import { PaginatedResult } from '../models/patient.models';

@Injectable({
  providedIn: 'root'
})
export class ClinicService {
  private http = inject(HttpClient);

  // Clinics
  getClinics(pageNumber = 1, pageSize = 20, searchTerm = ''): Observable<PaginatedResult<ClinicDto>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) params = params.set('searchTerm', searchTerm);

    return this.http.get<PaginatedResult<ClinicDto>>('/api/v1/clinics', { params });
  }

  getClinicById(id: string): Observable<ClinicDto> {
    return this.http.get<ClinicDto>(`/api/v1/clinics/${id}`);
  }

  // Doctors
  getDoctors(specialty?: string, searchTerm?: string): Observable<DoctorDto[]> {
    let params = new HttpParams();
    if (specialty) params = params.set('specialty', specialty);
    if (searchTerm) params = params.set('searchTerm', searchTerm);

    return this.http.get<DoctorDto[]>('/api/v1/doctors', { params });
  }

  getDoctorById(id: string): Observable<DoctorDto> {
    return this.http.get<DoctorDto>(`/api/v1/doctors/${id}`);
  }
}

