// controllers/cleaningEventController.js
import { prisma } from "../config/db.js"

const formatEventForClient = (event, householdMembers = []) => {
    const userIdToHouseholdMemberId = new Map(
        householdMembers.map((member) => [member.userId, member.id]),
    )

    const participantMemberIds = (event.participants || [])
        .map((participant) => userIdToHouseholdMemberId.get(participant.userId))
        .filter(Boolean)

    const taskAssignments = (event.tasks || []).map((task) => ({
        id: task.id,
        assignedToUserId: task.assignedToId,
        room: task.room,
        date: task.date,
        status: task.status,
        completedAt: task.completedAt,
    }))

    const taskAssignmentsCount = taskAssignments.length
    const completedTaskAssignments = taskAssignments.filter((task) => task.status === "completed").length
    const scheduledTaskAssignments = taskAssignments.filter((task) => task.status === "scheduled").length
    const postDueTaskAssignments = taskAssignments.filter((task) => task.status === "post_due").length
    const uniqueAssignedUsersCount = new Set(
        taskAssignments.map((task) => task.assignedToUserId).filter(Boolean),
    ).size
    const completionRate = taskAssignmentsCount > 0
        ? Number(((completedTaskAssignments / taskAssignmentsCount) * 100).toFixed(2))
        : 0

    return {
        id: event.id,
        name: event.name,
        eventDate: event.eventDate,
        notificationDate: event.notificationDate,
        distributionMode: event.distributionMode,
        recurrenceRule: event.recurrenceRule,
        notifyParticipants: event.notifyParticipants,
        status: event.status,
        householdId: event.householdId,
        createdByUserId: event.createdByUserId,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        participants: participantMemberIds,
        taskAssignments,
        insights: {
            participantsCount: participantMemberIds.length,
            taskAssignmentsCount,
            completedTaskAssignments,
            scheduledTaskAssignments,
            postDueTaskAssignments,
            uniqueAssignedUsersCount,
            completionRate,
        },
    }
}

const buildEventsInsights = (events) => {
    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)

    const totals = {
        events: events.length,
        participants: 0,
        taskAssignments: 0,
        completedTaskAssignments: 0,
        scheduledTaskAssignments: 0,
        postDueTaskAssignments: 0,
        upcomingEvents: 0,
        todayEvents: 0,
        completionRate: 0,
    }

    const statusBreakdown = {
        draft: 0,
        scheduled: 0,
        in_progress: 0,
        completed: 0,
        canceled: 0,
    }

    const distributionModeBreakdown = {
        random: 0,
        balanced: 0,
    }

    const recurrenceBreakdown = {
        none: 0,
        weekly: 0,
        biweekly: 0,
        monthly: 0,
    }

    const householdMap = new Map()

    let firstEventDate = null
    let lastEventDate = null

    events.forEach((event) => {
        const eventDate = new Date(event.eventDate)

        if (!firstEventDate || eventDate < firstEventDate) firstEventDate = eventDate
        if (!lastEventDate || eventDate > lastEventDate) lastEventDate = eventDate

        totals.participants += event.participants.length
        totals.taskAssignments += event.insights.taskAssignmentsCount
        totals.completedTaskAssignments += event.insights.completedTaskAssignments
        totals.scheduledTaskAssignments += event.insights.scheduledTaskAssignments
        totals.postDueTaskAssignments += event.insights.postDueTaskAssignments

        if (eventDate > now) totals.upcomingEvents += 1
        if (eventDate >= startOfToday && eventDate <= endOfToday) totals.todayEvents += 1

        if (Object.prototype.hasOwnProperty.call(statusBreakdown, event.status)) {
            statusBreakdown[event.status] += 1
        }

        if (Object.prototype.hasOwnProperty.call(distributionModeBreakdown, event.distributionMode)) {
            distributionModeBreakdown[event.distributionMode] += 1
        }

        if (Object.prototype.hasOwnProperty.call(recurrenceBreakdown, event.recurrenceRule)) {
            recurrenceBreakdown[event.recurrenceRule] += 1
        }

        const existing = householdMap.get(event.householdId) || {
            householdId: event.householdId,
            events: 0,
            participants: 0,
            taskAssignments: 0,
            completedTaskAssignments: 0,
        }

        existing.events += 1
        existing.participants += event.participants.length
        existing.taskAssignments += event.insights.taskAssignmentsCount
        existing.completedTaskAssignments += event.insights.completedTaskAssignments

        householdMap.set(event.householdId, existing)
    })

    totals.completionRate = totals.taskAssignments > 0
        ? Number(((totals.completedTaskAssignments / totals.taskAssignments) * 100).toFixed(2))
        : 0

    const householdBreakdown = Array.from(householdMap.values()).map((household) => ({
        ...household,
        completionRate: household.taskAssignments > 0
            ? Number(((household.completedTaskAssignments / household.taskAssignments) * 100).toFixed(2))
            : 0,
    }))

    return {
        totals,
        statusBreakdown,
        distributionModeBreakdown,
        recurrenceBreakdown,
        dateRange: {
            firstEventDate,
            lastEventDate,
        },
        householdBreakdown,
    }
}

const shuffle = (items) => {
    const arr = [...items]
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = arr[i]
        arr[i] = arr[j]
        arr[j] = temp
    }
    return arr
}

const buildAssignmentsFromRooms = (
    roomIds,
    participantUserIds,
    distributionMode,
    assignmentDate,
    historicalAssignmentCounts = new Map(),
) => {
    if (!roomIds.length || !participantUserIds.length) return []

    const shuffledRooms = shuffle(roomIds)
    const shuffledUsers = shuffle(participantUserIds)

    // Case A: more users than rooms -> some rooms get multiple users.
    if (participantUserIds.length >= roomIds.length) {
        if (distributionMode === "balanced") {
            const orderedUsers = [...participantUserIds].sort((a, b) => {
                const countA = historicalAssignmentCounts.get(a) || 0
                const countB = historicalAssignmentCounts.get(b) || 0
                if (countA === countB) return Math.random() - 0.5
                return countA - countB
            })

            return orderedUsers.map((userId, index) => ({
                roomId: shuffledRooms[index % shuffledRooms.length],
                assignedToId: userId,
                date: assignmentDate,
                status: "scheduled",
            }))
        }

        return shuffledUsers.map((userId, index) => ({
            roomId: shuffledRooms[index % shuffledRooms.length],
            assignedToId: userId,
            date: assignmentDate,
            status: "scheduled",
        }))
    }

    // Case B: more rooms than users -> some users get multiple rooms.
    if (distributionMode === "balanced") {
        const runningCounts = new Map(
            participantUserIds.map((userId) => [userId, historicalAssignmentCounts.get(userId) || 0]),
        )

        return shuffledRooms.map((roomId) => {
            const minCount = Math.min(...participantUserIds.map((userId) => runningCounts.get(userId) || 0))
            const leastLoadedUsers = participantUserIds.filter(
                (userId) => (runningCounts.get(userId) || 0) === minCount,
            )
            const selectedUserId = leastLoadedUsers[Math.floor(Math.random() * leastLoadedUsers.length)]
            runningCounts.set(selectedUserId, (runningCounts.get(selectedUserId) || 0) + 1)

            return {
                roomId,
                assignedToId: selectedUserId,
                date: assignmentDate,
                status: "scheduled",
            }
        })
    }

    return shuffledRooms.map((roomId) => ({
        roomId,
        assignedToId: shuffledUsers[Math.floor(Math.random() * shuffledUsers.length)],
        date: assignmentDate,
        status: "scheduled",
    }))
}

const getHistoricalAssignmentCounts = async (householdId, participantUserIds) => {
    if (!participantUserIds.length) {
        return new Map()
    }

    const historicalAssignments = await prisma.taskAssignment.findMany({
        where: {
            assignedToId: { in: participantUserIds },
            event: {
                householdId,
            },
        },
        select: {
            assignedToId: true,
        },
    })

    return historicalAssignments.reduce((acc, assignment) => {
        if (!assignment.assignedToId) return acc
        acc.set(assignment.assignedToId, (acc.get(assignment.assignedToId) || 0) + 1)
        return acc
    }, new Map())
}

const createCleaningEvent = async (req, res) => {
    const {
        householdId,
        name,
        eventDate,
        notificationDate,
        distributionMode,
        recurrenceRule,
        notifyParticipants,
        status,
        participantIds,
        roomIds,
    } = req.body

    try {
        const membership = await prisma.householdMember.findFirst({
            where: {
                householdId,
                userId: req.user.id,
            },
        })

        if (!membership) {
            return res.status(403).json({ error: "Not authorized for this household" })
        }

        const requestedRoomIds = [...new Set(Array.isArray(roomIds) ? roomIds : [])]
        const participantIdsToCreate = Array.isArray(participantIds) ? [...new Set(participantIds)] : []
        const householdMembers = await prisma.householdMember.findMany({
            where: { householdId },
            select: { id: true, userId: true },
        })

        const householdMemberIdToUserId = new Map(
            householdMembers.map((member) => [member.id, member.userId]),
        )
        const householdUserIds = new Set(householdMembers.map((member) => member.userId))
        let participantUserIdsToCreate = []

        if (participantIdsToCreate.length > 0) {
            participantUserIdsToCreate = [
                ...new Set(
                    participantIdsToCreate
                        .map((participantId) => {
                            if (householdMemberIdToUserId.has(participantId)) {
                                return householdMemberIdToUserId.get(participantId)
                            }

                            if (householdUserIds.has(participantId)) {
                                return participantId
                            }

                            return null
                        })
                        .filter(Boolean),
                ),
            ]

            const invalidParticipants = participantIdsToCreate.filter((participantId) => {
                return !householdMemberIdToUserId.has(participantId) && !householdUserIds.has(participantId)
            })

            if (invalidParticipants.length > 0) {
                return res.status(400).json({
                    error: "Some participantIds are invalid for this household (use householdMember.id or user.id)",
                })
            }
        }

        const validRooms = await prisma.room.findMany({
            where: {
                id: { in: requestedRoomIds },
                householdId,
            },
            select: { id: true },
        })

        if (validRooms.length !== requestedRoomIds.length) {
            return res.status(400).json({
                error: "Some roomIds are invalid for this household",
            })
        }

        const effectiveDistributionMode = distributionMode ?? "balanced"
        const historicalAssignmentCounts = await getHistoricalAssignmentCounts(
            householdId,
            participantUserIdsToCreate,
        )

        const taskAssignmentsToCreate = buildAssignmentsFromRooms(
            requestedRoomIds,
            participantUserIdsToCreate,
            effectiveDistributionMode,
            new Date(eventDate),
            historicalAssignmentCounts,
        )

        const cleaningEvent = await prisma.cleaningEvent.create({
            data: {
                householdId,
                name,
                eventDate: new Date(eventDate),
                notificationDate: new Date(notificationDate),
                distributionMode: effectiveDistributionMode,
                recurrenceRule,
                notifyParticipants,
                status: status ?? "scheduled",
                createdByUserId: req.user.id,
                participants: participantUserIdsToCreate.length
                    ? {
                        create: participantUserIdsToCreate.map((userId) => ({ userId })),
                    }
                    : undefined,
                tasks: taskAssignmentsToCreate.length
                    ? {
                        create: taskAssignmentsToCreate,
                    }
                    : undefined,
            },
            include: {
                participants: {
                    select: {
                        userId: true,
                    },
                },
                tasks: {
                    select: {
                        id: true,
                        roomId: true,
                        assignedToId: true,
                        date: true,
                        status: true,
                        completedAt: true,
                        room: { select: { id: true, name: true } },
                    },
                },
            },
        })

        const eventForClient = formatEventForClient(cleaningEvent, householdMembers)

        const io = req.app.get("io")
        if (io) {
            io.emit("cleaning-event:created", {
                id: cleaningEvent.id,
                householdId: cleaningEvent.householdId,
                eventDate: cleaningEvent.eventDate,
                status: cleaningEvent.status,
            })
        }

        res.status(201).json({
            status: "success",
            data: {
                event: eventForClient,
            },
        })
    } catch (error) {
        console.error("Error creating cleaning event:", error)
        return res.status(500).json({ error: "Server error" })
    }
}

const getCleaningEvents = async (req, res) => {
    try {
        const householdIds = (
            await prisma.householdMember.findMany({
                where: { userId: req.user.id },
                select: { householdId: true },
            })
        ).map((membership) => membership.householdId)

        const householdMembers = await prisma.householdMember.findMany({
            where: {
                householdId: { in: householdIds },
            },
            select: {
                id: true,
                userId: true,
                householdId: true,
            },
        })

        const membersByHouseholdId = householdMembers.reduce((acc, member) => {
            if (!acc[member.householdId]) {
                acc[member.householdId] = []
            }
            acc[member.householdId].push(member)
            return acc
        }, {})

        const events = await prisma.cleaningEvent.findMany({
            where: {
                householdId: { in: householdIds },
            },
            include: {
                participants: {
                    select: {
                        userId: true,
                    },
                },
                tasks: {
                    select: {
                        id: true,
                        roomId: true,
                        assignedToId: true,
                        date: true,
                        status: true,
                        completedAt: true,
                        room: { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: { eventDate: "desc" },
        })

        const formattedEvents = events.map((event) => {
            const members = membersByHouseholdId[event.householdId] || []
            return formatEventForClient(event, members)
        })

        const insights = buildEventsInsights(formattedEvents)

        res.json({ status: "success", data: { events: formattedEvents, insights } })
    } catch (error) {
        console.error("Error fetching cleaning events:", error)
        return res.status(500).json({ error: "Server error" })
    }
}

const updateCleaningEvent = async (req, res) => {
    const { id } = req.params

    try {
        const existingEvent = await prisma.cleaningEvent.findUnique({
            where: { id },
            select: {
                id: true,
                householdId: true,
                eventDate: true,
                notificationDate: true,
            },
        })

        if (!existingEvent) {
            return res.status(404).json({ error: "Cleaning event not found" })
        }

        const membership = await prisma.householdMember.findFirst({
            where: {
                householdId: existingEvent.householdId,
                userId: req.user.id,
            },
        })

        if (!membership) {
            return res.status(403).json({ error: "Not authorized for this household" })
        }

        const nextEventDate = req.body.eventDate
            ? new Date(req.body.eventDate)
            : existingEvent.eventDate
        const nextNotificationDate = req.body.notificationDate
            ? new Date(req.body.notificationDate)
            : existingEvent.notificationDate

        if (nextNotificationDate > nextEventDate) {
            return res.status(400).json({
                error: "notificationDate must be before or equal to eventDate",
            })
        }

        const data = {}
        if (req.body.name !== undefined) data.name = req.body.name
        if (req.body.eventDate !== undefined) data.eventDate = new Date(req.body.eventDate)
        if (req.body.notificationDate !== undefined) data.notificationDate = new Date(req.body.notificationDate)
        if (req.body.distributionMode !== undefined) data.distributionMode = req.body.distributionMode
        if (req.body.recurrenceRule !== undefined) data.recurrenceRule = req.body.recurrenceRule
        if (req.body.notifyParticipants !== undefined) data.notifyParticipants = req.body.notifyParticipants
        if (req.body.status !== undefined) data.status = req.body.status

        const event = await prisma.cleaningEvent.update({
            where: { id },
            data,
        })

        const io = req.app.get("io")
        if (io) {
            io.emit("cleaning-event:updated", {
                id: event.id,
                householdId: event.householdId,
                eventDate: event.eventDate,
                status: event.status,
            })
        }

        return res.json({ status: "success", data: { event } })
    } catch (error) {
        console.error("Error updating cleaning event:", error)
        return res.status(500).json({ error: "Server error" })
    }
}

const deleteCleaningEvent = async (req, res) => {
    const { id } = req.params

    try {
        const existingEvent = await prisma.cleaningEvent.findUnique({
            where: { id },
            select: {
                id: true,
                householdId: true,
                createdByUserId: true,
            },
        })

        if (!existingEvent) {
            return res.status(404).json({ error: "Cleaning event not found" })
        }

        const isCreator = existingEvent.createdByUserId === req.user.id
        let isAdmin = false

        if (!isCreator) {
            const membership = await prisma.householdMember.findFirst({
                where: {
                    householdId: existingEvent.householdId,
                    userId: req.user.id,
                },
                select: { role: true },
            })

            isAdmin = membership?.role === "ADMIN"
        }

        if (!isCreator && !isAdmin) {
            return res.status(403).json({
                error: "Only the event creator or household admin can delete this event",
            })
        }

        await prisma.$transaction([
            prisma.taskAssignment.deleteMany({ where: { eventId: id } }),
            prisma.cleaningEventParticipant.deleteMany({ where: { eventId: id } }),
            prisma.cleaningEvent.delete({ where: { id } }),
        ])

        const io = req.app.get("io")
        if (io) {
            io.emit("cleaning-event:deleted", {
                id: existingEvent.id,
                householdId: existingEvent.householdId,
            })
        }

        return res.json({
            status: "success",
            message: "Cleaning event deleted successfully",
        })
    } catch (error) {
        console.error("Error deleting cleaning event:", error)
        return res.status(500).json({ error: "Server error" })
    }
}

export { createCleaningEvent, getCleaningEvents, updateCleaningEvent, deleteCleaningEvent }
