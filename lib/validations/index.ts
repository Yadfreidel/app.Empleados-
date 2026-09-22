// lib/validations/index.ts
import { z } from 'zod'

// ─── Activity ─────────────────────────────────────────────────────
export const activitySchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres').max(120),
  description: z.string().max(1000).optional().default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
  end_time: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
  hotel_id: z.string().uuid('Debe seleccionar un hotel válido'),
  operation_type_id: z.string().uuid('Debe seleccionar un tipo de operación válido'),
  status: z.enum(['programado', 'en_progreso', 'completado', 'cancelado', 'postpuesto']),
  priority: z.enum(['baja', 'normal', 'alta', 'urgente']),
  color_override: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().or(z.literal('')),
  published: z.boolean().default(true),
  notes: z.string().max(2000).optional().default(''),
})

export type ActivityInput = z.infer<typeof activitySchema>

// ─── Hotel ────────────────────────────────────────────────────────
export const hotelSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  location: z.string().max(200).optional().default(''),
  code: z.string().max(20).optional().default(''),
  active: z.boolean().default(true),
  notes: z.string().max(500).optional().default(''),
})

export type HotelInput = z.infer<typeof hotelSchema>

// ─── Operation Type ───────────────────────────────────────────────
export const operationTypeSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(80),
  description: z.string().max(300).optional().default(''),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color hexadecimal inválido'),
  icon: z.string().max(50).optional().default(''),
  active: z.boolean().default(true),
})

export type OperationTypeInput = z.infer<typeof operationTypeSchema>

// ─── Login ────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type LoginInput = z.infer<typeof loginSchema>
