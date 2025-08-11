import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
})

export const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).max(50, { message: 'Name must be less than 50 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' })
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
