export enum UserRole {
  Patient = 'Patient',
  Doctor = 'Doctor',
  Receptionist = 'Receptionist',
  ClinicAdmin = 'ClinicAdmin',
  SystemAdmin = 'SystemAdmin'
}

export interface UserDto {
  userId?: number;
  id: string; // GUID string representation
  nationalId?: string | null;
  fullName: string;
  email: string;
  phone?: string | null;
  phoneNumber?: string | null;
  roleId: number;
  roleName: UserRole;
  isActive: boolean;
  unifiedPatientId?: string | null;
  specialty?: string | null;
  clinicId?: number | null;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType?: string;
  user: UserDto;
}

export interface LoginRequestDto {
  identifier?: string;
  emailOrPhone?: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  phone: string;
  fullName: string;
  password: string;
  roleName: UserRole;
  dateOfBirth?: string | null;
  gender?: number | null;
  address?: string | null;
  emergencyContact?: string | null;
  specialty?: string | null;
  licenseNumber?: string | null;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
  status?: number;
}
