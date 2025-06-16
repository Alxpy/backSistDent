import { Schema, model } from "mongoose";
import { ITreatmentPlan } from "./ITreatmentPlan";

const treatmentPlanSchema = new Schema<ITreatmentPlan>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    dentist: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    treatments: [
      {
        treatment: {
          type: Schema.Types.ObjectId,
          ref: "Treatment",
          required: true,
        },
        date: { type: Date, required: true },
        notes: { type: String, default: "" },
      },
    ],
    paid: {
      type: Number,
      required: true,
      default: 0,
    },
    payments: [{ type: Schema.Types.ObjectId, ref: "Payment" }],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "active", "completed", "archived"],
      default: "draft",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);
export default model<ITreatmentPlan>("TreatmentPlan", treatmentPlanSchema);
