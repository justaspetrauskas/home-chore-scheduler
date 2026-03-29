import { z } from "zod"

const distributionModeEnum = z.enum(["random", "balanced"])
const recurrenceRuleEnum = z.enum(["none", "weekly", "biweekly", "monthly"])
const statusEnum = z.enum(["draft", "scheduled", "in_progress", "completed", "canceled"])

export const createCleaningEventSchema = z.object({
	householdId: z.string().uuid("Household ID must be a valid UUID"),
	name: z.string().min(1, "Name is required"),
	eventDate: z.coerce.date({ error: "eventDate must be a valid ISO datetime" }),
	notificationDate: z.coerce.date({ error: "notificationDate must be a valid ISO datetime" }),
	distributionMode: distributionModeEnum.optional(),
	recurrenceRule: recurrenceRuleEnum,
	notifyParticipants: z.boolean(),
	status: statusEnum.optional(),
	participantIds: z.array(z.string().uuid("participantIds must contain valid UUIDs")).min(1, "At least one participant is required"),
	roomIds: z.array(z.string().uuid("roomIds must contain valid UUIDs")).min(1, "At least one room is required"),
}).refine((data) => data.notificationDate <= data.eventDate, {
	message: "notificationDate must be before or equal to eventDate",
	path: ["notificationDate"],
})

export const updateCleaningEventSchema = z.object({
	name: z.string().min(1, "Name cannot be empty").optional(),
	eventDate: z.coerce.date({ error: "eventDate must be a valid ISO datetime" }).optional(),
	notificationDate: z.coerce.date({ error: "notificationDate must be a valid ISO datetime" }).optional(),
	distributionMode: distributionModeEnum.optional(),
	recurrenceRule: recurrenceRuleEnum.optional(),
	notifyParticipants: z.boolean().optional(),
	status: statusEnum.optional(),
}).refine((data) => Object.keys(data).length > 0, {
	message: "At least one field is required for update",
})
