import { prisma } from "../config/db.js"


const createChore = async (req, res)=> {
    const {title, description, points,area }=req.body
    const choreExists = await prisma.chore.findFirst({
        where: {title: title}
    })

    if (choreExists){
        return res.status(400).json({error: "Chore exists with this title"})
    }

    try{

        const chore = await prisma.chore.create({
        data: {
            title, 
            description: description || null,
            points: points || 0,
            createdById: req.user.id
        } 
    })

        res.status(201).json({status: "success", data: {chore: {id:chore.id, title, description, points}}})

    }catch {
        return res.status(500).json({error: "Server error"})
    }


}

const deleteChore=async(req, res)=>{
    const { id }=req.params

 const choreItem=await prisma.chore.findUnique({
    where: {id: id}
 })

 if(!choreItem){
    return res.status(404).json({error: "Chore not found"})
 }

 if(choreItem.createdById !== req.user.id && !req.user.isAdmin){
    return res.status(403).json({error: "Not allowed to delete this chore"})
 }

 await prisma.chore.delete({
    where: {id:id}
 })

 return res.status(204).send()
}

const updateChore = async (req, res) => {
    const { id } = req.params
    const { title, description, points } = req.body

    const choreItem = await prisma.chore.findUnique({
        where: { id }
    })

    if (!choreItem) {
        return res.status(404).json({ error: "Chore not found" })
    }

    if (choreItem.createdById !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Not allowed to update this chore" })
    }

    try {
        const updatedChore = await prisma.chore.update({
            where: { id },
            data: {
                title: title || choreItem.title,
                description: description !== undefined ? description : choreItem.description,
                points: points || choreItem.points
            }
        })

        res.json({ status: "success", data: { 
            chore: { 
                id: updatedChore.id, 
                title: updatedChore.title, 
                description: updatedChore.description, 
                points: updatedChore.points 
            } 
        }})
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

const getAllChores = async (req, res) => {
    try {
        const chores = await prisma.chore.findMany({
            where: {
                createdById: req.user.id
            },
            select: {
                id: true,
                title: true,
                description: true,
                points: true,
                createdAt: true
            }
        })

        res.json({ status: "success", data: { chores } })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}
const getChoreById = async (req, res) => {
    const { id } = req.params

    try {
        const chore = await prisma.chore.findFirst({
            where: {
                id,
                createdById: req.user.id
            },
            select: {
                id: true,
                title: true,
                description: true,
                points: true,
                createdAt: true
            }
        })

        if (!chore) {
            return res.status(404).json({ error: "Chore not found" })
        }

        res.json({ status: "success", data: { chore } })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

export { createChore, updateChore, deleteChore, getAllChores, getChoreById }



