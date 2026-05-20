export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role: UserRole;
  isVerified: boolean;
}

export enum UserRole {
  Candidate = 1,
  Employer = 2,
  Admin = 3
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: Date;
  user: User;
}
