import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import dayjs from 'dayjs';

export const getDashboardSummary = asyncHandler(async (_req: Request, res: Response) => {
  const data = await analyticsService.getDashboardSummary();
  res.status(200).json(ApiResponse.ok('Dashboard summary', data));
});

export const getSalesReport = asyncHandler(async (req: Request, res: Response) => {
  const startDate = req.query.startDate
    ? new Date(req.query.startDate as string)
    : dayjs().subtract(30, 'day').toDate();
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
  const data = await analyticsService.getSalesReport(startDate, endDate);
  res.status(200).json(ApiResponse.ok('Sales report', data));
});

export const getCategoryReport = asyncHandler(async (_req: Request, res: Response) => {
  const data = await analyticsService.getCategoryReport();
  res.status(200).json(ApiResponse.ok('Category report', data));
});

export const getUserGrowth = asyncHandler(async (_req: Request, res: Response) => {
  const data = await analyticsService.getUserGrowth();
  res.status(200).json(ApiResponse.ok('User growth', data));
});

export const getTopProducts = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const data = await analyticsService.getTopProducts(limit);
  res.status(200).json(ApiResponse.ok('Top products', data));
});
