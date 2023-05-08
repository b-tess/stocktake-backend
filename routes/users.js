import e from 'express'
import { User, validateUser, validateEmailAndPassword } from '../models/user.js'
import bcrypt from 'bcrypt'
import _ from 'lodash'

const userRouter = e.Router()

//Purpose: Register a new user
//Access: public
//Route: /api/users
userRouter.post('/', async (req, res) => {
    //Validate user input
    const { error } = validateUser(req.body)
    if (error) {
        let messages = []
        error.details.forEach((detail) => messages.push(detail.message))
        return res.status(400).send(messages.join('\n'))
    }

    //Check if a user already exists
    const existingUser = await User.findOne({ email: req.body.email })
    if (existingUser) {
        res.status(400)
        throw new Error('User already exists.')
    }

    //Add new user to the db
    let newUser = new User(_.pick(req.body, ['name', 'email', 'password']))
    try {
        newUser.password = await bcrypt.hash(newUser.password, 10)
    } catch (error) {
        console.log('Password not hashed.', error)
        return
    }
    newUser = await newUser.save()
    newUser = _.pick(newUser, ['_id', 'name', 'email'])
    res.status(201).json({ ...newUser })
})

//Purpose: Login a user
//Access: public
//Route: /api/users/login
userRouter.post('/login', async (req, res) => {
    const { error } = validateEmailAndPassword(req.body)
    if (error) {
        let messages = []
        error.details.forEach((detail) => messages.push(detail.message))
        return res.status(400).send(messages.join('\n'))
    }

    const user = await User.findOne({ email: req.body.email })
    if (user && (await bcrypt.compare(req.body.password, user.password))) {
        const token = user.generateAuthToken()
        const userInfo = _.pick(user, ['_id', 'name'])
        return res.send({ ...userInfo, token })
    } else {
        res.status(401)
        throw new Error('Invalid login details.')
    }
})

export default userRouter
