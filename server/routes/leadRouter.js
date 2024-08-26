
const express = require('express');
const router = express.Router();
const Lead = require('../models/leadModel');
const { isAuth, hasRole } = require('../utils');

router.get('/get-leads', isAuth, async (req, res) => { 
    try {
        const { pipeline, subpipeline } = req.user;
        const { page = 1, limit = 2000 } = req.query;  
        const userId = req.user._id;
        const userBranch = req.user.branch; // Extract branch from req.user

        let leadsQuery = { selected_users: userId };
        
        if (pipeline) {
            leadsQuery.pipeline_id = pipeline;
        }
        if (subpipeline) {
            leadsQuery.subpipeline_id = subpipeline;
        }
        if (userBranch !== null) { // Only include branch filter if userBranch is not null
            leadsQuery.branch = userBranch;
        }

        const leads = await Lead.find(leadsQuery)
            .populate('branch')
            .populate('pipeline_id')
            .populate('subpipeline_id')
            .populate('stage')
            .populate('lead_type')
            .populate({
                path: 'source',
                populate: {
                    path: 'lead_type_id',
                    select: 'name created_by'
                }
            })
            .populate('created_by', 'name email')
            .populate('client', 'name email')
            .populate('selected_users', 'name email')
            .populate({
                path: 'activity_logs',
                populate: {
                    path: 'user_id',
                    select: 'name email'
                }
            })
            // .populate({
            //     path: 'discussions',
            //     select: 'comment created_at',
            //     populate: {
            //         path: 'created_by',
            //         select: 'name email'
            //     }
            // })
            .populate({
                path: 'files',
                select: 'file_name file_path created_at updated_at'
            })
            .populate({
                path: 'stage',
                populate: {
                    path: 'pipeline_id',  
                    select: 'name created_by'  
                }
            })
            .populate('branch', 'name')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .exec();

        leads.forEach(lead => {
            if (lead.files) {
                lead.files.forEach(file => {
                    file.file_path = `${file.file_path}`;
                });
            }
        });

        const totalLeads = await Lead.countDocuments(leadsQuery);
        const totalPages = Math.ceil(totalLeads / limit);

        res.status(200).json({
            leads,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ message: 'Error fetching leads' });
    }
});


router.get('/get-all-leads', async (req, res) => {
    try {
        const { page = 1, limit = 1000, pipeline_id, branch_id } = req.query;  
        const skip = (page - 1) * limit;

       
        let query = {};
        if (pipeline_id) {
            query['pipeline_id'] = pipeline_id;
        }
        if (branch_id) {
            query['branch'] = branch_id;
        }

        const leads = await Lead.find(query)
            .populate('pipeline_id', 'name created_by') 
            .populate('subpipeline_id', 'name') 
            .populate('stage', 'name order') 
            .populate('lead_type', 'name') 
            .populate('source', 'name') 
            .populate('created_by', 'name email') 
            .populate('client', 'name email') 
            .populate('selected_users', 'name email') 
            .populate({
                path: 'activity_logs',
                populate: {
                    path: 'user_id',
                    select: 'name email'
                }
            }) 
            .populate({
                path: 'files',
                select: 'file_name file_path created_at updated_at'
            }) 
            .populate('branch', 'name') 
            .skip(skip)
            .limit(parseInt(limit))
            .exec();

     
        const totalLeads = await Lead.countDocuments(query);
        const totalPages = Math.ceil(totalLeads / limit);

        
        leads.forEach(lead => {
            if (lead.files) {
                lead.files.forEach(file => {
                    file.file_path = `${file.file_path}`;
                });
            }
        });

        res.status(200).json({
            leads,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ message: 'Error fetching leads' });
    }
});


module.exports = router;
