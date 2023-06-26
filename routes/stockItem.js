import e from 'express'
import mongoose from 'mongoose'
import { StockItem, validateStockItem } from '../models/stockItem.js'
import authorized from '../middleware/auth.js'
import _ from 'lodash'

const singleStockItemRouter = e.Router()

//Purpose: Get one stock item doc
//Access: private
//User: logged in and admin
//Route: /api/stockitem/:id
singleStockItemRouter.get('/:id', authorized, async (req, res) => {
    if (req.user && req.user.isAdmin) {
        if (ObjectId.isValid(req.params.id)) {
            const stockItem = await StockItem.findById(req.params.id)

            if (!stockItem) {
                res.status(404)
                throw new Error('Stock item not found.')
            }

            return res.send(
                _.pick(stockItem, [
                    '_id',
                    'name',
                    'inStock',
                    'expDate',
                    'itemType',
                ])
            )
        } else {
            res.status(400)
            throw new Error('Invalid id.')
        }
    } else {
        res.status(401)
        throw new Error('Not authorized.')
    }
})

//Purpose: Edit one medicine doc inStock & exp date ONLY for received stock
//Access: private
//User: logged in & isAdmin
//Route: /api/stockitems/:id
singleStockItemRouter.put('/:id', authorized, async (req, res) => {
    if (req.user && req.user.isAdmin) {
        if (ObjectId.isValid(req.params.id)) {
            const { error } = validateStockItem(req.body)
            if (error) {
                let messages = []
                error.details.forEach((detail) => messages.push(detail.message))
                res.status(400)
                throw new Error(messages.join('\n'))
            }
            const adminUpdItemDoc = await StockItem.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            )

            if (!adminUpdItemDoc) {
                res.status(404)
                throw new Error('Document not found')
            }

            return res.send(adminUpdItemDoc)
        } else {
            res.status(400)
            throw new Error('Invalid id.')
        }
    } else {
        res.status(401)
        throw new Error('Not Authorized.')
    }
})

//Purpose: Delete a stock item doc
//Access: private
//User: logged in & admin
//Route: /api/stockitems/:id
singleStockItemRouter.delete('/:id', authorized, async (req, res) => {
    if (req.user && req.user.isAdmin) {
        if (ObjectId.isValid(req.params.id)) {
            const deletedItemDoc = await StockItem.findOneAndDelete({
                _id: req.params.id,
            })

            if (!deletedItemDoc) {
                res.status(404)
                throw new Error('Document not found')
            }

            return res.send(deletedItemDoc)
        } else {
            res.status(400)
            throw new Error('Invalid id.')
        }
    } else {
        res.status(401)
        throw new Error('Not Authorized.')
    }
})

export default singleStockItemRouter
