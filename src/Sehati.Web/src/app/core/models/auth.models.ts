export type UserRole = 'Patient' | 'Doctor' | 'Receptionist' | 'ClinicAdmin' | 'SystemAdmin';

export const UserRole = {
  Patient: 'Patient' as UserRole,
  Doctor: 'Doctor' as UserRole,
  Receptionist: 'Receptionist' as UserRole,
  ClinicAdmin: 'ClinicAdmin' as UserRole,
  SystemAdmin: 'SystemAdmin' as UserRole
} as const;

export interface UserDto {
  userId?: number;
  id?: string;
  nationalId?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  fullName: string;
  roleId?: number;
  roleName: UserRole;
  isActive: boolean;
  unifiedPatientId?: string | null;
  specialty?: string | null;
  clinicId?: number | null;
  createdAt?: string;
  lastLoginAt?: string | null;
}

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType?: string;
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
