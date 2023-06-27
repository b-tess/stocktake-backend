import e from 'express'
import { MedUtility } from '../models/medUtility.js'

const utilityRouter = e.Router()

utilityRouter.get('/', async (req, res) => {
    const options = {
        page: req.query.page,
        limit: 5,
        sort: { name: -1 },
    }
    const result = await MedUtility.paginate({}, options)

    const utilityItems = result.docs

    console.log(result)
    return res.send(utilityItems)

    // const utilityItems = await MedUtility.find()
    // return res.send(utilityItems)
})

export default utilityRouter
