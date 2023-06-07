import mongoose from 'mongoose'
import Joi from 'joi'

//Set up a model
export const StockItem = mongoose.model(
    'StockItem',
    new mongoose.Schema(
        {
            name: {
                type: String,
                required: true,
            },
            inStock: {
                type: Number,
                min: 1,
                required: true,
            },
            expDate: {
                type: Date,
                // min: new Date(),
                required: true,
            },
            itemType: {
                type: String,
                enum: ['Medication', 'Utility'],
                required: true,
            },
        },
        {
            timestamps: true,
        }
    )
)

//Validate the user input - client side
export function validateStockItem(stockItem) {
    const schema = Joi.object({
        name: Joi.string().required(),
        inStock: Joi.number().min(1).required(),
        expDate: Joi.date().required(),
        itemType: Joi.string().required(),
    })

    return schema.validate(stockItem, { abortEarly: false })
}
