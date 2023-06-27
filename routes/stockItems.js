import e from 'express'
import { StockItem, validateStockItem } from '../models/stockItem.js'
import authorized from '../middleware/auth.js'
import _ from 'lodash'

const stockItemRouter = e.Router()

//Purpose: Get all stock item docs
//Access: private
//User: logged in
//Route: /api/stockitems
stockItemRouter.get('/', authorized, async (req, res) => {
    const options = {
        page: req.query.page,
        limit: 5,
        sort: { name: -1 },
    }

    const result = await StockItem.paginate({}, options)
    const stockItems = result.docs
    const totalPages = result.totalPages

    // const count = await StockItem.countDocuments()
    // const totalPages = Math.ceil(count / limit)

    if (stockItems.length === 0) {
        return res.send('Nothing in stock yet.')
    }

    return res.json({ stockItems, totalPages })
})

//Purpose: Add a new stock item/doc
//Access: private
//User: logged in & isAdmin
//Route: /api/stockitems
stockItemRouter.post('/', authorized, async (req, res) => {
    const { error } = validateStockItem(req.body)
    if (error) {
        let messages = []
        error.details.forEach((detail) => messages.push(detail.message))
        res.status(400)
        throw new Error(messages.join('\n'))
    }

    if (req.user && req.user.isAdmin) {
        let newStockItem = new StockItem(
            _.pick(req.body, ['name', 'inStock', 'expDate', 'itemType'])
        )
        newStockItem = await newStockItem.save()
        return res.send(newStockItem)
    } else {
        res.status(401)
        throw new Error('Not Authorized.')
    }
})

export default stockItemRouter
