import { Schema, model } from "mongoose";
import { IPatient } from "./IPatient";

const patientSchema = new Schema<IPatient>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      match: /^\+591\d{8}$/, // Formato: +59171234567
    },
    ci: {
      type: String,
      required: true,
      unique: true,
    },
    birthDate: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "unspecified"],
      required: true,
    },
    allergies: {
      type: [String],
      default: [],
    },
    medicalNotes: {
      type: String,
      default: "",
    },
    dentalNotes: {
      type: String,
      default: "",
    },
    address: {
      city: {
        type: String,
        required: true,
      },
      zone: {
        type: String,
        default: "",
      },
      street: {
        type: String,
        default: "",
      },
    },
  },
  { timestamps: true, versionKey: false }
);
export default model<IPatient>("Patient", patientSchema);
