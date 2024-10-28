const nodemailer = require("nodemailer");

require("dotenv").config()

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465,
    auth: {
        user: process.env.APPLICATION_EMAIL,
        pass: process.env.APPLICATION_EMAIL_PASSWORD
    }
})

async function sendMail({to, subject, html}) {
    console.info('EMAIL HOST ',process.env.EMAIL_HOST)
    transporter.sendMail({
        from: `"Enquiry | GOAT Technologies" ${process.env.APPLICATION_EMAIL}`,
        to: process.env.NOTIFICATION_EMAIL,
        subject,
        html,
    })
        .then((mailInfo) => {
            console.info('[Nodemailer Success] Email id: ', mailInfo.messageId);
        })
        .catch((error) => {
            console.error('[Nodemailer Error] ', error);
        })
}

module.exports = sendMail;