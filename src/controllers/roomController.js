import { prisma } from "../config/db.js"

// Create a new room in a household
const createRoom = async (req, res) => {
    const { name, householdId } = req.body
    const userId = req.user.id

    // Check if user is a member of the household
    const membership = await prisma.householdMember.findUnique({
        where: { userId_householdId: { userId, householdId } }
    })

    if (!membership) {
        return res.status(403).json({ error: "Not a member of this household" })
    }

    try {
        const room = await prisma.room.create({
            data: {
                name,
                householdId,
                createdById: userId
            }
        })

        res.status(201).json({ status: "success", data: { room } })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Get all rooms for a household
const getRoomsByHousehold = async (req, res) => {
    const { householdId } = req.params
    const userId = req.user.id

    // Check membership
    const membership = await prisma.householdMember.findUnique({
        where: { userId_householdId: { userId, householdId } }
    })

    if (!membership) {
        return res.status(403).json({ error: "Not a member of this household" })
    }

    try {
        const rooms = await prisma.room.findMany({
            where: { householdId },
            select: {
                id: true,
                name: true,
                createdAt: true,
                createdById: true
            }
        })

        res.json({ status: "success", data: { rooms } })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Get a specific room by ID
const getRoomById = async (req, res) => {
    const { id } = req.params
    const userId = req.user.id

    try {
        const room = await prisma.room.findUnique({
            where: { id },
            include: { household: { include: { members: true } } }
        })

        if (!room) {
            return res.status(404).json({ error: "Room not found" })
        }

        // Check if user is member of the household
        const isMember = room.household.members.some(member => member.userId === userId)
        if (!isMember) {
            return res.status(403).json({ error: "Not authorized to view this room" })
        }

        res.json({ status: "success", data: { room: {
            id: room.id,
            name: room.name,
            householdId: room.householdId,
            createdAt: room.createdAt
        } } })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Update a room
const updateRoom = async (req, res) => {
    const { id } = req.params
    const { name } = req.body
    const userId = req.user.id

    try {
        const room = await prisma.room.findUnique({
            where: { id },
            include: { household: { include: { members: true } } }
        })

        if (!room) {
            return res.status(404).json({ error: "Room not found" })
        }

        // Check membership
        const isMember = room.household.members.some(member => member.userId === userId)
        if (!isMember) {
            return res.status(403).json({ error: "Not authorized to update this room" })
        }

        const updatedRoom = await prisma.room.update({
            where: { id },
            data: { name }
        })

        res.json({ status: "success", data: { room: {
            id: updatedRoom.id,
            name: updatedRoom.name,
            householdId: updatedRoom.householdId,
            createdAt: updatedRoom.createdAt
        } } })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Delete a room and cascade delete related chores and task assignments
const deleteRoom = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const room = await prisma.room.findUnique({
            where: { id },
            include: { household: { include: { members: true } } }
        });

        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }

        // Check membership
        const isMember = room.household.members.some(member => member.userId === userId);
        if (!isMember) {
            return res.status(403).json({ error: "Not authorized to delete this room" });
        }

        // Delete related task assignments
        await prisma.taskAssignment.deleteMany({ where: { roomId: id } });
        // Delete related chores
        await prisma.chore.deleteMany({ where: { roomId: id } });

        // Delete the room itself
        await prisma.room.delete({ where: { id } });

        res.json({ status: "success", message: "Room and related data deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all room types
const getRoomTypes = async (req, res) => {
    try {
        const roomTypes = await prisma.roomType.findMany({
            select: {
                id: true,
                key: true,
                label: true,
                isDefault: true,
                createdAt: true
            }
        })
        res.json({ status: "success", data: { roomTypes } })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export { createRoom, getRoomsByHousehold, getRoomById, updateRoom, deleteRoom, getRoomTypes }