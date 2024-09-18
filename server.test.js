const request = require('supertest');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const app = require('./server');

jest.setTimeout(60000); // Increase timeout to 60 seconds

describe('Form Submission Integration Test', () => {
  let connection;
  let transporter;

  beforeAll(async () => {
    try {
      // Database connection
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
      });
      console.log('Database connection established');

      // Email transporter
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

      // Verify email connection
      try {
        await transporter.verify();
        console.log('Email connection verified');
      } catch (emailError) {
        console.warn('Email verification failed:', emailError.message);
        console.warn('Proceeding with tests, but email functionality may not work.');
      }
    } catch (error) {
      console.error('Error in test setup:', error);
      throw error;
    }
  });

  beforeEach(async () => {
    try {
      await connection.execute('DELETE FROM form_submissions');
      console.log('Database cleaned before test');
    } catch (error) {
      console.error('Error cleaning database:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  });

  it('should insert form data into database and attempt to send email', async () => {
    const formData = {
      name: 'John',
      'Last-Name': 'Doe',
      'Email-id': 'john.doe@example.com',
      Company: 'Test Corp',
      'Select-Country': 'USA',
      'Phone-Number': '1234567890',
      City: 'New York',
      'Enquiry-For': 'Our Product',
      'Contact-form-Message': 'This is a test message',
    };

    let response;
    try {
      response = await request(app)
        .post('/submit-form')
        .send(formData)
        .expect(200);
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }

    expect(response.body.message).toBe('Form submitted successfully');

    // Verify database insertion
    let rows;
    try {
      [rows] = await connection.execute(
        'SELECT * FROM form_submissions WHERE email = ?',
        [formData['Email-id']]
      );
      console.log('Database query result:', rows);
    } catch (error) {
      console.error('Error querying database:', error);
      throw error;
    }

    expect(rows.length).toBe(1);
    expect(rows[0].name).toBe(formData.name);
    expect(rows[0].last_name).toBe(formData['Last-Name']);
    expect(rows[0].email).toBe(formData['Email-id']);
    expect(rows[0].company).toBe(formData.Company);
    expect(rows[0].country).toBe(formData['Select-Country']);
    expect(rows[0].phone_number).toBe(formData['Phone-Number']);
    expect(rows[0].city).toBe(formData.City);
    expect(rows[0].enquiry_for).toBe(formData['Enquiry-For']);
    expect(rows[0].message).toBe(formData['Contact-form-Message']);

    console.log('Test completed. Email sending was attempted, but not verified in this test.');
  });

  it('should handle missing required fields', async () => {
    const incompleteFormData = {
      name: 'John',
      'Email-id': 'john.doe@example.com',
      'Select-Country': 'USA',
      'Enquiry-For': 'Our Product',
    };

    const response = await request(app)
      .post('/submit-form')
      .send(incompleteFormData)
      .expect(400);

    expect(response.body.message).toBe('Missing required field: Last-Name');

    const [rows] = await connection.execute(
      'SELECT * FROM form_submissions WHERE email = ?',
      [incompleteFormData['Email-id']]
    );

    expect(rows.length).toBe(0);
  });
});