export interface AllergyDto {
  id: string;
  patientId: string;
  substance: string;
  reaction: string;
  severity: string;
  diagnosedDate?: string | null;
  notes?: string | null;
}

export interface MedicationDto {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  prescribedBy?: string | null;
}

export interface TestDto {
  id: string;
  patientId: string;
  testName: string;
  testDate: string;
  result: string;
  normalRange?: string | null;
  laboratoryName?: string | null;
  documentUrl?: string | null;
}

export interface ScanDto {
  id: string;
  patientId: string;
  scanType: string;
  bodyPart: string;
  scanDate: string;
  findings: string;
  imagingCenter?: string | null;
  imageUrl?: string | null;
}

export interface EmergencyProfileDto {
  id: string;
  patientId: string;
  unifiedPatientId: string;
  fullName: string;
  dateOfBirth?: string | null;
  bloodType?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContact?: string | null;
  allergies: string[];
  chronicConditions: string[];
  activeMedications: string[];
  qrCodeData?: string | null;
}

export interface PatientDto {
  id: string;
  patientId?: number;
  userId?: number;
  unifiedPatientId: string;
  fullName: string;
  phoneNumber?: string;
  phone?: string;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: string | number | null;
  bloodType?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  nationalId?: string | null;
  createdAt?: string;
}

export interface PatientDetailDto extends PatientDto {
  allergies: AllergyDto[];
  medications: MedicationDto[];
  tests: TestDto[];
  scans: ScanDto[];
  emergencyProfile?: EmergencyProfileDto | null;
}

export interface CreatePatientDto {
  fullName: string;
  phoneNumber?: string;
  phone?: string;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: string | number | null;
  bloodType?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  nationalId?: string | null;
}

export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
