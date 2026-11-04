export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'NoShow';

export interface AppointmentDto {
  id: string;
  patientId: string;
  patientName: string;
  unifiedPatientId: string;
  doctorId: string;
  doctorName: string;
  specialty?: string | null;
  clinicId: string;
  clinicName: string;
  appointmentDateTime: string;
  status: AppointmentStatus;
  type: string;
  queueNumber?: number | null;
  notes?: string | null;
  createdAt: string;
}

export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  clinicId: string;
  appointmentDateTime: string;
  type?: string;
  notes?: string | null;
}

export interface RescheduleAppointmentDto {
  newDateTime: string;
  reason?: string | null;
}

export interface DailyQueueItemDto {
  appointmentId: string;
  queueNumber: number;
  patientName: string;
  unifiedPatientId: string;
  appointmentTime: string;
  status: AppointmentStatus;
  doctorName: string;
}

export interface FollowUpDto {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  visitId: string;
  recommendedDate: string;
  reason: string;
  status: string;
}

