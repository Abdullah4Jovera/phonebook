const mongoose = require('mongoose');
const Branch = require('../models/branchModel');
mongoose.connect('mongodb://localhost:27017/phonebookv2', { 
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  const branches = [
    { name: 'Abu Dhabi', timestamp: new Date() },
    { name: 'Ajman', timestamp: new Date() }
  ];
  Branch.insertMany(branches)
    .then(() => {
      console.log('Branches added successfully');
      mongoose.connection.close(); 
    })
    .catch(err => {
      console.error('Error adding branches:', err);
      mongoose.connection.close(); 
    });
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
});
