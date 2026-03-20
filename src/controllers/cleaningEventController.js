// controllers/cleaningEventController.js
import { prisma } from "../config/db.js"
import { randomizeChoreAssignments } from "./services/assignmentService.js"

const createCleaningEvent = async (req, res) => {
    const { participantIds, choreIds, scheduledAt } = req.body

    // Validate inputs
    if (!participantIds?.length || !choreIds?.length || !scheduledAt) {
        return res.status(400).json({ error: "Participants, chores, and date required" })
    }

    try {
        // Create the event
        const cleaningEvent = await prisma.cleaningEvent.create({
            data: {
                participants: {
                    connect: participantIds.map(id => ({ id }))
                },
                selectedChores: {
                    connect: choreIds.map(id => ({ id }))
                },
                scheduledAt: new Date(scheduledAt),
                executed: false
            },
            include: {
                participants: {
                    select: { id: true, name: true, email: true }
                },
                selectedChores: {
                    select: { id: true, title: true, points: true }
                }
            }
        })

        // Generate random assignments
        const assignments = await randomizeChoreAssignments(
            participantIds, 
            choreIds, 
            cleaningEvent.id
        )

        if (!assignments.success) {
            // Log error but don't fail event creation
            console.error('Assignment generation failed:', assignments.error)
        }

        res.status(201).json({ 
            status: "success", 
            data: { 
                event: cleaningEvent,
                assignments: assignments.data || []
            } 
        })

    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

const getCleaningEvents = async (req, res) => {
    try {
        const events = await prisma.cleaningEvent.findMany({
            where: {
                participants: {
                    some: { id: req.user.id }
                }
            },
            include: {
                participants: {
                    select: { id: true, name: true }
                },
                selectedChores: {
                    select: { id: true, title: true }
                }
            },
            orderBy: { scheduledAt: 'desc' }
        })

        res.json({ status: "success", data: { events } })
    } catch {
        return res.status(500).json({ error: "Server error" })
    }
}

export { createCleaningEvent, getCleaningEvents }
