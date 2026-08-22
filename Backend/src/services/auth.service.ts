import crypto from 'crypto';
import { User } from '../models/User';
import { Otp } from '../models/Otp';
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
  sendOtpEmail,
} from '../helpers/mailer.helper';
import { env } from '../config/env';
import { IUser, UserRole } from '../interfaces/user.interface';
import { logger } from '../utils/logger';

// List of known disposable / fake email domains to disallow
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'throwawaymail.com',
  'sharklasers.com',
  'yopmail.com',
  'trashmail.com',
  'getairmail.com',
  'dispostable.com',
  'temp-mail.org',
  'fakemail.net',
  'test.com',
  'example.com',
]);

export function validateGenuineEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  
  // Standard email format regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) return false;

  const domain = trimmed.split('@')[1];
  if (!domain || DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return false;
  }

  return true;
}

export function validateIndianMobile(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\D/g, ''); // strip spaces, dashes, +91
  const mobileRegex = /^[6-9]\d{9}$/;
  // Handle 10-digit or 12-digit with 91 prefix
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return mobileRegex.test(cleaned.slice(2));
  }
  return mobileRegex.test(cleaned);
}

function generateNumericOtp(length = 6): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
  // ── 1. Doctor Registration Send OTP ───────────────────────────────────────
  async sendRegisterOtp(input: RegisterInput): Promise<{ message: string; otpSent: boolean; devOtp?: string }> {
    const trimmedEmail = input.email.trim().toLowerCase();
    const cleanPhone = input.phone.replace(/\D/g, '').slice(-10);

    // Validate genuine email
    if (!validateGenuineEmail(trimmedEmail)) {
      throw ApiError.badRequest(
        'Please provide a genuine email address (e.g. your Gmail or clinic email). Disposable or invalid emails are not allowed.'
      );
    }

    // Validate 10-digit Indian phone
    if (!validateIndianMobile(cleanPhone)) {
      throw ApiError.badRequest(
        'Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'
      );
    }

    // Check if account already exists with this Email or Phone
    const existing = await User.findOne({
      $or: [{ email: trimmedEmail }, { phone: cleanPhone }],
    });

    if (existing) {
      if (existing.email === trimmedEmail) {
        throw ApiError.conflict('An account with this Email address already exists. Please log in.');
      } else {
        throw ApiError.conflict('An account with this Mobile number already exists. Please log in.');
      }
    }

    const otp = generateNumericOtp(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store or replace pending registration OTP
    await Otp.deleteMany({ identifier: trimmedEmail, purpose: 'register' });
    await Otp.create({
      identifier: trimmedEmail,
      otp,
      purpose: 'register',
      tempData: {
        ...input,
        email: trimmedEmail,
        phone: cleanPhone,
      },
      expiresAt,
    });

    // Send email with OTP code
    try {
      await sendOtpEmail(trimmedEmail, input.fullName, otp, 'register');
      logger.info(`Verification OTP sent to ${trimmedEmail}: ${otp}`);
    } catch (err) {
      logger.error(`Failed to send verification email to ${trimmedEmail}: ${(err as Error).message}`);
    }

    const isDev = env.NODE_ENV === 'development';
    return {
      message: `A 6-digit verification code has been sent to ${trimmedEmail} and +91 ${cleanPhone}.`,
      otpSent: true,
      devOtp: isDev ? otp : undefined,
    };
  }

  // ── 2. Doctor Registration Verify OTP ─────────────────────────────────────
  async verifyRegisterOtp(email: string, otp: string): Promise<AuthTokens> {
    const trimmedEmail = email.trim().toLowerCase();

    const otpDoc = await Otp.findOne({
      identifier: trimmedEmail,
      otp: otp.trim(),
      purpose: 'register',
    });

    if (!otpDoc || !otpDoc.tempData) {
      throw ApiError.badRequest('Invalid or expired verification code. Please request a new OTP.');
    }

    const data = otpDoc.tempData as RegisterInput;

    // Double check user didn't register in the meantime
    const existing = await User.findOne({
      $or: [{ email: trimmedEmail }, { phone: data.phone }],
    });
    if (existing) {
      throw ApiError.conflict('An account with this Email or Mobile number is already registered.');
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await User.create({
      fullName: data.fullName,
      email: trimmedEmail,
      phone: data.phone,
      password: hashedPassword,
      clinicName: data.clinicName,
      address: data.address,
      medicalRegistrationNumber: data.medicalRegistrationNumber,
      role: 'doctor',
      isVerified: true,
      isActive: true,
    });

    // Delete used OTP
    await Otp.deleteOne({ _id: otpDoc._id });

    // Generate login tokens for immediate login
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
        phone: user.phone,
        clinicName: user.clinicName,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  // ── 3. Doctor Login Send OTP ──────────────────────────────────────────────
  async sendLoginOtp(identifier: string): Promise<{ message: string; otpSent: boolean; devOtp?: string }> {
    const cleanId = identifier.trim();
    const isEmail = cleanId.includes('@');
    const cleanPhone = cleanId.replace(/\D/g, '').slice(-10);

    const user = await User.findOne(
      isEmail
        ? { email: cleanId.toLowerCase() }
        : { phone: cleanPhone }
    );

    if (!user) {
      throw ApiError.notFound(
        'No registered account found with this email or mobile number. Please register your clinic first.'
      );
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been suspended. Please contact Darsh Dental Depot support.');
    }

    const otp = generateNumericOtp(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Otp.deleteMany({ identifier: user.email.toLowerCase(), purpose: 'login' });
    await Otp.create({
      identifier: user.email.toLowerCase(),
      otp,
      purpose: 'login',
      expiresAt,
    });

    try {
      await sendOtpEmail(user.email, user.fullName, otp, 'login');
      logger.info(`Login OTP sent to ${user.email}: ${otp}`);
    } catch (err) {
      logger.error(`Failed to send login OTP to ${user.email}: ${(err as Error).message}`);
    }

    const isDev = env.NODE_ENV === 'development';
    const maskedEmail = user.email.replace(/(.{2})(.*)(?=@)/, '$1***');
    const maskedPhone = user.phone ? user.phone.slice(-4) : '****';

    return {
      message: `A 6-digit login OTP has been sent to ${maskedEmail} and mobile ending in ${maskedPhone}.`,
      otpSent: true,
      devOtp: isDev ? otp : undefined,
    };
  }

  // ── 4. Doctor Login Verify OTP ────────────────────────────────────────────
  async verifyLoginOtp(identifier: string, otp: string): Promise<AuthTokens> {
    const cleanId = identifier.trim();
    const isEmail = cleanId.includes('@');
    const cleanPhone = cleanId.replace(/\D/g, '').slice(-10);

    const user = await User.findOne(
      isEmail
        ? { email: cleanId.toLowerCase() }
        : { phone: cleanPhone }
    );

    if (!user) {
      throw ApiError.notFound('Account not found. Please register first.');
    }

    const otpDoc = await Otp.findOne({
      identifier: user.email.toLowerCase(),
      otp: otp.trim(),
      purpose: 'login',
    });

    if (!otpDoc) {
      throw ApiError.badRequest('Invalid or expired OTP code. Please request a new one.');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been suspended.');
    }

    // Delete used OTP
    await Otp.deleteOne({ _id: otpDoc._id });

    // Mark verified if not already
    if (!user.isVerified) {
      user.isVerified = true;
    }

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
        phone: user.phone,
        clinicName: user.clinicName,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  // ── 5. Standard Password Login (Email OR Mobile Number) ───────────────────
  async login(identifier: string, password: string): Promise<AuthTokens> {
    const cleanId = identifier.trim();
    const cleanPhone = cleanId.replace(/\D/g, '').slice(-10);

    const user = await User.findOne({
      $or: [
        { email: cleanId.toLowerCase() },
        ...(cleanPhone ? [{ phone: cleanPhone }] : []),
        { phone: cleanId },
      ],
    }).select('+password +refreshToken');

    if (!user) throw ApiError.unauthorized('Invalid email/mobile or password.');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw ApiError.unauthorized('Invalid email/mobile or password.');

    if (!user.isVerified) {
      throw ApiError.forbidden('Please verify your email/phone before logging in.');
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
        phone: user.phone,
        clinicName: user.clinicName,
        role: user.role,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
      },
    };
  }

  async register(input: RegisterInput): Promise<{ message: string }> {
    return (await this.sendRegisterOtp(input)) as any;
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
