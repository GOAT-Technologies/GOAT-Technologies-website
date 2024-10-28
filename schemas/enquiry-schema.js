const { default: mongoose } = require("mongoose")
const { Schema } = mongoose;

const enquirySchema = new Schema({
    name: String,
    'Last-Name': String,
    'Email-id': String,
    'Select-Country': String,
    'Enquiry-For': String,
    Company: String,
    'Phone-Number': String,
    City: String,
    'Contact-form-Message': String,
    enquiredOn: { type: String, default: new Date() },
});

module.exports = enquirySchema;