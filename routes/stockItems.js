import e from 'express'
import mongoose from 'mongoose'
import {
    StockItem,
    validateStockItem,
    validateStockEdit,
} from '../models/stockItem.js'
import authorized from '../middleware/auth.js'
import _ from 'lodash'

const stockItemRouter = e.Router()
const ObjectId = mongoose.Types.ObjectId

//Purpose: Get all stock item docs for admin purposes
//Access: private
//User: logged in & isAdmin
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
        //Check if the newly created item is present in the db
        //despite the case of the words provided by the user
        //if present, do not create a new item
        const providedName = req.body.name
            .split(' ')
            .map(
                (word) =>
                    word[0].toUpperCase() + word.substring(1).toLowerCase()
            )
            .join(' ')

        const itemExists = await StockItem.findOne({
            name: providedName,
        })

        if (itemExists) {
            throw new Error('This item already exists.')
        }

        let newStockItem = new StockItem(
            _.pick(req.body, ['name', 'inStock', 'expDate', 'itemType'])
        )
        newStockItem = await newStockItem.save()

        //Standardize the case format of the names stored in the db
        //after they are provided by the user
        const updName = newStockItem.name
            .split(' ')
            .map(
                (word) =>
                    word[0].toUpperCase() + word.substring(1).toLowerCase()
            ) //Capitalize the 1st letter of every word followed by small caps letters
            .join(' ')

        const update = {
            name: updName,
        }
        newStockItem = await StockItem.findByIdAndUpdate(
            newStockItem._id,
            update,
            {
                new: true,
            }
        )
        return res.send(newStockItem)
    } else {
        res.status(401)
        throw new Error('Not Authorized.')
    }
})

//Purpose: Get all stock item docs for stockout purposes
//Access: private
//User: logged in
//Route: /api/stockitems/stockout?page=pagenumber
stockItemRouter.get('/stockout', authorized, async (req, res) => {
    if (req.user) {
        const options = {
            page: req.query.page,
            limit: 5,
            sort: { name: -1 },
        }

        const result = await StockItem.paginate({}, options)
        const stockItems = result.docs
        const totalPages = result.totalPages

        if (stockItems.length === 0) {
            return res.send('Nothing in stock yet.')
        }

        return res.json({ stockItems, totalPages })
    }
})

//Purpose: Get all stock item docs filtered by medication
//type for stockout purposes
//Access: private
//User: logged in
//Route: /api/stockitems/medication?page=pagenumber
stockItemRouter.get('/medication', authorized, async (req, res) => {
    if (req.user) {
        const options = {
            page: req.query.page,
            limit: 5,
            sort: { name: -1 },
        }

        const query = { itemType: 'Medication' }

        const result = await StockItem.paginate(query, options)
        const stockItems = result.docs
        const totalPages = result.totalPages

        if (stockItems.length === 0) {
            return res.send('Nothing in stock yet.')
        }

        return res.json({ stockItems, totalPages })
    }
})

//Purpose: Get all stock item docs filtered by utility
//type for stockout purposes
//Access: private
//User: logged in
//Route: /api/stockitems/utilities?page=pagenumber
stockItemRouter.get('/utilities', authorized, async (req, res) => {
    if (req.user) {
        const options = {
            page: req.query.page,
            limit: 5,
            sort: { name: -1 },
        }

        const query = { itemType: 'Utility' }

        const result = await StockItem.paginate(query, options)
        const stockItems = result.docs
        const totalPages = result.totalPages

        if (stockItems.length === 0) {
            return res.send('Nothing in stock yet.')
        }

        return res.json({ stockItems, totalPages })
    }
})

//Purpose: Edit one stockitem doc stock ONLY
//Access: private
//User: logged in
//Route: /api/stockitems/stockout
stockItemRouter.put('/stockout', authorized, async (req, res) => {
    const { error } = validateStockEdit(req.body)
    if (error) {
        let messages = []
        error.details.forEach((detail) => messages.push(detail.message))
        return res.status(400).send(messages.join('\n'))
    }

    if (req.user) {
        if (ObjectId.isValid(req.body.id)) {
            const numberInStockCheck = await StockItem.findById(req.body.id)
            if (req.body.count > numberInStockCheck.inStock) {
                res.status(400)
                throw new Error(
                    'You cannot dispense more than what is in stock.'
                )
            }
            const updOnStockOutDoc = await StockItem.findByIdAndUpdate(
                req.body.id,
                { $inc: { inStock: -req.body.count } },
                { new: true }
            )

            if (!updOnStockOutDoc) {
                res.status(404)
                throw new Error('Document not found')
            }

            return res.send(updOnStockOutDoc)
        } else {
            res.status(400)
            throw new Error('Invalid id.')
        }
    } else {
        res.status(401)
        throw new Error('Not Authorized.')
    }
})

export default stockItemRouter
