import { Schema, model } from "mongoose";
import { ITreatment } from "./ITreatment";

const tratmentSchema = new Schema<ITreatment>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export default model<ITreatment>("Treatment", tratmentSchema);
