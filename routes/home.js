import e from 'express'

const homeRouter = e.Router()

homeRouter.get('/', (req, res) => {
    return res.send('Let us get into stock management, shall we?')
})

export default homeRouter
