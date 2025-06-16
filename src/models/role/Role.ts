import { Schema, model } from "mongoose";
import { IRole } from "./IRole";

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      enum: ["admin", "dentist", "assistant", "patient"],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model<IRole>("Role", roleSchema);