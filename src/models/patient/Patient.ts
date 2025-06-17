import { Schema, model } from "mongoose";
import { IPatient } from "./IPatient";

const patientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, match: /^\+591\d{8}$/ },
    ci: { type: String, required: true, unique: true },
    birthDate: { type: Date, required: false },
    gender: {
      type: String,
      enum: ["male", "female", "other", "unspecified"],
      required: true,
    },
    address: {
      city: { type: String, required: true },
      zone: { type: String, default: "" },
      street: { type: String, default: "" },
    },
    medicalRecords: [
      {
        type: {
          type: String,
          enum: [
            "allergy",
            "chronic_disease",
            "surgery",
            "medication",
            "other",
          ],
          required: true,
        },
        name: { type: String, required: true },
        severity: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "low",
        },
        notes: { type: String, default: "" },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);
export default model<IPatient>("Patient", patientSchema);
