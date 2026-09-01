import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export const generateToken = (userId : any) => {
    return jwt.sign({userId}, JWT_SECRET, { expiresIn : '7d'})
}