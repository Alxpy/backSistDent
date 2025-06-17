import { Schema, model } from "mongoose";
import { IAppointment } from "./IAppointment";

const appointmentSchema = new Schema<IAppointment>({
  patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  dentist: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  treatment: { type: Schema.Types.ObjectId, ref: 'Treatment' },
  startTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  endTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: { type: String },
  reminderSent: { type: Boolean, default: false },
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  versionKey: false // Desactiva __v
});

export default model<IAppointment>('Appointment', appointmentSchema);