import e from 'express'
import { User, validateUser, validateEmailAndPassword } from '../models/user.js'
import EmailToken from '../models/token.js'
import verifyEmail from '../utilities/utils.js'
import authorized from '../middleware/auth.js'
import bcrypt from 'bcrypt'
import _ from 'lodash'
import randomstring from 'randomstring'

const userRouter = e.Router()

//Purpose: Register a new user
//Access: public
//Route: /api/users
userRouter.post('/', async (req, res) => {
    let emailSent = null
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
    let newUserToken = new EmailToken({
        userId: newUser._id,
        uniqueToken: randomstring.generate({
            length: 16,
            charset: 'alphanumeric',
        }),
    })

    newUserToken = await newUserToken.save()

    const link = `${process.env.BASE_URL}/verifyemail/${newUserToken.uniqueToken}`
    emailSent = await verifyEmail(newUser.email, newUser.name, link)

    if (emailSent) {
        const message = 'Email sent. Please check your email.'
        newUser = _.pick(newUser, ['_id', 'name', 'email'])
        res.status(201).json({ ...newUser, token, message })
    } else {
        res.status(400).send('Email not sent.')
    }
})

//Purpose: Verify a user's email
//Access: private-Only accessible after user clicks link in email
//Route: /api/users/verifyemail/:newusertoken
userRouter.get('/verifyemail/:newusertoken', async (req, res) => {
    //Get the randomly generated token from the params
    const newUserToken = req.params.newusertoken

    //Find the emailtokens collection doc with the correct token value
    const newUserDoc = await EmailToken.findOne({
        uniqueToken: newUserToken,
    })

    //Update the isVerified value of the correct user doc
    const user = await User.findByIdAndUpdate(
        newUserDoc.userId,
        { isVerified: true },
        { new: true }
    )
    res.status(200).send(user)

    //Delete the emailtoken doc to keep the emailtokens collection empty.
    //This brings an issue because in production, requests are made twice by the strict mode setting.
    //The emmailtoken is created for the user then deleted in the first request.
    //By the time the 2nd request is made, the user doc required to personalize the page can no longer
    //be found.
    //I can maybe check if it will work in production when only one request is made to the db...

    // await EmailToken.findByIdAndDelete(newUserDoc._id)
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
    //Check if a user doc exists
    if (user) {
        //Check if a user has hit the verification endpoint above
        if (user.isVerified) {
            //Check if the user passwords match after login attempt
            if (await bcrypt.compare(req.body.password, user.password)) {
                const token = user.generateAuthToken()
                const userInfo = _.pick(user, ['_id', 'name', 'isAdmin'])
                return res.send({ ...userInfo, token })
            } else {
                res.status(401)
                throw new Error('Invalid login details.')
            }
        } else {
            res.status(400)
            throw new Error('Please check your email and verify.')
        }
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
