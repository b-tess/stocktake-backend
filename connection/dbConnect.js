import mongoose from 'mongoose'

export default async function dbConnect() {
    try {
        mongoose.set('strictQuery', false)
        const conn = await mongoose.connect(
            process.env.MONGODB_CONNECTION_STRING
        )
        console.log(`Mongodb connected: ${conn.connection.host}`)
    } catch (error) {
        console.log('Unable to connect to Mongodb.', error)
    }
}
