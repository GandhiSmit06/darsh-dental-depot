import mongoose, { Schema } from 'mongoose';
import { IUser } from '../interfaces/user.interface';
import { comparePassword } from '../helpers/bcrypt.helper';

const userSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: ['admin', 'shop_owner', 'doctor'],
      required: true,
      default: 'doctor',
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    clinicName: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    medicalRegistrationNumber: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_, ret) {
        delete (ret as any).password;
        delete (ret as any).refreshToken;
        delete (ret as any).passwordResetToken;
        delete (ret as any).emailVerificationToken;
        return ret;
      },
    },
  },
);

// Instance method
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return comparePassword(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
