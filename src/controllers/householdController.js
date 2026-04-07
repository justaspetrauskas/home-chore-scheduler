// Delete a household (only owner can delete)
const deleteHousehold = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is the owner
    const household = await prisma.household.findUnique({ where: { id } });
    if (!household) return res.status(404).json({ error: 'Household not found' });
    if (household.ownerId !== userId) {
      return res.status(403).json({ error: 'Only the owner can delete the household' });
    }

    // Delete all related memberships first
    await prisma.householdMember.deleteMany({ where: { householdId: id } });
    // Now delete the household
    await prisma.household.delete({ where: { id } });
    res.json({ status: 'success', message: 'Household deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Set a household as the user's default household
const setDefaultHouseholdForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { householdId } = req.body;

    // Check membership
    const membership = await prisma.householdMember.findUnique({
      where: { userId_householdId: { userId, householdId } }
    });
    if (!membership) {
      return res.status(403).json({ error: 'User is not a member of this household' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { defaultHouseholdId: householdId }
    });
    res.json({ status: 'success', defaultHouseholdId: householdId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
import { randomBytes } from "node:crypto";
import { prisma } from "../config/db.js";

// Create a new household
const createHousehold = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const household = await prisma.household.create({
      data: {
        name,
        ownerId: userId,
        members: {
          create: { userId, role: 'ADMIN' }
        }
      },
      include: { members: true }
    });

    res.status(201).json(household);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all households of a user
const getUserHouseholds = async (req, res) => {
  try {
    const userId = req.user.id;

    const households = await prisma.householdMember.findMany({
      where: { userId },
      include: {
        household: {
          include: {
            members: { include: { user: true } },
            rooms: true,
            events: true
          }
        }
      }
    });

    res.json(households.map(hm => hm.household));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific household by ID
const getHouseholdById = async (req, res) => {
  try {
    const { id } = req.params;

    const household = await prisma.household.findUnique({
      where: { id },
      include: {
        members: { include: { user: true } },
        rooms: true,
        events: true
      }
    });

    if (!household) return res.status(404).json({ error: 'Household not found' });
    res.json(household);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Invite a user to household
const inviteMember = async (req, res) => {
  try {
    const { householdId } = req.params;
    const { email, role } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existingMember = await prisma.householdMember.findUnique({
      where: { userId_householdId: { userId: user.id, householdId } }
    });

    if (existingMember) return res.status(400).json({ error: 'User already a member' });

    const membership = await prisma.householdMember.create({
      data: {
        userId: user.id,
        householdId,
        role: role ? role.toUpperCase() : 'MEMBER'
      }
    });

    res.json(membership);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Create invitation token for household onboarding
const createInvitation = async (req, res) => {
  try {
    const { id: householdId } = req.params;
    const { email } = req.body;
    const userId = req.user.id;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    const membership = await prisma.householdMember.findUnique({
      where: { userId_householdId: { userId, householdId } },
    });

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this household" });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await prisma.invitation.create({
      data: {
        householdId,
        email: normalizedEmail,
        token,
        expiresAt,
      },
    });

    res.status(201).json(invitation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a room for a household (with optional auto-naming)
const createRoomForHousehold = async (req, res) => {
  try {
    const { householdId } = req.params;
    const { name, roomTypeId } = req.body;
    const userId = req.user.id;

    // Check if user is a member of the household
    const membership = await prisma.householdMember.findUnique({
      where: { userId_householdId: { userId, householdId } }
    });
    if (!membership) {
      return res.status(403).json({ error: "Not a member of this household" });
    }

    let finalName = name;
    // Auto-generate name if not provided
    if (!finalName && roomTypeId) {
      const count = await prisma.room.count({
        where: { householdId, roomTypeId },
      });
      const roomType = await prisma.roomType.findUnique({
        where: { id: roomTypeId },
      });
      if (roomType) {
        finalName = `${roomType.label} ${count + 1}`;
      }
    }
    if (!finalName) {
      return res.status(400).json({ error: "Name is required" });
    }
    const room = await prisma.room.create({
      data: {
        name: finalName,
        householdId,
        roomTypeId: roomTypeId || null,
        createdById: userId
      },
      include: {
        roomType: true,
      },
    });
    res.status(201).json({ status: "success", data: { room } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



// Remove a member from household
const removeMember = async (req, res) => {
  try {
    const { householdId, userId } = req.params;

    await prisma.householdMember.delete({
      where: { userId_householdId: { userId, householdId } }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Bulk create rooms for a household
const createRoomsBulk = async (req, res) => {
  try {
    const { householdId } = req.params;
    const { rooms } = req.body;
    const userId = req.user.id;

    // Check if user is a member of the household
    const membership = await prisma.householdMember.findUnique({
      where: { userId_householdId: { userId, householdId } }
    });
    if (!membership) {
      return res.status(403).json({ error: "Not a member of this household" });
    }

    const result = [];
    for (const roomInput of rooms) {
      const { name, roomTypeId } = roomInput;
      let finalName = name;
      if (!finalName && roomTypeId) {
        const count = await prisma.room.count({ where: { householdId, roomTypeId } });
        const roomType = await prisma.roomType.findUnique({ where: { id: roomTypeId } });
        if (roomType) {
          finalName = `${roomType.label} ${count + 1}`;
        }
      }
      if (!finalName) continue;
      const room = await prisma.room.create({
        data: {
          name: finalName,
          householdId,
          roomTypeId: roomTypeId || null,
          createdById: userId
        },
        include: { roomType: true },
      });
      result.push(room);
    }
    res.status(201).json({ status: "success", data: { rooms: result } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createHousehold,
  getUserHouseholds,
  getHouseholdById,
  createInvitation,
  inviteMember,
  removeMember,
  deleteHousehold,
  setDefaultHouseholdForUser,
  createRoomForHousehold,
  createRoomsBulk
};