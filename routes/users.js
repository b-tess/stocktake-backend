import e from 'express'
import { User, validateUser, validateEmailAndPassword } from '../models/user.js'
import Emailtoken from '../models/token.js'
import authorized from '../middleware/auth.js'
import bcrypt from 'bcrypt'
import _ from 'lodash'
import randomstring from 'randomstring'

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
    const token = newUser.generateAuthToken()
    try {
        newUser.password = await bcrypt.hash(newUser.password, 10)
    } catch (error) {
        console.log('Password not hashed.', error)
        return
    }
    newUser = await newUser.save()

    //Create a unique token for every new user
    //This token will be deleted later
    let newUserToken = new Emailtoken({
        userId: newUser._id,
        uniqueToken: randomstring.generate({
            length: 16,
            charset: 'alphanumeric',
        }),
    })

    newUserToken = await newUserToken.save()

    newUser = _.pick(newUser, ['_id', 'name', 'email'])
    res.status(201).json({ ...newUser, token })
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
        const userInfo = _.pick(user, ['_id', 'name', 'isAdmin'])
        return res.send({ ...userInfo, token })
    } else {
        res.status(401)
        throw new Error('Invalid login details.')
    }
})

//Purpose: Check a currently logged in user
//Access: private
//Route: /api/users/me
userRouter.get('/me', authorized, (req, res) => {
    const currentUser = _.pick(req.user, ['id', 'name'])
    return res.send({ ...currentUser })
})

export default userRouter
