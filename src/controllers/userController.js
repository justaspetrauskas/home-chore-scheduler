import { prisma } from "../config/db.js"

const getUser = async (req, res) => {
    const { id } = req.params

    try {
        const user = await prisma.user.findFirst({
            where: {
                id,
                OR: [
                    { id: req.user.id }, 
                    { isAdmin: true } 
                ]
            },
            select: {
                id: true,
                email: true,
                name: true,
                isAdmin: true,
                createdAt: true,
                createdChores: true,
                assignedAreas: true,
                currentAsignement: true
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
                isAdmin: true,
                createdAt: true
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
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Admin access required" })
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                isAdmin: true,
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
    const { name, isAdmin } = req.body

    const targetUser = await prisma.user.findUnique({ where: { id } })

    if (!targetUser) {
        return res.status(404).json({ error: "User not found" })
    }

    if (targetUser.id !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Not allowed to update this user" })
    }

    if (!req.user.isAdmin && isAdmin !== undefined) {
        return res.status(403).json({ error: "Admin-only field" })
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name: name || undefined,
                isAdmin: isAdmin || undefined
            }
        })

        res.json({ 
            status: "success", 
            data: { 
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    name: updatedUser.name,
                    isAdmin: updatedUser.isAdmin
                }
            }
        })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params

    const targetUser = await prisma.user.findUnique({ 
        where: { id },
        select: { id: true, isAdmin: true }
    })

    if (!targetUser) {
        return res.status(404).json({ error: "User not found" })
    }

    if (targetUser.id !== req.user.id && (!req.user.isAdmin || targetUser.isAdmin)) {
        return res.status(403).json({ error: "Not allowed to delete this user" })
    }

    try {
        await prisma.user.delete({ where: { id } })
        res.json({ status: "success", message: "User deleted successfully" })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

export { getUser, getAllUsers, updateUser, deleteUser, getMe }
