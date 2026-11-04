export type VisitStatus = 'CheckedIn' | 'InConsultation' | 'Completed' | 'Cancelled';
export type ConsentScope = 'ViewOnly' | 'ViewAndAddRecords';

export interface DiagnosisDto {
  id?: string;
  code?: string | null;
  description: string;
  type: string; // Primary, Secondary, Differential
  notes?: string | null;
}

export interface TreatmentDto {
  id?: string;
  description: string;
  instructions?: string | null;
  procedureCode?: string | null;
}

export interface PrescriptionItemDto {
  id?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
  dispensed?: boolean;
}

export interface PrescriptionDto {
  id: string;
  visitId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  issueDate: string;
  expiryDate?: string | null;
  notes?: string | null;
  items: PrescriptionItemDto[];
  createdAt: string;
}

export interface CreatePrescriptionDto {
  visitId: string;
  patientId: string;
  notes?: string | null;
  expiryDays?: number;
  items: {
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string | null;
  }[];
}

export interface VisitDto {
  id: string;
  patientId: string;
  patientName: string;
  unifiedPatientId: string;
  doctorId: string;
  doctorName: string;
  clinicId: string;
  clinicName: string;
  appointmentId?: string | null;
  visitDateTime: string;
  status: VisitStatus;
  chiefComplaint: string;
  notes?: string | null;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  heartRate?: number | null;
  temperature?: number | null;
  respiratoryRate?: number | null;
  weight?: number | null;
  height?: number | null;
  diagnoses: DiagnosisDto[];
  treatments: TreatmentDto[];
  prescriptions: PrescriptionDto[];
}

export interface CreateVisitDto {
  patientId: string;
  doctorId: string;
  clinicId: string;
  appointmentId?: string | null;
  chiefComplaint: string;
  notes?: string | null;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  heartRate?: number | null;
  temperature?: number | null;
  respiratoryRate?: number | null;
  weight?: number | null;
  height?: number | null;
  diagnoses?: DiagnosisDto[];
  treatments?: TreatmentDto[];
}

export interface AccessPermissionDto {
  id: string;
  patientId: string;
  patientName: string;
  doctorId?: string | null;
  doctorName?: string | null;
  clinicId?: string | null;
  clinicName?: string | null;
  scope: ConsentScope;
  grantedAt: string;
  expiresAt?: string | null;
  isRevoked: boolean;
  revokedAt?: string | null;
  isActive: boolean;
}

export interface GrantConsentDto {
  patientId: string;
  doctorId?: string | null;
  clinicId?: string | null;
  scope: ConsentScope;
  expiryDays?: number | null;
}

export interface NotificationDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

export interface AuditLogDto {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  entityName: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  timestamp: string;
}

