import mongoose from "mongoose";

export interface ITreatmentPlan {
  patient: mongoose.Types.ObjectId; // Referencia a IPatient
  dentist: mongoose.Types.ObjectId; // Referencia a IUser con rol de dentista
  treatments: Array<{
    treatmentId: mongoose.Types.ObjectId; // Referencia a ITreatment
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    price: number; // Snapshot del precio al momento de agregarlo
    notes?: string;
    appointmentDate?: Date;
    duration?: number;
  }>;
  payments: mongoose.Types.ObjectId[]; // Referencias a IPayment
  total: number; // Suma de precios de treatments
  paid: number; // Suma de pagos vinculados
  status: 'draft' | 'active' | 'completed' | 'archived';
  // clinicId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}