import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AllergyDto,
  CreatePatientDto,
  EmergencyProfileDto,
  MedicationDto,
  PaginatedResult,
  PatientDetailDto,
  PatientDto,
  ScanDto,
  TestDto
} from '../models/patient.models';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/patients';
  private readonly emergencyUrl = '/api/v1/emergency';

  getPatients(pageNumber = 1, pageSize = 10, searchTerm = ''): Observable<PaginatedResult<PatientDto>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm.trim()) {
      params = params.set('searchTerm', searchTerm.trim());
    }

    return this.http.get<PaginatedResult<PatientDto>>(this.baseUrl, { params });
  }

  getPatientById(id: string): Observable<PatientDetailDto> {
    return this.http.get<PatientDetailDto>(`${this.baseUrl}/${id}`);
  }

  getPatientByUnifiedId(unifiedId: string): Observable<PatientDetailDto> {
    return this.http.get<PatientDetailDto>(`${this.baseUrl}/by-unified-id/${unifiedId}`);
  }

  searchPatients(query: string): Observable<PatientDto[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<PatientDto[]>(`${this.baseUrl}/search`, { params });
  }

  createPatient(dto: CreatePatientDto): Observable<PatientDto> {
    return this.http.post<PatientDto>(this.baseUrl, dto);
  }

  updatePatient(id: string, dto: Partial<CreatePatientDto>): Observable<PatientDto> {
    return this.http.put<PatientDto>(`${this.baseUrl}/${id}`, dto);
  }

  // Emergency Profile (Public QR accessible)
  getEmergencyProfile(unifiedId: string): Observable<EmergencyProfileDto> {
    return this.http.get<EmergencyProfileDto>(`${this.emergencyUrl}/${unifiedId}`);
  }

  // Allergies Sub-Resource
  getAllergies(patientId: string): Observable<AllergyDto[]> {
    return this.http.get<AllergyDto[]>(`${this.baseUrl}/${patientId}/allergies`);
  }

  addAllergy(patientId: string, dto: Partial<AllergyDto>): Observable<AllergyDto> {
    return this.http.post<AllergyDto>(`${this.baseUrl}/${patientId}/allergies`, dto);
  }

  deleteAllergy(patientId: string, allergyId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${patientId}/allergies/${allergyId}`);
  }

  // Medications Sub-Resource
  getMedications(patientId: string): Observable<MedicationDto[]> {
    return this.http.get<MedicationDto[]>(`${this.baseUrl}/${patientId}/medications`);
  }

  addMedication(patientId: string, dto: Partial<MedicationDto>): Observable<MedicationDto> {
    return this.http.post<MedicationDto>(`${this.baseUrl}/${patientId}/medications`, dto);
  }

  // Tests Sub-Resource
  getLabTests(patientId: string): Observable<TestDto[]> {
    return this.http.get<TestDto[]>(`${this.baseUrl}/${patientId}/tests`);
  }

  addLabTest(patientId: string, dto: Partial<TestDto>): Observable<TestDto> {
    return this.http.post<TestDto>(`${this.baseUrl}/${patientId}/tests`, dto);
  }

  // Scans Sub-Resource
  getScans(patientId: string): Observable<ScanDto[]> {
    return this.http.get<ScanDto[]>(`${this.baseUrl}/${patientId}/scans`);
  }

  addScan(patientId: string, dto: Partial<ScanDto>): Observable<ScanDto> {
    return this.http.post<ScanDto>(`${this.baseUrl}/${patientId}/scans`, dto);
  }
}

