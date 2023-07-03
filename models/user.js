import mongoose from 'mongoose'
import Joi from 'joi'
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            minlength: 3,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { id: this._id, isAdmin: this.isAdmin },
        process.env.JWT_PRIVATEKEY
    )
    return token
}

export const User = mongoose.model('User', userSchema)

export function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(3).required(),
    })

    return schema.validate(user, { abortEarly: false })
}

export function validateEmailAndPassword(userInfo) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    })

    return schema.validate(userInfo, { abortEarly: false })
}
