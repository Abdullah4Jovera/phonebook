const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Pipeline = require('../models/pipelineModel'); // Update the path to your Pipeline model

// Mongoose connection configuration
mongoose.connect('mongodb://localhost:27017/hx', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  loadAndInsertPipelines();
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);``
});

// Define the ObjectId to use for `created_by`
const CREATED_BY_ID = new mongoose.Types.ObjectId('66bc6f5b8a0d714205809cf5');

// Function to load, modify, and insert pipelines
const loadAndInsertPipelines = async () => {
  try {
    // Load pipelines data from JSON file
    const filePath = path.join(__dirname, '../data', 'pipelines.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const pipelines = JSON.parse(data);

    // Modify pipelines to include the specified `created_by` ObjectId
    pipelines.forEach(pipeline => {
      pipeline.created_by = CREATED_BY_ID;
    });

    // Insert modified pipelines into the database
    await Pipeline.insertMany(pipelines);
    console.log('Pipelines added successfully');

    // Close the Mongoose connection
    mongoose.connection.close();
  } catch (err) {
    console.error('Error loading and inserting pipelines:', err);
    mongoose.connection.close();
  }
};
