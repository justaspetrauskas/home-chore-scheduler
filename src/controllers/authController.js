import { prisma } from "../config/db.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../utils/generateToken.js"

const register = async (req, res)=>{
    const {name, email, password} = req.body

    // Check if user already exists
    const userExists = await prisma.user.findUnique({
        where: {email: email}
    })

    if (userExists){
        return res.status(400).json({error: "User exists with this email"})
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = await prisma.user.create({
        data: {
            name, email,
            password: hashedPassword,
        } 
    })

    // Generate token
    const token = generateToken(user.id, res)

    res.status(201).json({status: "success", data: { user: { id: user.id, name, email }, token}})
}

const login = async(req, res)=>{
    const {email, password} = req.body

    // Check if user email exists
    const user = await prisma.user.findUnique({
        where: {email: email}
    })

    if(!user){
        return res.status(401).json({error: "Invalid email or password"})
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(!isPasswordValid){
        // Should be generic message not to give insights
        return res.status(401).json({error: "Invalid email or password"})
    }

    // Generate JWT Token
    // Token in the front-end should be stored in the cookie, as a safe option
    const token = generateToken(user.id, res)

    res.status(201).json({
        status: "success", 
        data: { user: 
            { id: user.id, name: user.name, email },
             token
            }
        })

}

const logout = async(req, res)=>{

    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0)
    })

    res.status(200).json({
        status: "success",
        message: "Logged out successfully"
        })

}

export {register, login, logout}