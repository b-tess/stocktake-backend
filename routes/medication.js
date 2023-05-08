import e from 'express'
import mongoose from 'mongoose'
import { Medicine, validateMedicine } from '../models/medicine.js'
import authorized from '../middleware/auth.js'
import _ from 'lodash'

const medicineRouter = e.Router()

const objectId = mongoose.Types.ObjectId

//Get all medicine docs
medicineRouter.get('/', async (req, res) => {
    const medication = await Medicine.find().sort({ name: 1 })
    if (medication.length === 0) {
        return res.send('No medication in stock yet.')
    }

    return res.send(medication)
})

//Add a medicine item into the stock
medicineRouter.post('/', authorized, async (req, res) => {
    const { error } = validateMedicine(req.body)
    if (error) {
        let messages = []
        error.details.forEach((detail) => messages.push(detail.message))
        return res.status(400).send(messages.join('\n'))
    }

    let newMedicineItem = new Medicine(
        _.pick(req.body, ['name', 'inStock', 'expDate'])
    )
    newMedicineItem = await newMedicineItem.save()
    return res.send(newMedicineItem)
})

export default medicineRouter
