import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { getPagination, buildMeta } from '../utils/pagination';
import { exportToCSV } from '../helpers/csv.helper';
import { Request } from 'express';

export class UserService {
  async getAllUsers(req: Request) {
    const { page, limit, skip, sort } = getPagination(req);
    const filter: Record<string, unknown> = {};

    if (req.query.role) filter.role = req.query.role;
    if (req.query.isVerified !== undefined) filter.isVerified = req.query.isVerified === 'true';
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filter.$or = [
        { fullName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return { users, meta: buildMeta(total, page, limit) };
  }

  async getUserById(id: string) {
    const user = await User.findById(id);
    if (!user) throw ApiError.notFound('User not found.');
    return user;
  }

  async updateUser(id: string, updates: Partial<{
    fullName: string;
    phone: string;
    clinicName: string;
    address: string;
    profileImage: string;
    medicalRegistrationNumber: string;
    isActive: boolean;
  }>) {
    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) throw ApiError.notFound('User not found.');
    return user;
  }

  async deleteUser(id: string) {
    const user = await User.findByIdAndDelete(id);
    if (!user) throw ApiError.notFound('User not found.');
  }

  async exportUsersCSV(req: Request): Promise<string> {
    const users = await User.find().lean();
    const fields = [
      { label: 'ID', value: '_id' },
      { label: 'Full Name', value: 'fullName' },
      { label: 'Email', value: 'email' },
      { label: 'Phone', value: 'phone' },
      { label: 'Role', value: 'role' },
      { label: 'Clinic Name', value: 'clinicName' },
      { label: 'Verified', value: 'isVerified' },
      { label: 'Active', value: 'isActive' },
      { label: 'Created At', value: 'createdAt' },
    ];
    return exportToCSV(users as any[], fields);
  }
}

export const userService = new UserService();
