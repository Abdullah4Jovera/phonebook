const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Pipeline = require('../models/pipelineModel');

// Load JSON utility
const loadJSON = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

// Helper function to find or create a pipeline and return its ID
const findOrCreatePipeline = async (pipelineData) => {
  try {
    let pipeline = await Pipeline.findOne({ name: pipelineData.name });
    if (!pipeline) {
      pipeline = new Pipeline({
        name: pipelineData.name,
        created_by: pipelineData.created_by,
        created_at: new Date(pipelineData.created_at),
        updated_at: new Date(pipelineData.updated_at),
      });
      await pipeline.save();
    }
    return pipeline._id;
  } catch (error) {
    console.error('Error finding or creating pipeline:', error);
    throw error;
  }
};

// Map pipeline data to an ID map
const createPipelineIdMap = async () => {
  const pipelinesData = loadJSON(path.join(__dirname, '../data', 'pipelines.json'));
  const pipelinesMap = new Map();

  for (const pipelineData of pipelinesData) {
    const pipelineId = await findOrCreatePipeline(pipelineData);
    pipelinesMap.set(pipelineData.id, { id: pipelineId, name: pipelineData.name });
  }
  return pipelinesMap;
};

// Get pipeline name from the pipelines map
const getPipelineName = (pipelineId, pipelinesMap) => {
  const pipeline = [...pipelinesMap.values()].find(p => p.id.toString() === pipelineId.toString());
  return pipeline ? pipeline.name : 'Unknown Pipeline';
};

// Map user data including the pipeline ID and correct role
const mapUserData = (userJson, pipelinesMap) => {
  const pipelineData = pipelinesMap.get(userJson.pipeline);

  if (!pipelineData) {
    console.error(`Pipeline ID not found for user: ${userJson.name}`);
    return null; // Skip this user if no pipeline ID is found
  }

  const pipelineName = getPipelineName(pipelineData.id, pipelinesMap);
  const role = `${pipelineName}_${userJson.type}`;

  return {
    name: userJson.name,
    pipeline: pipelineData.id, // Set the pipeline ID
    email: userJson.email,
    password: userJson.password,
    image: userJson.avatar, // Assuming you want to map avatar to image
    role: role,
    branch: userJson.branch || 'Abu Dhabi',
    permissions: [], // Initialize permissions as empty
    delStatus: userJson.delete_status === '1',
    verified: userJson.is_email_verified === '1',
  };
};

// Database connection function
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://abdullahjovera:pAh1IDi9VBvyUNl3@cluster0.kerlawf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/phonebookV2', {
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

  const userFilePath = path.join(__dirname, '../data', 'users.json');
  const pipelinesMap = await createPipelineIdMap(); // Create pipeline ID map

  // Read the user JSON file
  fs.readFile(userFilePath, 'utf8', async (err, data) => {
    if (err) {
      console.error('Error reading user file:', err);
      process.exit(1);
    }

    try {
      const users = JSON.parse(data);

      // Map and validate data
      const mappedUsers = users.map(userJson => mapUserData(userJson, pipelinesMap))
        .filter(user => user !== null); // Filter out null entries

      if (mappedUsers.length === 0) {
        console.error('No valid user data to insert.');
        process.exit(1);
      }

      // Insert data into the database
      await User.insertMany(mappedUsers);

      console.log('User data inserted successfully!');
      process.exit(0);
    } catch (error) {
      console.error('Error processing user data:', error);
      process.exit(1);
    }
  });
};

// Execute the main function
main().catch(error => {
  console.error('Error executing main function:', error);
  process.exit(1);
});
