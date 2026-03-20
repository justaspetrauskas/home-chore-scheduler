// Set default household for user
const setDefaultHousehold = async (req, res) => {
    const userId = req.user.id;
    let { householdId } = req.body;

    // If no householdId provided, auto-select if only one membership
    if (!householdId) {
        const memberships = await prisma.householdMember.findMany({
            where: { userId },
            select: { householdId: true }
        });
        if (memberships.length === 1) {
            householdId = memberships[0].householdId;
        } else {
            return res.status(400).json({ error: "householdId required unless only one membership exists" });
        }
    }

    // Validate membership
    const membership = await prisma.householdMember.findFirst({
        where: { userId, householdId }
    });
    if (!membership) {
        return res.status(403).json({ error: "User is not a member of this household" });
    }

    // Update user
    await prisma.user.update({
        where: { id: userId },
        data: { defaultHouseholdId: householdId }
    });
    res.json({ status: "success", defaultHouseholdId: householdId });
};
import { prisma } from "../config/db.js"

const getUser = (prisma) => async (req, res) => {
    const { id } = req.params

    // users can only fetch their own profile for now
    if (id !== req.user.id) {
        return res.status(403).json({ error: "Not allowed to view this user" })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                memberships: true,
                taskAssignments: true,
                choresCreated: true
            }
        })

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        res.json({ status: "success", data: { user } })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                memberships: true,
                taskAssignments: true,
                choresCreated: true
            }
        })

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        res.json({ status: "success", data: { user } })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        })

        res.json({ status: "success", data: { users } })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

const updateUser = async (req, res) => {
    const { id } = req.params
    const { name } = req.body

    const targetUser = await prisma.user.findUnique({ where: { id } })

    if (!targetUser) {
        return res.status(404).json({ error: "User not found" })
    }

    if (targetUser.id !== req.user.id) {
        return res.status(403).json({ error: "Not allowed to update this user" })
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name: name || undefined
            }
        })

        res.json({ 
            status: "success", 
            data: { 
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    name: updatedUser.name
                }
            }
        })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params

    if (id !== req.user.id) {
        return res.status(403).json({ error: "Not allowed to delete this user" })
    }

    try {
        await prisma.user.delete({ where: { id } })
        res.json({ status: "success", message: "User deleted successfully" })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

  const listHouseholds = async (req, res) => {
    try {
      const userId = req.user.id
      const households = await prisma.householdMember.findMany({
        where: { userId },
        select: {
          household: true,
          role: true
        }
      })
      res.json(households)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Server error' })
    }
  }

export { getUser, getAllUsers, listHouseholds, updateUser, deleteUser, getMe, setDefaultHousehold }
