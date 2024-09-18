const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT; // Fallback to 3000 if PORT is not set in .env

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// MySQL connection pool
let pool;

const initializePool = () => {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
};

// Nodemailer transporter
let transporter;

const initializeTransporter = () => {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Initialize transporter
initializeTransporter();

// Form submission route
app.post('/submit-form', async (req, res) => {
  let connection;
  try {
    console.log('Received form data:', req.body);

    const requiredFields = ['name', 'Last-Name', 'Email-id', 'Select-Country', 'Enquiry-For'];
    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `Missing required field: ${field}` });
      }
    }

    if (!pool) {
      initializePool();
    }

    connection = await pool.getConnection();
    console.log('Database connection established');

    await connection.execute(
      'INSERT INTO form_submissions (name, last_name, email, company, country, phone_number, city, enquiry_for, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        req.body.name,
        req.body['Last-Name'],
        req.body['Email-id'],
        req.body.Company || null,
        req.body['Select-Country'],
        req.body['Phone-Number'] || null,
        req.body.City || null,
        req.body['Enquiry-For'],
        req.body['Contact-form-Message'] || null
      ]
    );
    console.log('Data inserted into database');

    // Check if transporter is initialized
    if (!transporter) {
      initializeTransporter();
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL,
      subject: 'New Form Submission',
      text: `
        New form submission received:
        Name: ${req.body.name} ${req.body['Last-Name']}
        Email: ${req.body['Email-id']}
        Company: ${req.body.Company || 'N/A'}
        Country: ${req.body['Select-Country']}
        Phone: ${req.body['Phone-Number'] || 'N/A'}
        City: ${req.body.City || 'N/A'}
        Enquiry For: ${req.body['Enquiry-For']}
        Message: ${req.body['Contact-form-Message'] || 'N/A'}
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Notification email sent');
    } catch (emailError) {
      if (emailError.code === 'ESOCKET' && emailError.syscall === 'read') {
        console.error('ECONNRESET error occurred while sending email. The email was not sent, but the form data was saved.');
      } else {
        console.error('Error sending email:', emailError);
      }
      // Continue with the response even if email fails
    }

    res.status(200).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Error details:', error);
    if (error.code === 'ER_DUP_ENTRY' || error.code === 'ER_NO_SUCH_TABLE' || error.message.includes('database')) {
      res.status(500).json({ message: 'An error occurred', error: 'Database error' });
    } else if (error.code === 'EAUTH' || error.code === 'ESOCKET' || error.message.includes('email')) {
      res.status(500).json({ message: 'An error occurred', error: 'Email error' });
    } else {
      res.status(500).json({ message: 'An error occurred', error: error.message });
    }
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection released');
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;