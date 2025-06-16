import mongoose from "mongoose";

export interface IAppointment {
  patient: mongoose.Types.ObjectId;
  dentist: mongoose.Types.ObjectId;
  treatment?: mongoose.Types.ObjectId; // Opcional, si se relaciona con un tratamiento específico
  startTime: Date;
  duration: number; // Duración en minutos
  endTime: Date; // Calculado automáticamente
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  reminderSent: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}