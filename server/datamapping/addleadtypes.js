const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const LeadType = require('../models/leadTypeModel'); // Update the path to your LeadType model

// Mongoose connection configuration
mongoose.connect('mongodb://localhost:27017/newmapstages', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  loadAndInsertLeadTypes();
}) 

.catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

// Define the ObjectId to use for `created_by`
const CREATED_BY_ID = new mongoose.Types.ObjectId('66bc6f5b8a0d714205809cf5'); // Update with your ObjectId

// Function to load, modify, and insert lead types
const loadAndInsertLeadTypes = async () => {
  try {
    // Load lead types data from JSON file
    const filePath = path.join(__dirname, '../data', 'lead_types.json'); // Update the path if needed
    const data = fs.readFileSync(filePath, 'utf-8');
    const leadTypes = JSON.parse(data);

    // Modify lead types to include the specified `created_by` ObjectId
    leadTypes.forEach(leadType => {
      leadType.created_by = CREATED_BY_ID;
      leadType.created_at = new Date(leadType.created_at);
      leadType.updated_at = new Date(leadType.updated_at);
    });

    // Insert modified lead types into the database
    await LeadType.insertMany(leadTypes);
    console.log('Lead types added successfully');

    // Close the Mongoose connection
    mongoose.connection.close();
  } catch (err) {
    console.error('Error loading and inserting lead types:', err);
    mongoose.connection.close();
  }
};
