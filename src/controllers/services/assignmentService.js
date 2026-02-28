// services/assignmentService.js
import { prisma } from "../config/db.js"

export const randomizeChoreAssignments = async (userIds, choreIds, eventId) => {
    try {
        // Fisher-Yates shuffle for fair random distribution
        const shuffledChores = [...choreIds].sort(() => Math.random() - 0.5)
        const shuffledUsers = [...userIds].sort(() => Math.random() - 0.5)
        
        const assignments = []

        // Distribute chores fairly (round-robin style)
        for (let i = 0; i < shuffledChores.length; i++) {
            const userIndex = i % shuffledUsers.length
            const assignmentData = {
                userId: shuffledUsers[userIndex],
                choreId: shuffledChores[i],
                eventId
            }

            // Create assignment
            const assignment = await prisma.assignment.create({
                data: assignmentData,
                include: {
                    user: { select: { id: true, name: true } },
                    chore: { select: { id: true, title: true, points: true } }
                }
            })

            assignments.push(assignment)
        }

        return {
            success: true,
            data: assignments
        }
    } catch (error) {
        return {
            success: false,
            error: error.message
        }
    }
}
