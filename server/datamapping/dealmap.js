const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Deal = require('./models/dealModel');
const User = require('./models/userModel');
const Client = require('./models/clientModel');
const Lead = require('./models/leadModel');
const ServiceCommission = require('./models/serviceCommissionModel'); // Assuming you have a ServiceCommission model
const DealActivityLog = require('./models/dealActivityLogModel'); // New model

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/datamapping', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Load JSON file helper
const loadJSON = (filePath) => {
    const fullPath = path.join(__dirname, 'data', filePath);
    const rawData = fs.readFileSync(fullPath);
    return JSON.parse(rawData);
};

// Function to get pipeline name by ID
const getPipelineName = (pipelineId, pipelinesData) => {
    const pipeline = pipelinesData.find(p => p.id === pipelineId);
    return pipeline ? pipeline.name : 'Unknown Pipeline';
};

// Function to map user data and get role
const mapUserData = (userJson, pipelinesData) => {
    const pipelineName = getPipelineName(userJson.pipeline, pipelinesData);
    const role = `${pipelineName}_${userJson.type}`;
    return {
        name: userJson.name,
        email: userJson.email,
        password: userJson.password,
        image: userJson.avatar,
        role: role,
        branch: userJson.branch || 'Abu Dhabi',
        permissions: [],
        delStatus: userJson.delete_status === '1',
        verified: userJson.is_email_verified === '1',
    };
};

// Find or create a user
const findOrCreateUser = async (userData, pipelinesData) => {
    try {
        const mappedUserData = mapUserData(userData, pipelinesData);
        const { email } = mappedUserData;

        const user = await User.findOneAndUpdate(
            { email },
            mappedUserData,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        return user._id;
    } catch (error) {
        console.error('Error finding or creating user:', error);
        throw error;
    }
};

// Find or create a client
const findOrCreateClient = async (clientData) => {
    try {
        let client = await Client.findOne({ phone: clientData.phone });
        if (!client) {
            client = new Client({
                name: clientData.name,
                email: clientData.email,
                phone: clientData.phone,
                created_at: new Date(clientData.created_at),
                updated_at: new Date(clientData.updated_at),
            });
            await client.save();
        }
        return client._id;
    } catch (error) {
        console.error('Error finding or creating client:', error);
        throw error;
    }
};

// Find a lead by client ID
const findLeadByClientId = async (clientId) => {
    try {
        const lead = await Lead.findOne({ client: clientId });
        return lead ? lead._id : null;
    } catch (error) {
        console.error('Error finding lead by client ID:', error);
        throw error;
    }
};

// Function to create deal activity log
const createDealActivityLog = async (userId, dealId, logType, remark) => {
    try {
        const activityLog = new DealActivityLog({
            user_id: userId,
            deal_id: dealId,
            log_type: logType,
            remark: JSON.stringify(remark),
            created_at: new Date(),
            updated_at: new Date(),
        });
        const savedActivityLog = await activityLog.save();
        return savedActivityLog._id; // Return the ID of the created activity log
    } catch (error) {
        console.error('Error creating deal activity log:', error);
        throw error;
    }
};

// Function to load and insert deals
const loadDeals = async () => {
    try {
        const deals = loadJSON('deals.json');
        const usersData = loadJSON('users.json');
        const clientsData = loadJSON('clients.json');
        const pipelinesData = loadJSON('pipelines.json');
        const sourcesData = loadJSON('sources.json');
        const productsData = loadJSON('products.json');
        const labelsData = loadJSON('labels.json');
        const leadTypesData = loadJSON('lead_types.json');
        const serviceCommissionsData = loadJSON('service_commissions.json');
        const dealActivitiesData = loadJSON('deal_activity.json'); // Load deal activity data

        // Create maps for quick lookups
        const pipelinesMap = new Map(pipelinesData.map(pipeline => [pipeline.id, pipeline.name]));
        const sourcesMap = new Map(sourcesData.map(source => [source.id, source.name]));
        const productsMap = new Map(productsData.map(product => [product.id, product.name]));
        const labelsMap = new Map(labelsData.map(label => [label.id, label.name]));
        const leadTypesMap = new Map(leadTypesData.map(type => [type.id, type.name]));

        // Process each deal
        for (const deal of deals) {
            // Find or create client
            const clientData = clientsData.find(client => client.id === deal.client_id);
            if (!clientData) {
                console.error(`Client with ID ${deal.client_id} not found in clients.json.`);
                continue;
            }
            const clientId = await findOrCreateClient(clientData);

            // Find or create user
            const userData = usersData.find(user => user.id === deal.created_by);
            if (!userData) {
                console.error(`User with ID ${deal.created_by} not found in users.json.`);
                continue;
            }
            const userId = await findOrCreateUser(userData, pipelinesData);

            // Find lead by client ID
            const leadId = await findLeadByClientId(clientId);
            if (!leadId) {
                console.error(`No lead found for client ID ${clientId}.`);
                continue;
            }

            // Transform deal data
            const transformedDeal = {
                is_transfer: deal.is_transfer === null ? false : deal.is_transfer,
                client_id: clientId,
                lead_type: leadTypesMap.get(deal.lead_type) || deal.lead_type,
                pipeline_id: pipelinesMap.get(deal.pipeline_id) || deal.pipeline_id,
                sources: sourcesMap.get(deal.sources) || deal.sources,
                products: productsMap.get(deal.products) || deal.products,
                contract_stage: deal.contract_stage,
                labels: deal.labels ? deal.labels.split(',').map(labelId => labelsMap.get(labelId.trim()) || 'Unknown') : [],
                status: deal.status,
                created_by: userId,
                is_active: deal.is_active === '1' ? true : false,
                lead_id: leadId,
                date: new Date(deal.date),
                created_at: new Date(deal.created_at),
                updated_at: new Date(deal.updated_at),
                activity_logs: [] // Initialize empty activity_logs array
            };

            // Insert Deal into MongoDB
            const newDeal = await Deal.create(transformedDeal);

            // Find or create service commission data for this deal
            const serviceCommissionData = serviceCommissionsData.find(sc => sc.deal_id === deal.id);
            if (serviceCommissionData) {
                // Transform service commission data
                const transformedServiceCommission = {
                    deal_id: newDeal._id,
                    finance_amount: serviceCommissionData.finance_amount,
                    bank_commission: serviceCommissionData.bank_commission,
                    customer_commission: serviceCommissionData.customer_commission,
                    with_vat_commission: serviceCommissionData.with_vat_commission,
                    without_vat_commission: serviceCommissionData.without_vat_commission,
                    hodsale: await findOrCreateUser({ id: serviceCommissionData.hodsale }, pipelinesData),
                    hodsalecommission: serviceCommissionData.hodsalecommission,
                    salemanager: await findOrCreateUser({ id: serviceCommissionData.salemanager }, pipelinesData),
                    salemanagercommission: serviceCommissionData.salemanagercommission,
                    coordinator: await findOrCreateUser({ id: serviceCommissionData.coordinator }, pipelinesData),
                    coordinator_commission: serviceCommissionData.coordinator_commission,
                    team_leader: await findOrCreateUser({ id: serviceCommissionData.team_leader }, pipelinesData),
                    team_leader_commission: serviceCommissionData.team_leader_commission,
                    salesagent: serviceCommissionData.salesagent ? await findOrCreateUser({ id: serviceCommissionData.salesagent }, pipelinesData) : null,
                    team_leader_one: serviceCommissionData.team_leader_one ? await findOrCreateUser({ id: serviceCommissionData.team_leader_one }, pipelinesData) : null,
                    team_leader_one_commission: serviceCommissionData.team_leader_one_commission,
                    sale_agent_one: serviceCommissionData.sale_agent_one ? await findOrCreateUser({ id: serviceCommissionData.sale_agent_one }, pipelinesData) : null,
                    team_leader_two: serviceCommissionData.team_leader_two ? await findOrCreateUser({ id: serviceCommissionData.team_leader_two }, pipelinesData) : null,
                    team_leader_two_commission: serviceCommissionData.team_leader_two_commission,
                    sale_agent_two: serviceCommissionData.sale_agent_two ? await findOrCreateUser({ id: serviceCommissionData.sale_agent_two }, pipelinesData) : null
                };

                // Insert Service Commission into MongoDB
                await ServiceCommission.create(transformedServiceCommission);
            }

            // Create activity logs and update the deal
            const activityLogs = dealActivitiesData.filter(activity => activity.deal_id === deal.id);
            for (const activity of activityLogs) {
                const logId = await createDealActivityLog(userId, newDeal._id, activity.log_type, activity.remark);
                newDeal.activity_logs.push(logId); // Add the log ID to the activity_logs array
            }

            // Save updated deal with activity logs
            await Deal.findByIdAndUpdate(newDeal._id, { activity_logs: newDeal.activity_logs });
        }
    } catch (error) {
        console.error('Error loading deals:', error);
    }
};

// Start the process
loadDeals().then(() => {
    console.log('Deals loaded successfully!');
    mongoose.connection.close();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    console.error('Error starting the process:', error);
});
