import { prisma } from "../config/db.js"

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
            select: {
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
            },
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
                taskAssignment: {
                    id: updatedAssignment.id,
                    assignedToUserId: updatedAssignment.assignedToId,
                    room: updatedAssignment.room,
                    date: updatedAssignment.date,
                    status: updatedAssignment.status,
                    completedAt: updatedAssignment.completedAt,
                },
            },
        })
    } catch (error) {
        console.error("Error completing task assignment:", error)
        return res.status(500).json({ error: "Server error" })
    }
}

export { completeTaskAssignment }
