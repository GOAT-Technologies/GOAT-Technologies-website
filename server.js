const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Google Sheets API setup
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.SPREADSHEET_ID;

// Form submission route
app.post('/submit-form', async (req, res) => {
  try {
    console.log('Received form data:', req.body);

    const requiredFields = ['name', 'Last-Name', 'Email-id', 'Select-Country', 'Enquiry-For'];
    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `Missing required field: ${field}` });
      }
    }

    // Prepare data for Google Sheets
    const rowData = [
      req.body.name,
      req.body['Last-Name'],
      req.body['Email-id'],
      req.body.Company || '',
      req.body['Select-Country'],
      req.body['Phone-Number'] || '',
      req.body.City || '',
      req.body['Enquiry-For'],
      req.body['Contact-form-Message'] || '',
      new Date().toISOString() // Timestamp
    ];

    // Append data to Google Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1', // Adjust if your sheet has a different name
      valueInputOption: 'USER_ENTERED',
      resource: { values: [rowData] },
    });

    console.log('Data appended to Google Sheets');

    res.status(200).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

module.exports = app;