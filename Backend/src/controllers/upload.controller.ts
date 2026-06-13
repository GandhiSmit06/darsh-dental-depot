import { Request, Response } from 'express';
import { uploadService } from '../services/upload.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const uploadSingleImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('Image file is required.');
  const folder = (req.query.folder as string) || 'misc';
  const url = await uploadService.uploadImage(req.file.buffer, folder);
  res.status(200).json(ApiResponse.ok('Image uploaded', { url }));
});

export const uploadMultipleImages = asyncHandler(async (req: Request, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw ApiError.badRequest('At least one image file is required.');
  }
  const folder = (req.query.folder as string) || 'misc';
  const urls = await uploadService.uploadMultiple(req.files.map((f) => f.buffer), folder);
  res.status(200).json(ApiResponse.ok('Images uploaded', { urls }));
});
