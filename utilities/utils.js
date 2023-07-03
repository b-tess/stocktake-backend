import nodemailer from 'nodemailer'

//Create the email sending functionality
async function verifyEmail(userEmail, link) {
    try {
        //A transporter contains all the necessary sender info
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASS,
                clientId: process.env.OAUTH_CLIENTID,
                clientSecret: process.env.OAUTH_CLIENT_SECRET,
                refreshToken: process.env.OAUTH_REFRESH_TOKEN,
            },
        })

        //Send verification email to the new user
        const mailOptions = {
            from: 'barbaratessn@gmail.com',
            to: `${userEmail}`,
            subject: 'StocktakeApp Verification Email',
            text: `Hello. Welcome to the StocktakeApp`,
            html: `
            <div>
                <a href=${link}>Activate your account here</a>
            </div>`,
        }

        await transporter.sendMail(mailOptions)
        console.log('Email sent successfully.')
    } catch (error) {
        console.log('Message not sent.' + error)
    }
}
