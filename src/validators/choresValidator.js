import { z } from 'zod'

// Base schema (shared fields)
const choreBaseSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    householdId: z.string().uuid("Household ID must be a valid UUID").optional(),
    roomId: z.string().uuid("Room ID must be a valid UUID").optional(),
    points: z.coerce.number()
        .int("Points must be whole number")
        .min(0, "Points must be at least 0")
        .max(100, "Points must be 100 or less")
        .optional(),
})


export const createChoreSchema = choreBaseSchema
    .refine(data => data.title, {
        message: "Title is required for creation",
        path: ["title"]
    })


export const updateChoreSchema = choreBaseSchema.partial()

