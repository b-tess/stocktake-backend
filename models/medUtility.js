import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import Joi from 'joi'

//Med utility schema
const medUtilitySchema = new mongoose.Schema(
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
        },
    },
    {
        timestamps: true,
    }
)

medUtilitySchema.plugin(mongoosePaginate)

export const MedUtility = mongoose.model('MedUtility', medUtilitySchema)

export function validateUtility(medUtility) {
    const schema = Joi.object({
        name: Joi.string().required(),
        inStock: Joi.number().min(5).required(),
        expDate: Joi.date(),
    })

    return schema.validate(medUtility, { abortEarly: false })
}
