import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export const generateToken = async(userId : any) => {
    return jwt.sign({userId}, JWT_SECRET, { expiresIn : '7d'})
}