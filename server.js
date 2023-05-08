import e from 'express'
import 'express-async-errors'
import * as dotenv from 'dotenv'
dotenv.config()
import dbConnect from './connection/dbConnect.js'
import homeRouter from './routes/home.js'
import userRouter from './routes/users.js'
import errorLog from './middleware/errorLog.js'

const PORT = process.env.PORT || 3000

//Connect to the db
dbConnect()

const app = e()

app.use(e.json())
app.use('/', homeRouter)
app.use('/api/users', userRouter)
app.use(errorLog)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`)
})
