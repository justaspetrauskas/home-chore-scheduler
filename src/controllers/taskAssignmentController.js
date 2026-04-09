import { prisma } from "../config/db.js"

const taskAssignmentSelect = {
    id: true,
    eventId: true,
    assignedToId: true,
    date: true,
    status: true,
    completedAt: true,
    room: {
        select: {
            id: true,
            name: true,
        },
    },
    chore: {
        select: {
            id: true,
            title: true,
            points: true,
            roomId: true,
            householdId: true,
        },
    },
}

const formatTaskAssignment = (taskAssignment) => ({
    id: taskAssignment.id,
    eventId: taskAssignment.eventId,
    assignedToUserId: taskAssignment.assignedToId,
    room: taskAssignment.room,
    chore: taskAssignment.chore,
    date: taskAssignment.date,
    status: taskAssignment.status,
    completedAt: taskAssignment.completedAt,
})

const canManageTaskAssignments = async (userId, assignment) => {
    if (assignment.event.createdByUserId === userId) {
        return true
    }

    const membership = await prisma.householdMember.findFirst({
        where: {
            householdId: assignment.event.householdId,
            userId,
        },
        select: { role: true },
    })

    return membership?.role === "ADMIN" || membership?.role === "EVENT_MANAGER"
}

const adjustChoreUsage = async (tx, previousChoreId, nextChoreId) => {
    if (previousChoreId && previousChoreId !== nextChoreId) {
        await tx.chore.updateMany({
            where: {
                id: previousChoreId,
                usageCount: { gt: 0 },
            },
            data: {
                usageCount: { decrement: 1 },
            },
        })
    }

    if (nextChoreId && previousChoreId !== nextChoreId) {
        await tx.chore.update({
            where: { id: nextChoreId },
            data: {
                usageCount: { increment: 1 },
                lastUsedAt: new Date(),
            },
        })
    }
}

const assignChoreToTaskAssignment = async (req, res) => {
    const { id } = req.params
    const { choreId } = req.body

    try {
        const assignment = await prisma.taskAssignment.findUnique({
            where: { id },
            select: {
                id: true,
                choreId: true,
                event: {
                    select: {
                        id: true,
                        householdId: true,
                        createdByUserId: true,
                    },
                },
                room: {
                    select: {
                        id: true,
                    },
                },
            },
        })

        if (!assignment) {
            return res.status(404).json({ error: "Task assignment not found" })
        }

        const canManage = await canManageTaskAssignments(req.user.id, assignment)
        if (!canManage) {
            return res.status(403).json({ error: "Not allowed to assign chores for this task assignment" })
        }

        if (choreId) {
            const chore = await prisma.chore.findFirst({
                where: {
                    id: choreId,
                    householdId: assignment.event.householdId,
                },
                select: {
                    id: true,
                    roomId: true,
                },
            })

            if (!chore) {
                return res.status(404).json({ error: "Chore not found for this household" })
            }

            if (chore.roomId && chore.roomId !== assignment.room.id) {
                return res.status(400).json({ error: "Chore is scoped to a different room" })
            }
        }

        const updatedAssignment = await prisma.$transaction(async (tx) => {
            await adjustChoreUsage(tx, assignment.choreId, choreId)

            return tx.taskAssignment.update({
                where: { id },
                data: { choreId },
                select: taskAssignmentSelect,
            })
        })

        const io = req.app.get("io")
        if (io) {
            io.emit("task-assignment:chore-updated", {
                id: updatedAssignment.id,
                eventId: updatedAssignment.eventId,
                choreId: updatedAssignment.chore?.id ?? null,
            })
        }

        return res.json({
            status: "success",
            data: {
                taskAssignment: formatTaskAssignment(updatedAssignment),
            },
        })
    } catch (error) {
        console.error("Error assigning chore to task assignment:", error)
        return res.status(500).json({ error: "Server error" })
    }
}

const completeTaskAssignment = async (req, res) => {
    const { id } = req.params

    try {
        const assignment = await prisma.taskAssignment.findUnique({
            where: { id },
            select: {
                id: true,
                assignedToId: true,
                status: true,
                completedAt: true,
                event: {
                    select: {
                        id: true,
                        householdId: true,
                        createdByUserId: true,
                    },
                },
                room: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        if (!assignment) {
            return res.status(404).json({ error: "Task assignment not found" })
        }

        const isAssignedUser = assignment.assignedToId === req.user.id
        let isAdmin = false

        if (!isAssignedUser) {
            const membership = await prisma.householdMember.findFirst({
                where: {
                    householdId: assignment.event.householdId,
                    userId: req.user.id,
                },
                select: { role: true },
            })

            isAdmin = membership?.role === "ADMIN"
        }

        if (!isAssignedUser && !isAdmin) {
            return res.status(403).json({
                error: "Only the assigned user or household admin can complete this task assignment",
            })
        }

        if (assignment.status === "completed") {
            return res.status(400).json({ error: "Task assignment is already completed" })
        }

        const completedAt = new Date()
        const updatedAssignment = await prisma.taskAssignment.update({
            where: { id },
            data: {
                status: "completed",
                completedAt,
            },
            select: taskAssignmentSelect,
        })

        const io = req.app.get("io")
        if (io) {
            io.emit("task-assignment:completed", {
                id: updatedAssignment.id,
                eventId: updatedAssignment.eventId,
                completedAt: updatedAssignment.completedAt,
            })
        }

        return res.json({
            status: "success",
            data: {
                taskAssignment: formatTaskAssignment(updatedAssignment),
            },
        })
    } catch (error) {
        console.error("Error completing task assignment:", error)
        return res.status(500).json({ error: "Server error" })
    }
}

export { assignChoreToTaskAssignment, completeTaskAssignment }
