const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Phonebook = require('../models/phonebookModel'); 
const User = require('../models/userModel');
const { isAuth } = require('../utils');
const Comment = require('../models/commentModel');
const router = express.Router();
const upload = multer({ dest: 'uploads' }); 
const Client = require('../models/clientModel');

router.post('/add-user-to-phonebooks', isAuth, async (req, res) => {
    try {
        const { userIds, phonebookIds } = req.body;

        // Validate input
        if (!userIds || !Array.isArray(phonebookIds) || phonebookIds.length === 0) {
            return res.status(400).json({ message: 'User ID and Phonebook IDs are required' });
        }

        // Validate user ID
        const user = await User.findById(userIds);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate and update each phonebook entry
        const updatePromises = phonebookIds.map(async (phonebookId) => {
            const phonebookEntry = await Phonebook.findById(phonebookId);
            if (!phonebookEntry) {
                return Promise.reject(new Error(`Phonebook entry with ID ${phonebookId} not found`));
            }

            // Add user to selected_users if not already present
            if (!phonebookEntry.selected_users.includes(userIds)) {
                phonebookEntry.selected_users.push(userIds);
                return phonebookEntry.save();
            }

            return Promise.resolve(); // No update needed
        });

        await Promise.all(updatePromises);
        res.status(200).json({ message: 'User added to phonebooks successfully!' });
    } catch (error) {
        console.error('Error adding user to phonebooks:', error);
        res.status(500).json({ message: 'Error adding user to phonebooks' });
    }
});
router.put('/update-calstatus/:phonebookId', isAuth, async (req, res) => {
    try {
        const { calstatus } = req.body;
        const { phonebookId } = req.params;

        // Validate the calstatus value
        if (!['Req to call', 'Interested', 'Rejected', 'Convert to Lead'].includes(calstatus)) {
            return res.status(400).json({ message: 'Invalid calstatus value' });
        }

        // Find and update the phonebook entry's calstatus
        const phonebookEntry = await Phonebook.findByIdAndUpdate(phonebookId, { calstatus }, { new: true });
        if (!phonebookEntry) {
            return res.status(404).json({ message: 'Phonebook entry not found' });
        }

        res.status(200).json({ message: 'Calstatus updated successfully!', phonebookEntry });
    } catch (error) {
        console.error('Error updating calstatus:', error);
        res.status(500).json({ message: 'Error updating calstatus' });
    }
});
router.post('/upload-csv', upload.single('file'), async (req, res) => {
    try {
        const { userId, pipelineId } = req.body;

        // Validate required fields
        if (!userId || !pipelineId) {
            return res.status(400).json({ message: 'User ID and Pipeline ID are required' });
        }

        const filePath = path.join(__dirname, '../uploads', req.file.filename);
        const phonebookEntries = [];

        // Determine roles based on pipeline
        let rolesToFetch = [];
        switch (pipelineId) {
            case '66c9ab88bc379c4182a4f13c': 
                rolesToFetch = ['Personal_Loan_HOD'];
                break;
            case '66c9ab88bc379c4182a4f142': 
                rolesToFetch = ['Bussiness_HOD', 'Bussiness_Manager'];
                break;
            case '66c9ab88bc379c4182a4f145': 
                rolesToFetch = ['Mortgage_HOD'];
                break;
            case '66c9ab88bc379c4182a4f148': 
                rolesToFetch = ['CEO_Mortgage_HOD'];
                break;
            default:
                return res.status(400).json({ message: 'Invalid pipeline ID' });
        }

        // Fetch users based on roles
        const selectedUsers = await User.find({ role: { $in: rolesToFetch } }).select('_id').exec();
        let selectedUserIds = selectedUsers.map(user => user._id.toString());

        // Add the userId from req.body to the selected users
        selectedUserIds.push(userId);

        // Ensure the selectedUserIds array contains only unique user IDs
        selectedUserIds = [...new Set(selectedUserIds)];

        // Collect phone numbers from the CSV
        const phoneNumbers = [];

        // Parse CSV file
        fs.createReadStream(filePath)
            .pipe(csv(['number', 'status']))
            .on('data', (row) => {
                if (row.number && row.status) {
                    phoneNumbers.push(row.number);
                }
            })
            .on('end', async () => {
                try {
                    // Find existing phone numbers in the Client model
                    const existingClients = await Client.find({ phone: { $in: phoneNumbers } }).select('phone').exec();
                    const existingPhoneNumbers = new Set(existingClients.map(client => client.phone));

                    // Filter out phone numbers that already exist
                    const newPhonebookEntries = phoneNumbers
                        .filter(number => !existingPhoneNumbers.has(number))
                        .map(number => ({
                            user: userId,
                            pipeline: pipelineId,
                            selected_users: selectedUserIds,
                            number: number,
                            status: 'Pending' // Default status if needed
                        }));

                    // Insert new phonebook entries
                    if (newPhonebookEntries.length > 0) {
                        await Phonebook.insertMany(newPhonebookEntries);
                    }

                    res.status(200).json({ message: 'Phonebook entries added successfully!' });
                } catch (error) {
                    console.error('Error inserting phonebook entries:', error);
                    res.status(500).json({ message: 'Error inserting phonebook entries' });
                } finally {
                    // Delete the file after processing
                    fs.unlink(filePath, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                }
            })
            .on('error', (error) => {
                console.error('Error parsing CSV file:', error);
                res.status(500).json({ message: 'Error parsing CSV file' });
            });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ message: 'Error processing request' });
    }
});
router.get('/get-all-phonebook', isAuth, async (req, res) => {
    try {
        const userId = req.user._id;

        // Find phonebook entries that belong to the selected users and do not have the calstatus 'Convert to Lead'
        const phonebookEntries = await Phonebook.find({ 
                selected_users: userId,
                calstatus: { $ne: 'Convert to Lead' } // Exclude entries where calstatus is 'Convert to Lead'
            })
            .populate('user', 'name')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'name', // Only fetch the name of the user who made the comment
                }
            });

        res.status(200).json(phonebookEntries);
    } catch (error) {
        console.error('Error fetching phonebook entries:', error);
        res.status(500).json({ message: 'Error fetching phonebook entries' });
    }
});
router.get('/get-phonebook-by-user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const phonebookEntries = await Phonebook.find({ user: userId})
            .populate('user', 'name'); 
        res.status(200).json(phonebookEntries);
    } catch (error) {
        console.error('Error fetching phonebook entries by user:', error);
        res.status(500).json({ message: 'Error fetching phonebook entries by user' });
    }
});
// New Route: Add a comment to a specific phonebook entry
router.post('/add-comment', isAuth, async (req, res) => {
    try {
        const { phonebookId, comment } = req.body;

        // Validate required fields
        if (!phonebookId || !comment) {
            return res.status(400).json({ message: 'Phonebook ID and comment are required' });
        }

        // Find the phonebook entry
        const phonebookEntry = await Phonebook.findById(phonebookId);
        if (!phonebookEntry) {
            return res.status(404).json({ message: 'Phonebook entry not found' });
        }

        // Create a new comment
        const newComment = new Comment({
            user: req.user._id,
            remarks: comment,
        });
        await newComment.save();

        // Add the comment to the phonebook entry's comments array
        phonebookEntry.comments.push(newComment._id);
        await phonebookEntry.save();

        res.status(200).json({ message: 'Comment added successfully!', comment: newComment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error adding comment' });
    }
});
// New Route: Update the calstatus of a phonebook entry

// New Route: Get all phonebook entries with status "BLOCKED"
router.get('/get-blocked-numbers', isAuth, async (req, res) => {
    try {
      
        const blockedEntries = await Phonebook.find({ status: 'BLOCKED' })
            .populate('user', 'name email')  
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'name',  
                }
            });

        res.status(200).json(blockedEntries);
    } catch (error) {
        console.error('Error fetching blocked phonebook entries:', error);
        res.status(500).json({ message: 'Error fetching blocked phonebook entries' });
    }
});
module.exports = router;
