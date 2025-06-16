import mongoose from 'mongoose';

export interface IPayment {
  amount: number;
  method: 'cash' | 'transfer' | 'qr' | 'tigo_money' | 'credit_card';
  receiptNumber?: string;
  recordedBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}