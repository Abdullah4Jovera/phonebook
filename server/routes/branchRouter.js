const express = require('express');
const router = express.Router();
const Branch = require('../models/branchModel'); // Adjust the path to your Branch model

// POST route to create a new branch
router.post('/create-branch', async (req, res) => {
  try {
    const { name } = req.body;

    // Validate request body
    if (!name) {
      return res.status(400).json({ message: 'Branch name is required' });
    }

    // Create a new branch
    const newBranch = new Branch({ name });

    // Save the branch to the database
    await newBranch.save();

    // Respond with the created branch
    res.status(201).json(newBranch);
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ message: 'Error creating branch' });
  }
});

// GET route to fetch all branches
router.get('/get-branches', async (req, res) => {
  try {
    // Fetch all branches
    const branches = await Branch.find();

    // Respond with the list of branches
    res.status(200).json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ message: 'Error fetching branches' });
  }
});

module.exports = router;
