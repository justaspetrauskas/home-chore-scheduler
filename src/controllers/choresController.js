import { prisma } from "../config/db.js"
import { buildCanonicalChoreTitle } from "../utils/choreTitle.js"

const choreSelect = {
    id: true,
    title: true,
    description: true,
    points: true,
    roomId: true,
    householdId: true,
    createdById: true,
    createdAt: true,
    usageCount: true,
    lastUsedAt: true,
    canonicalTitle: true,
}

const formatChore = (chore) => ({
    id: chore.id,
    title: chore.title,
    description: chore.description,
    points: chore.points,
    roomId: chore.roomId,
    householdId: chore.householdId,
    createdById: chore.createdById,
    createdAt: chore.createdAt,
    usageCount: chore.usageCount,
    lastUsedAt: chore.lastUsedAt,
    canonicalTitle: chore.canonicalTitle,
})

const getMemberships = (userId) => prisma.householdMember.findMany({
    where: { userId },
    select: { householdId: true, role: true },
})

const resolveHouseholdId = async (req, requestedHouseholdId) => {
    const memberships = await getMemberships(req.user.id)

    if (!memberships.length) {
        return { error: { status: 403, body: { error: "You must belong to a household to manage chores" } } }
    }

    if (requestedHouseholdId) {
        const membership = memberships.find(({ householdId }) => householdId === requestedHouseholdId)

        if (!membership) {
            return { error: { status: 403, body: { error: "Not authorized for this household" } } }
        }

        return { householdId: requestedHouseholdId, membership }
    }

    if (req.user.defaultHouseholdId) {
        const membership = memberships.find(({ householdId }) => householdId === req.user.defaultHouseholdId)
        if (membership) {
            return { householdId: req.user.defaultHouseholdId, membership }
        }
    }

    if (memberships.length === 1) {
        return { householdId: memberships[0].householdId, membership: memberships[0] }
    }

    return { error: { status: 400, body: { error: "householdId is required when you belong to multiple households" } } }
}

const validateRoomForHousehold = async (roomId, householdId) => {
    if (!roomId) return null

    const room = await prisma.room.findFirst({
        where: {
            id: roomId,
            householdId,
        },
        select: { id: true },
    })

    return room ? null : { status: 400, body: { error: "Room does not belong to this household" } }
}

const getChoreWithAccess = async (choreId, userId) => {
    const chore = await prisma.chore.findUnique({
        where: { id: choreId },
        select: choreSelect,
    })

    if (!chore) {
        return { error: { status: 404, body: { error: "Chore not found" } } }
    }

    const membership = await prisma.householdMember.findFirst({
        where: {
            householdId: chore.householdId,
            userId,
        },
        select: { role: true },
    })

    if (!membership) {
        return { error: { status: 403, body: { error: "Not authorized for this household" } } }
    }

    return { chore, membership }
}

const createChore = async (req, res) => {
    const { title, description, points, householdId: requestedHouseholdId, roomId } = req.body

    const householdContext = await resolveHouseholdId(req, requestedHouseholdId)
    if (householdContext.error) {
        return res.status(householdContext.error.status).json(householdContext.error.body)
    }

    const canonicalTitle = buildCanonicalChoreTitle(title)
    if (!canonicalTitle) {
        return res.status(400).json({ error: "Title is required" })
    }

    const roomError = await validateRoomForHousehold(roomId, householdContext.householdId)
    if (roomError) {
        return res.status(roomError.status).json(roomError.body)
    }

    try {
        const existingChore = await prisma.chore.findFirst({
            where: {
                householdId: householdContext.householdId,
                canonicalTitle,
            },
            select: choreSelect,
        })

        if (existingChore) {
            return res.status(200).json({
                status: "success",
                data: {
                    chore: formatChore(existingChore),
                    reused: true,
                },
            })
        }

        const chore = await prisma.chore.create({
            data: {
                title,
                canonicalTitle,
                description: description || null,
                points: points ?? 0,
                roomId: roomId || null,
                householdId: householdContext.householdId,
                createdById: req.user.id,
            },
            select: choreSelect,
        })

        return res.status(201).json({
            status: "success",
            data: {
                chore: formatChore(chore),
                reused: false,
            },
        })
    } catch (error) {
        if (error.code === "P2002") {
            const existingChore = await prisma.chore.findFirst({
                where: {
                    householdId: householdContext.householdId,
                    canonicalTitle,
                },
                select: choreSelect,
            })

            if (existingChore) {
                return res.status(200).json({
                    status: "success",
                    data: {
                        chore: formatChore(existingChore),
                        reused: true,
                    },
                })
            }
        }

        return res.status(500).json({ error: "Server error" })
    }
}

const deleteChore = async (req, res) => {
    const { id } = req.params

    const choreContext = await getChoreWithAccess(id, req.user.id)
    if (choreContext.error) {
        return res.status(choreContext.error.status).json(choreContext.error.body)
    }

    if (choreContext.chore.createdById !== req.user.id && choreContext.membership.role !== "ADMIN") {
        return res.status(403).json({ error: "Not allowed to delete this chore" })
    }

    await prisma.chore.delete({
        where: { id },
    })

    return res.status(204).send()
}

const updateChore = async (req, res) => {
    const { id } = req.params
    const { title, description, points, roomId } = req.body

    const choreContext = await getChoreWithAccess(id, req.user.id)
    if (choreContext.error) {
        return res.status(choreContext.error.status).json(choreContext.error.body)
    }

    if (choreContext.chore.createdById !== req.user.id && choreContext.membership.role !== "ADMIN") {
        return res.status(403).json({ error: "Not allowed to update this chore" })
    }

    const nextTitle = title || choreContext.chore.title
    const canonicalTitle = buildCanonicalChoreTitle(nextTitle)
    const nextRoomId = roomId !== undefined ? roomId : choreContext.chore.roomId

    const roomError = await validateRoomForHousehold(nextRoomId, choreContext.chore.householdId)
    if (roomError) {
        return res.status(roomError.status).json(roomError.body)
    }

    try {
        const duplicateChore = await prisma.chore.findFirst({
            where: {
                householdId: choreContext.chore.householdId,
                canonicalTitle,
                id: { not: id },
            },
            select: choreSelect,
        })

        if (duplicateChore) {
            return res.json({
                status: "success",
                data: {
                    chore: formatChore(duplicateChore),
                    reused: true,
                },
            })
        }

        const updatedChore = await prisma.chore.update({
            where: { id },
            data: {
                title: nextTitle,
                canonicalTitle,
                description: description !== undefined ? description : choreContext.chore.description,
                points: points ?? choreContext.chore.points,
                roomId: nextRoomId || null,
            },
            select: choreSelect,
        })

        res.json({
            status: "success",
            data: {
                chore: formatChore(updatedChore),
                reused: false,
            },
        })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

const getAllChores = async (req, res) => {
    try {
        const householdContext = await resolveHouseholdId(req, req.query.householdId)
        if (householdContext.error) {
            return res.status(householdContext.error.status).json(householdContext.error.body)
        }

        const chores = await prisma.chore.findMany({
            where: {
                householdId: householdContext.householdId,
            },
            select: choreSelect,
            orderBy: [
                { usageCount: "desc" },
                { lastUsedAt: "desc" },
                { title: "asc" },
            ],
        })

        res.json({ status: "success", data: { chores: chores.map(formatChore) } })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

const getSuggestedChores = async (req, res) => {
    const { householdId: requestedHouseholdId, query, roomId } = req.query
    const requestedLimit = Number(req.query.limit)
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 25)
        : 10

    try {
        const householdContext = await resolveHouseholdId(req, requestedHouseholdId)
        if (householdContext.error) {
            return res.status(householdContext.error.status).json(householdContext.error.body)
        }

        const roomError = await validateRoomForHousehold(roomId, householdContext.householdId)
        if (roomError) {
            return res.status(roomError.status).json(roomError.body)
        }

        const normalizedQuery = query ? buildCanonicalChoreTitle(query) : ""
        const searchFilters = query
            ? {
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    ...(normalizedQuery ? [{ canonicalTitle: { contains: normalizedQuery, mode: "insensitive" } }] : []),
                ],
            }
            : {}

        const chores = await prisma.chore.findMany({
            where: {
                householdId: householdContext.householdId,
                ...(roomId ? { OR: [{ roomId }, { roomId: null }] } : {}),
                ...searchFilters,
            },
            select: choreSelect,
            orderBy: [
                { usageCount: "desc" },
                { lastUsedAt: "desc" },
                { createdAt: "desc" },
            ],
            take: limit,
        })

        return res.json({ status: "success", data: { chores: chores.map(formatChore) } })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

const getChoreById = async (req, res) => {
    const { id } = req.params

    try {
        const choreContext = await getChoreWithAccess(id, req.user.id)
        if (choreContext.error) {
            return res.status(choreContext.error.status).json(choreContext.error.body)
        }

        res.json({ status: "success", data: { chore: formatChore(choreContext.chore) } })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

export { createChore, updateChore, deleteChore, getAllChores, getSuggestedChores, getChoreById }



