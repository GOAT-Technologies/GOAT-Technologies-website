const request = require('supertest');
const nodemailer = require('nodemailer');
const app = require('./server'); // Assuming your main app file is named app.js
require('dotenv').config();

jest.setTimeout(30000); // Increase overall timeout to 30 seconds

describe('Form Submission API', () => {
  let transporter;

  beforeAll(async () => {
    // Create a test account
    const testAccount = await nodemailer.createTestAccount();

    // Create a transporter using the test account
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    // Override the transporter in the app
    app.set('emailTransporter', transporter);
  }, 20000); // Increase timeout for beforeAll to 20 seconds

  afterAll(async () => {
    // Close the transporter connection if it exists
    if (transporter && typeof transporter.close === 'function') {
      await transporter.close();
    }
  });

  it('should successfully submit a form with all required fields', async () => {
    const formData = {
      name: 'John',
      'Last-Name': 'Doe',
      'Email-id': 'john.doe@example.com',
      'Select-Country': 'USA',
      'Enquiry-For': 'General',
      Company: 'ACME Corp',
      'Phone-Number': '1234567890',
      City: 'New York',
      'Contact-form-Message': 'This is a test message'
    };

    const response = await request(app)
      .post('/submit-form')
      .send(formData)
      .expect(200);

    expect(response.body).toEqual({ message: 'Form submitted successfully' });
  });

  it('should return 400 if a required field is missing', async () => {
    const incompleteFormData = {
      name: 'John',
      'Last-Name': 'Doe',
      'Email-id': 'john.doe@example.com',
      'Select-Country': 'USA',
      // Missing 'Enquiry-For' field
    };

    const response = await request(app)
      .post('/submit-form')
      .send(incompleteFormData)
      .expect(400);

    expect(response.body).toEqual({ message: 'Missing required field: Enquiry-For' });
  });

  it('should handle email sending errors', async () => {
    // Temporarily replace the working transporter with a failing one
    const failingTransporter = nodemailer.createTransport({
      host: 'invalid-smtp-server.com',
      port: 587,
      secure: false,
      auth: {
        user: 'invalid-user',
        pass: 'invalid-pass'
      }
    });

    app.set('emailTransporter', failingTransporter);

    const formData = {
      name: 'John',
      'Last-Name': 'Doe',
      'Email-id': 'john.doe@example.com',
      'Select-Country': 'USA',
      'Enquiry-For': 'General'
    };

    const response = await request(app)
      .post('/submit-form')
      .send(formData)
      .expect(500);

    expect(response.body).toEqual({ message: 'An error occurred', error: 'Email error' });

    // Restore the working transporter
    app.set('emailTransporter', transporter);
  });
});