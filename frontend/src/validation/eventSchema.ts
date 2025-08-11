import { z } from 'zod'

export const eventSchema = z.object({
  title: z.string().min(3, { message: 'Title required' }),
  description: z.string().min(10, { message: 'Description required' }),
  date: z.string().min(1, { message: 'Date required' }),
  closingDate: z.string().min(1, { message: 'Closing date required' }),
  location: z.string().optional(),
  capacity: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(n => n > 0, { message: 'Capacity must be > 0' }),
  price: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
  image: z.string().optional()
})

export type EventInput = z.infer<typeof eventSchema>
