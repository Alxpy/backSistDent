export interface IRole {
  name: 'admin' | 'dentist' | 'assistant' | 'patient';
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}