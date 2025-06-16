
export interface IPatient {
  name: string;
  ci: string;
  birthDate?: Date;
  gender: 'male' | 'female' | 'other' | 'unspecified';
  phone: string; // Formato: +59171234567
  email?: string;
  address?: {
    city: string;
    zone?: string;
    street?: string;
  };
  allergies: string[];
  medicalNotes?: string;
  dentalNotes?: string;
  // clinicId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}