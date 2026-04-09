import { z } from "zod"

export const assignChoreToTaskAssignmentSchema = z.object({
    choreId: z.string().uuid("Chore ID must be a valid UUID").nullable(),
})