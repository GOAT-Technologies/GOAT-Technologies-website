const request = require('supertest');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const app = require('./server');
require('dotenv').config();

jest.setTimeout(30000);

describe('Form Submission API', () => {
  let transporter;
  
  beforeAll(async () => {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    app.set('emailTransporter', transporter);
  }, 20000);
  
  afterAll(async () => {
    if (transporter && typeof transporter.close === 'function') {
      await transporter.close();
    }
    await mongoose.disconnect();
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
    };
    const response = await request(app)
      .post('/submit-form')
      .send(incompleteFormData)
      .expect(400);
    expect(response.body).toEqual({ message: 'Missing required field: Enquiry-For' });
  });
  
  it('should handle email sending errors', async () => {
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
      .expect(200);
    
    app.set('emailTransporter', transporter);
  });
});
