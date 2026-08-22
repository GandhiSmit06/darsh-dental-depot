import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  identifier: string;
  otp: string;
  purpose: 'register' | 'login';
  tempData?: Record<string, any>;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    identifier: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
      trim: true,
    },
    purpose: {
      type: String,
      enum: ['register', 'login'],
      required: true,
    },
    tempData: {
      type: Schema.Types.Mixed,
    },
    expiresAt: {
      type: Date,
      required: true,
      // Auto-delete document after expiration time (10 minutes)
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  },
);

export const Otp = mongoose.model<IOtp>('Otp', otpSchema);
