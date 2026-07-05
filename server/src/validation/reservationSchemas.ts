import { z } from 'zod';
import { VehicleCategory } from '../domain/VehicleCategory';

const categorySchema = z.nativeEnum(VehicleCategory);

export const optionsSchema = z.object({
  startDate: z.string().date('startDate must be a valid date (YYYY-MM-DD)'),
  endDate: z.string().date('endDate must be a valid date (YYYY-MM-DD)'),
  dailyMileage: z.number().nonnegative().optional(),
});

export const reserveSchema = z.object({
  category: categorySchema,
  startDate: z.string().date(),
  endDate: z.string().date(),
  dailyMileage: z.number().nonnegative().optional(),
});

export const modifySchema = z.object({
  category: categorySchema.optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  dailyMileage: z.number().nonnegative().optional(),
});