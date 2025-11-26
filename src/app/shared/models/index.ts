export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  municipalityId?: string;
  municipality?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  rfidCard?: string;
  totalPoints?: number;
}

export enum UserRole {
  CITIZEN = 'CITIZEN',
  MUNICIPALITY_ADMIN = 'MUNICIPALITY_ADMIN',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN'
}

export interface Municipality {
  id: string;
  name: string;
  code: string;
  region: string;
  population: number;
  area: number;
  contactInfo: ContactInfo;
  isActive: boolean;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  website?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterOptions {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
