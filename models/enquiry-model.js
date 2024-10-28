const enquirySchema = require("../schemas/enquiry-schema");
const { default: mongoose } = require("mongoose");


const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = Enquiry