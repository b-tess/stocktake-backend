import e from 'express'
import 'express-async-errors'
import * as dotenv from 'dotenv'
dotenv.config()
import dbConnect from './connection/dbConnect.js'
import cors from 'cors'
import homeRouter from './routes/home.js'
import userRouter from './routes/users.js'
import medicineRouter from './routes/medication.js'
import stockItemRouter from './routes/stockItems.js'
import singleStockItemRouter from './routes/stockItem.js'
import utilityRouter from './routes/medUtilities.js'
import errorLog from './middleware/errorLog.js'

const PORT = process.env.PORT || 3000

//Connect to the db
dbConnect()

const app = e()

app.use(e.json())
app.use(
    cors({
        origin: 'https://stocktake-app.onrender.com',
        methods: 'GET',
        allowedHeaders: [
            'Content-Type',
            'Origin',
            'X-Requested-With',
            'Accept',
            'x-client-key',
            'x-client-token',
            'x-client-secret',
            'Authorization',
        ],
        credentials: true,
    })
)
app.use('/', homeRouter)
app.use('/api/users', userRouter)
app.use('/api/medication', medicineRouter)
app.use('/api/stockitems', stockItemRouter)
app.use('/api/stockitem', singleStockItemRouter)
app.use('/api/utilities', utilityRouter)
app.use(errorLog)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`)
})
