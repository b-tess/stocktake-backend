import mongoose from 'mongoose'
import Joi from 'joi'

//Set up a model
export const Medicine = mongoose.model(
    'Medicine',
    new mongoose.Schema(
        {
            name: {
                type: String,
                required: true,
            },
            inStock: {
                type: Number,
                required: true,
            },
            expDate: {
                type: Date,
                required: true,
            },
        },
        {
            timestamps: true,
        }
    )
)

//Validate the user input - client side
export function validateMedicine(medicine) {
    const schema = Joi.object({
        name: Joi.string().required(),
        inStock: Joi.number().required(),
        expDate: Joi.date().required(),
    })

    return schema.validate(medicine, { abortEarly: false })
}

//Validate the user input for removing stock - client side
export function validateStockEdit(count) {
    const schema = Joi.object({
        id: Joi.string().required(),
        count: Joi.number().required(),
    })

    return schema.validate(count, { abortEarly: false })
}
