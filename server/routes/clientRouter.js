// routes/clientRouter.js
const express = require('express');
const router = express.Router();
const Client = require('../models/clientModel'); // Adjust the path to your Client model

router.get('/get-clinets', async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Error fetching clients' });
  }
});

module.exports = router;
