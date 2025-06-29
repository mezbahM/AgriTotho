export type UserRole = 'farmer' | 'dealer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  contractNumber?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  contractNumber: string;
} 