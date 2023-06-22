import e from 'express'
import { MedUtility } from '../models/medUtility.js'

const utilityRouter = e.Router()

const options = {
    page: 2,
    limit: 5,
    sort: { name: -1 },
}

utilityRouter.get('/', async (req, res) => {
    const result = await MedUtility.paginate({}, options)

    const utilityItems = result.docs

    console.log(result)
    return res.send(utilityItems)

    // const utilityItems = await MedUtility.find()
    // return res.send(utilityItems)
})

export default utilityRouter
