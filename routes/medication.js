import e from 'express'
import mongoose from 'mongoose'
import {
    Medicine,
    validateMedicine,
    validateStockEdit,
} from '../models/medicine.js'
import authorized from '../middleware/auth.js'
import _ from 'lodash'

const medicineRouter = e.Router()

const ObjectId = mongoose.Types.ObjectId

//Purpose: Get all medicine docs
//Access: not sure yet
//User: not sure yet
//Route: /api/medication
medicineRouter.get('/', async (req, res) => {
    const medication = await Medicine.find().sort({ name: 1 })
    if (medication.length === 0) {
        return res.send('No medication in stock yet.')
    }

    return res.send(medication)
})

//Purpose: Add a new medicine item/doc
//Access: private
//User: logged in & isAdmin
//Route: /api/medication
medicineRouter.post('/', authorized, async (req, res) => {
    const { error } = validateMedicine(req.body)
    if (error) {
        let messages = []
        error.details.forEach((detail) => messages.push(detail.message))
        res.status(400)
        throw new Error(messages.join('\n'))
    }

    if (req.user && req.user.isAdmin) {
        let newMedicineItem = new Medicine(
            _.pick(req.body, ['name', 'inStock', 'expDate'])
        )
        newMedicineItem = await newMedicineItem.save()
        return res.send(newMedicineItem)
    } else {
        res.status(401)
        throw new Error('Not Authorized.')
    }
})

//Purpose: Edit one medicine doc stock ONLY
//Access: private
//User: logged in
//Route: /api/medication/stockout
medicineRouter.put('/stockout', authorized, async (req, res) => {
    const { error } = validateStockEdit(req.body)
    if (error) {
        let messages = []
        error.details.forEach((detail) => messages.push(detail.message))
        return res.status(400).send(messages.join('\n'))
    }

    if (req.user) {
        if (ObjectId.isValid(req.body.id)) {
            const updatedMedicineDoc = await Medicine.findByIdAndUpdate(
                req.body.id,
                { $inc: { inStock: -req.body.count } },
                { new: true }
            )

            if (!updatedMedicineDoc) {
                res.status(404)
                throw new Error('Document not found')
            }

            return res.send(updatedMedicineDoc)
        } else {
            res.status(400)
            throw new Error('Invalid id.')
        }
    } else {
        res.status(401)
        throw new Error('Not Authorized.')
    }
})

//Purpose: Edit one medicine doc stock ONLY
//Access: private
//User: logged in
//Route: /api/medication/receive
medicineRouter.put('/receive', authorized, async (req, res) => {
    const { error } = validateStockEdit(req.body)
    if (error) {
        let messages = []
        error.details.forEach((detail) => messages.push(detail.message))
        return res.status(400).send(messages.join('\n'))
    }

    if (req.user) {
        if (ObjectId.isValid(req.body.id)) {
            const updatedMedicineDoc = await Medicine.findByIdAndUpdate(
                req.body.id,
                { $inc: { inStock: +req.body.count } },
                { new: true }
            )

            if (!updatedMedicineDoc) {
                res.status(404)
                throw new Error('Document not found')
            }

            return res.send(updatedMedicineDoc)
        } else {
            res.status(400)
            throw new Error('Invalid id.')
        }
    } else {
        res.status(401)
        throw new Error('Not Authorized.')
    }
})

//Purpose: Edit one medicine doc name & exp date ONLY
//Access: private
//User: logged in & isAdmin
//Route: /api/medication/:itemId
medicineRouter.put('/:id', authorized, async (req, res) => {
    if (req.user && req.user.isAdmin) {
        if (ObjectId.isValid(req.params.id)) {
            const adminUpdMedicineDoc = await Medicine.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            )

            if (!adminUpdMedicineDoc) {
                res.status(404)
                throw new Error('Document not found')
            }

            return res.send(adminUpdMedicineDoc)
        } else {
            res.status(400)
            throw new Error('Invalid id.')
        }
    } else {
        res.status(401)
        throw new Error('Not Authorized.')
    }
})

//Purpose: Delete a medicine doc
//Access: private
//User: logged in & admin
//Route: /api/medication/:itemId
medicineRouter.delete('/:id', authorized, async (req, res) => {
    if (req.user && req.user.isAdmin) {
        if (ObjectId.isValid(req.params.id)) {
            const deletedMedicineDoc = await Medicine.findOneAndDelete({
                _id: req.params.id,
            })

            if (!deletedMedicineDoc) {
                res.status(404)
                throw new Error('Document not found')
            }

            return res.send(deletedMedicineDoc)
        } else {
            res.status(400)
            throw new Error('Invalid id.')
        }
    } else {
        res.status(401)
        throw new Error('Not Authorized.')
    }
})

export default medicineRouter
