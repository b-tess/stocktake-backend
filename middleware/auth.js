import 'express-async-errors'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.js'

export default async function authorized(req, res, next) {
    let token
    //Check if a token is present in the header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_PRIVATEKEY)
            req.user = await User.findById(decoded.id).select('-password')
            next()
        } catch (error) {
            res.status(401)
            throw new Error('Not authorized.')
        }
    } else {
        res.status(401)
        throw new Error('Not authorized. No token provided.')
    }
}
