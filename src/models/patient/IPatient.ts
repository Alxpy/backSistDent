

export type TMedicalRecordType = 
  | 'allergy' 
  | 'chronic_disease' 
  | 'surgery' 
  | 'medication' 
  | 'other';

export interface IMedicalRecord {
  type: TMedicalRecordType;
  name: string;
  severity: 'low' | 'medium' | 'high';
  notes?: string;
}
export interface IPatient {
  name: string;
  ci: string;
  birthDate?: Date;
  gender: 'male' | 'female' | 'other' | 'unspecified';
  phone: string;
  email?: string;
  address?: {
    city: string;
    zone?: string;
    street?: string;
  };
  medicalRecords: IMedicalRecord[]
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}