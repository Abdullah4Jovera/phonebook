const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const phonebookRouter = require('./routes/phonbookRouter'); 
const userRouter = require('./routes/userRouter'); 
const pipelineRouter = require('./routes/pipelineRouter'); 
const branchRouter = require('./routes/branchRouter'); 
require('dotenv').config();

const app = express();

// Configure CORS
app.use(cors({
    origin: '*' // Adjust this to your needs
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, './uploads')));

app.use('/api/phonebook', phonebookRouter);
app.use('/api/users', userRouter);
app.use('/api/pipelines', pipelineRouter);
app.use('/api/branches', branchRouter);
const connectDB = async () => {
  try {
    const dbURI = process.env.MONGODB_URI;
    if (!dbURI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }
    await mongoose.connect(dbURI, {
    
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 8081;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
