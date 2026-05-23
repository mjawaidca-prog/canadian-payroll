import { EmploymentType } from '../../../database/entities';

export class CreateEmployeeDto {
  organizationId: string;
  firstName: string;
  lastName: string;
  sin: string;
  dateOfBirth: Date;
  email?: string;
  phone?: string;
  address?: string;
  province?: string;
  employmentType: EmploymentType;
  salaryAnnual?: number;
  hourlyRate?: number;
  hireDate: Date;
  terminationDate?: Date;
  federalTaxExemptions: number;
  provincialTaxExemptions: number;
}

export class UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  province?: string;
  employmentType?: EmploymentType;
  salaryAnnual?: number;
  hourlyRate?: number;
  terminationDate?: Date;
  federalTaxExemptions?: number;
  provincialTaxExemptions?: number;
  isActive?: boolean;
}

export class EmployeeResponseDto {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  sin: string; // Last 4 digits only in response
  dateOfBirth: Date;
  email?: string;
  phone?: string;
  address?: string;
  province?: string;
  employmentType: EmploymentType;
  salaryAnnual?: number;
  hourlyRate?: number;
  hireDate: Date;
  terminationDate?: Date;
  federalTaxExemptions: number;
  provincialTaxExemptions: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
