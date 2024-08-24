// routes/userRouter.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/userModel'); // Adjust the path to your User model
const { generateToken, isAuth } = require('../utils');
const Pipeline = require('../models/pipelineModel'); // Adjust the path as needed

// GET route to fetch all users
router.get('/get-users', async (req, res) => {
  try {
    const { pipelineId } = req.query; // Get pipelineId from query parameters

    // Build the query object
    const query = { delstatus: false };
    if (pipelineId) {
      query.pipeline = pipelineId; // Filter by pipelineId if provided
    }

    const users = await User.find(query)
      .select('-password') // Exclude the password field
      .populate('pipeline') // Populate the pipeline field
      .exec();

    const imagePrefix = 'http://192.168.2.137:2000/images/';

    users.forEach(user => {
      if (user.image) { 
        user.image = `${imagePrefix}${user.image}`;
      }
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// POST route to create a new user
router.post('/create-user', async (req, res) => {
  try {
    const { name, pipeline, email, password, image, role, branch, permissions,subpipeline, delStatus, verified } = req.body;

    // Validate request body
    // if (!name || !pipeline || !email || !role || !branch) {
    //   return res.status(400).json({ message: 'Missing required fields' });
    // }

    // Hash the password
    const saltRounds = 10; // Number of salt rounds
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const newUser = new User({
      name,
      pipeline,
      subpipeline,
      email,
      password: hashedPassword, // Save the hashed password 
      image,
      role,
      branch,
      permissions,
      delStatus,
      verified
    });

    // Save the new user to the database
    await newUser.save();

    // Respond with the created user
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});
// POST route for user login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a token
    const token = generateToken(user);

    // Respond with user details and token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pipeline: user.pipeline,
      branch: user.branch,
      role: user.role,
      permissions: user.permissions,
      token
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});
///update User
router.put('/update-user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, pipeline, subpipeline, email, password, image, role, branch, permissions, delStatus, verified } = req.body;

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (name) user.name = name;
    if (pipeline !== undefined) user.pipeline = pipeline === 'null' ? null : pipeline;
    if (subpipeline !== undefined) user.subpipeline = subpipeline === 'null' ? null : subpipeline;
    if (email) user.email = email;
    if (password) {
      // Hash the new password if provided
      const saltRounds = 10;
      user.password = await bcrypt.hash(password, saltRounds);
    }
    if (image) user.image = image;
    if (role) user.role = role;
    if (branch !== undefined) user.branch = branch === 'null' ? null : branch;
    if (permissions) user.permissions = permissions;
    if (delStatus !== undefined) user.delStatus = delStatus;
    if (verified !== undefined) user.verified = verified;

    // Save the updated user to the database
    await user.save();

    // Respond with the updated user
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

/// delete User
router.put('/delete-user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {  delstatus } = req.body;

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

   
    if (delstatus !== undefined) user.delstatus = delstatus;

    await user.save();

    // Respond with the updated user
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});
/// Reset Password
router.put('/reset-password', isAuth, async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user._id;

    // Find the user by their ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if a new password is provided
    if (password) {
      const saltRounds = 10;
      user.password = await bcrypt.hash(password, saltRounds);
    }

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'Password updated successfully', user });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Error updating password' });
  }
});

module.exports = router;
 