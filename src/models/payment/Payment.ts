import { Schema, model } from "mongoose";
import { IPayment } from "./IPayment";

const paymentSchema = new Schema<IPayment>({
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    enum: ['cash', 'transfer', 'qr', 'tigo_money', 'credit_card'],
    required: true,
  },
  receiptNumber: {
    type: String,
    default: '',
  },
  recordedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true, versionKey: false });
export default model<IPayment>('Payment', paymentSchema);