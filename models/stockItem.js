import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import Joi from 'joi'

//Stock item schema
const stockItemSchema = new mongoose.Schema(
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

// stockItemSchema.plugin(mongoosePaginate)

//Set up a model
export const StockItem = mongoose.model('StockItem', stockItemSchema)

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
