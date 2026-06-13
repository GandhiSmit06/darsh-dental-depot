import crypto from 'crypto';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { hashPassword } from '../helpers/bcrypt.helper';
import {
  signAccessToken,
  signRefreshToken,
  signEmailVerifyToken,
  signPasswordResetToken,
  verifyRefreshToken,
  verifyGenericToken,
} from '../helpers/jwt.helper';
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from '../helpers/mailer.helper';
import { env } from '../config/env';
import { IUser, UserRole } from '../interfaces/user.interface';

interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
  clinicName?: string;
  address?: string;
  medicalRegistrationNumber?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: Partial<IUser>;
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ message: string }> {
    const existing = await User.findOne({ email: input.email });
    if (existing) throw ApiError.conflict('Email already registered.');

    const hashedPassword = await hashPassword(input.password);
    const isDev = env.NODE_ENV === 'development';
    const user = await User.create({
      ...input,
      password: hashedPassword,
      role: input.role || 'doctor',
      isVerified: isDev, // Auto-verify in development
    });

    if (!isDev) {
      const verifyToken = signEmailVerifyToken(user._id);
      await User.findByIdAndUpdate(user._id, { emailVerificationToken: verifyToken });

      const verifyUrl = `${env.FRONTEND_URL}/verify-email/${verifyToken}`;
      try {
        await sendWelcomeEmail(user.email, user.fullName, verifyUrl);
      } catch {
        // don't block registration if email fails
      }
    }

    return {
      message: isDev
        ? 'Registration successful. You can now log in.'
        : 'Registration successful. Please verify your email.',
    };
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) throw ApiError.unauthorized('Invalid email or password.');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw ApiError.unauthorized('Invalid email or password.');

    if (!user.isVerified) {
      throw ApiError.forbidden('Please verify your email before logging in.');
    }

    if (!user.isActive) throw ApiError.forbidden('Your account has been suspended.');

    const payload = { id: user._id.toString(), role: user.role, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();

    return {
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }

  async refreshTokens(token: string): Promise<AuthTokens> {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      throw ApiError.unauthorized('Invalid refresh token.');
    }

    const payload = { id: user._id.toString(), role: user.role, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken, user: { _id: user._id, email: user.email, role: user.role } };
  }

  async verifyEmail(token: string): Promise<void> {
    const decoded = verifyGenericToken(token);
    const user = await User.findById(decoded.id).select('+emailVerificationToken');
    if (!user || user.emailVerificationToken !== token) {
      throw ApiError.badRequest('Invalid or expired verification link.');
    }
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) return; // silently succeed to prevent email enumeration

    const resetToken = signPasswordResetToken(user._id);
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, user.fullName, resetUrl);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const decoded = verifyGenericToken(token);
    const user = await User.findById(decoded.id).select('+passwordResetToken +passwordResetExpires');

    if (
      !user ||
      user.passwordResetToken !== token ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      throw ApiError.badRequest('Invalid or expired reset link.');
    }

    user.password = await hashPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined;
    await user.save();
  }
}

export const authService = new AuthService();
