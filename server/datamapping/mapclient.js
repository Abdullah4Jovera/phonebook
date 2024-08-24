const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Client = require('./models/clientModel');

// Function to map and validate data
const mapClientData = (client) => {
  return {
    prev_id: client.id, 
    name: client.name,
    email: client.email,
    phone: client.phone,
    created_at: new Date(client.created_at),
    updated_at: new Date(client.updated_at)
  };
};

// Database connection function
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/datamanipulation500', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Main function to read JSON and insert data into the database
const main = async () => {
  await connectDB();

  const filePath = path.join(__dirname, 'data' ,'clients.json');

  // Read the JSON file
  fs.readFile(filePath, 'utf8', async (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      process.exit(1);
    }

    try {
      const clients = JSON.parse(data);

      // Map and validate data
      const mappedClients = clients.map(mapClientData);

      // Insert data into the database
      await Client.insertMany(mappedClients);

      console.log('Client data inserted successfully!');
      process.exit(0);
    } catch (error) {
      console.error('Error processing client data:', error);
      process.exit(1);
    }
  });
};

// Execute the main function
main().catch(error => {
  console.error('Error executing main function:', error);
  process.exit(1);
});
