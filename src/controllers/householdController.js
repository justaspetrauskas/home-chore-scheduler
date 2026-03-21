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
};

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

export { createHousehold, getUserHouseholds, getHouseholdById, inviteMember, removeMember, deleteHousehold, setDefaultHouseholdForUser };