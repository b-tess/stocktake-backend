import mongoose from 'mongoose'

const emailTokenSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'user',
        required: true,
    },
    uniqueToken: {
        type: String,
        required: true,
    },
})

const EmailToken = mongoose.model('Token', emailTokenSchema)

export default EmailToken
