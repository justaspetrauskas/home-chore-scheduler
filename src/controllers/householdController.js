// controllers/householdController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
          create: { userId, role: 'OWNER' }
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
          include: { members: { include: { user: true } } }
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
      where: { id: Number(id) },
      include: { members: { include: { user: true } } }
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
      where: { userId_householdId: { userId: user.id, householdId: Number(householdId) } }
    });

    if (existingMember) return res.status(400).json({ error: 'User already a member' });

    const membership = await prisma.householdMember.create({
      data: {
        userId: user.id,
        householdId: Number(householdId),
        role: role ? role.toUpperCase() : 'MEMBER'
      }
    });

    res.json(membership);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove a member from household
const removeMember = async (req, res) => {
  try {
    const { householdId, userId } = req.params;

    await prisma.householdMember.delete({
      where: { userId_householdId: { userId: Number(userId), householdId: Number(householdId) } }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { createHousehold, getUserHouseholds, getHouseholdById, inviteMember, removeMember };