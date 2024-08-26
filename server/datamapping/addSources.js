const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Source = require('../models/sourceModel'); // Update the path to your Source model

// Mongoose connection configuration
mongoose.connect('mongodb://localhost:27017/dynamiccrm', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  loadAndInsertSources();
})
.catch(err => { 
  console.error('Error connecting to MongoDB:', err);
});

// Define ObjectIds for lead types
const LEAD_TYPE_IDS = {
  '1': new mongoose.Types.ObjectId('66bc787d6df04f7f38a8eda5'),
  '2': new mongoose.Types.ObjectId('66bc787d6df04f7f38a8eda6'),
  '3': new mongoose.Types.ObjectId('66bc787d6df04f7f38a8eda7')
};

// Define the ObjectId to use for `created_by`
const CREATED_BY_ID = new mongoose.Types.ObjectId('66bc6f5b8a0d714205809cf5'); // Update with your ObjectId

// Function to load, modify, and insert sources
const loadAndInsertSources = async () => {
  try {
    // Load sources data from JSON file
    const filePath = path.join(__dirname, '../data', 'sources.json'); // Update the path if needed
    const data = fs.readFileSync(filePath, 'utf-8');
    const sources = JSON.parse(data);

    // Modify sources to include the specified `lead_type_id` and `created_by` ObjectId
    const updatedSources = sources.map(source => {
      const leadTypeId = LEAD_TYPE_IDS[source.lead_type_id] || null;

      if (!leadTypeId) {
        console.warn(`Warning: No valid lead_type_id found for source with id ${source.id}`);
      }

      return {
        ...source,
        lead_type_id: leadTypeId,
        created_by: CREATED_BY_ID,
        created_at: new Date(source.created_at),
        updated_at: new Date(source.updated_at)
      };
    });

    // Insert modified sources into the database
    await Source.insertMany(updatedSources);
    console.log('Sources added successfully');

    // Close the Mongoose connection
    mongoose.connection.close();
  } catch (err) {
    console.error('Error loading and inserting sources:', err);
    mongoose.connection.close();
  }
};
