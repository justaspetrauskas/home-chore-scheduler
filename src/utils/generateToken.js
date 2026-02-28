import jwt from 'jsonwebtoken'

export const generateToken = (userId, res)=> {
    const payload = { id: userId };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    })

    res.cookie("jwt", token,  {
        httpOnly: true,
        secure: process.env.NODE_END === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7days
    })

    return token
}