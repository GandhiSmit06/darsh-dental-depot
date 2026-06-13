import { Document, Types } from 'mongoose';

export type UserRole = 'admin' | 'shop_owner' | 'doctor';

export interface IUser extends Document {
  _id: Types.ObjectId;
  role: UserRole;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  clinicName?: string;
  address?: string;
  profileImage?: string;
  medicalRegistrationNumber?: string;
  isVerified: boolean;
  isActive: boolean;
  refreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}
