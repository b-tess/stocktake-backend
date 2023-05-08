import mongoose from 'mongoose'
import Joi from 'joi'

export const MedUtility = mongoose.model(
    'MedUtility',
    new mongoose.Schema({
        name: {
            type: String,
            required: true,
        },
        inStock: {
            type: Number,
            min: 5,
            required: true,
        },
        expDate: {
            type: Date,
        },
    })
)

export function validateUtility(medUtility) {
    const schema = Joi.object({
        name: Joi.string().required(),
        inStock: Joi.number().min(5).required(),
        expDate: Joi.date(),
    })

    return schema.validate(medUtility, { abortEarly: false })
}
