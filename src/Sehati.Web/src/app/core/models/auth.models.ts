export type UserRole = 'Patient' | 'Doctor' | 'Receptionist' | 'ClinicAdmin' | 'SystemAdmin';

export interface UserDto {
  userId: number;
  email: string;
  phone: string;
  fullName: string;
  roleName: UserRole;
  isActive: boolean;
  unifiedPatientId?: string | null;
  specialty?: string | null;
  clinicId?: number | null;
}

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: UserDto;
}

export interface LoginRequestDto {
  identifier: string; // Email or Phone
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
