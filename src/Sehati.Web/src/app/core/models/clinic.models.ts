export interface ClinicDto {
  id: string;
  name: string;
  address: string;
  city: string;
  phoneNumber: string;
  email?: string | null;
  licenseNumber?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
  isActive: boolean;
  doctorsCount: number;
  receptionistsCount: number;
}

export interface DoctorDto {
  id: string;
  userId: string;
  fullName: string;
  email?: string | null;
  phoneNumber: string;
  specialty: string;
  licenseNumber: string;
  bio?: string | null;
  consultationFee?: number | null;
  affiliatedClinicsCount: number;
}

export interface ReceptionistDto {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  clinicId: string;
  clinicName: string;
  shiftHours?: string | null;
}

