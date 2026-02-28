import { z } from 'zod'

// Base schema (shared fields)
const choreBaseSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    area: z.enum([
        "EVERYWHERE",
        "KITCHEN",
        "BATHROOM",
        "BEDROOM",
        "LIVING_ROOM",
        "DINING_ROOM",
        "OFFICE",
        "LAUNDRY_ROOM",
        "GARAGE",
        "BALCONY",
        "OUTSIDE_PATIO",
        "GARDEN"
    ], {
        error: () => ({
            message: "Area must be one of: EVERYWHERE, KITCHEN, BATHROOM, BEDROOM, LIVING_ROOM, DINING_ROOM, OFFICE, LAUNDRY_ROOM, GARAGE, BALCONY, OUTSIDE_PATIO, GARDEN"
        })
    }).optional(),
    points: z.coerce.number()
        .int("Points must be whole number")
        .min(1, "Points must be at least 1")
        .max(100, "Points must be 100 or less")
        .optional(),
})


export const createChoreSchema = choreBaseSchema
    .refine(data => data.title, {
        message: "Title is required for creation",
        path: ["title"]
    })


export const updateChoreSchema = choreBaseSchema.partial()

