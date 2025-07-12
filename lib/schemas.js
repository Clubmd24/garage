import { z } from 'zod';

export const CreateClientSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  garage_name: z.string().optional(),
  vehicle_reg: z.string().optional(),
  mobile: z.string().optional(),
  landline: z.string().optional(),
  nie_number: z.string().optional(),
  street_address: z.string().optional(),
  town: z.string().optional(),
  province: z.string().optional(),
  post_code: z.string().optional(),
  password: z.string().optional(),
});

export const UpdateClientSchema = CreateClientSchema.partial();

export const CreateApprenticeSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  standard_id: z.number().optional(),
});

export const UpdateApprenticeSchema = CreateApprenticeSchema.partial();
