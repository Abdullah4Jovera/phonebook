const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Lead = require('../models/leadModel');
const Client = require('../models/clientModel');
const User = require('../models/userModel');
const ActivityLog = require('../models/activityLogModel');
const LeadDiscussion = require('../models/leadDiscussionModel'); // Import LeadDiscussion model
const File = require('../models/fileModel');
const LeadStage = require('../models/leadStageModel');
const Pipeline = require('../models/pipelineModel');
const LeadType = require('../models/leadTypeModel');
const Source = require('../models/sourceModel');
mongoose.connect('mongodb://localhost:27017/maping', { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Helper function to load JSON files
const loadJSON = (filename) => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../data', filename), 'utf-8'));
};

// Function to get pipeline name by ID
const getPipelineName = (pipelineId, pipelinesData) => {
  const pipeline = pipelinesData.find(p => p.id === pipelineId);
  return pipeline ? pipeline.name : 'Unknown Pipeline';
};

// Function to create or find a pipeline
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
const leadTypesData = loadJSON('lead_types.json');
const findOrCreatesource = async (sourceData) => {
  try {
    const leadTypeData = leadTypesData.find(leadType => leadType.id === sourceData.lead_type_id);

    if (!leadTypeData) {
      throw new Error(`Lead type with ID ${sourceData.lead_type_id} not found in leadTypesData.`);
    }

    const leadTypeId = await findOrCreateLeadType(leadTypeData);

    let source = await Source.findOne({ name: sourceData.name });
    if (!source) {
      source = new Source({
        name: sourceData.name,
        lead_type_id: leadTypeId, 
        created_by: sourceData.created_by,
        created_at: new Date(sourceData.created_at),
        updated_at: new Date(sourceData.updated_at),
      });
      await source.save();
    }
    return source._id;
  } catch (error) {
    console.error('Error finding or creating source:', error);
    throw error;
  }
};

const findOrCreateLeadType = async (leadTypeData) => {
  try {
    let leadtype = await LeadType.findOne({ name: leadTypeData.name });
    if (!leadtype) {
      leadtype = new LeadType({
        name: leadTypeData.name,
        created_by: leadTypeData.created_by,
        created_at: new Date(leadTypeData.created_at),
        updated_at: new Date(leadTypeData.updated_at),
      });
      await leadtype.save();
    }
    return leadtype._id;
  } catch (error) {
    console.error('Error finding or creating leadtype:', error);
    throw error;
  }
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



// Function to find or create a client
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

// Function to find or create a user
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
// Function to get selected users for a lead
const getSelectedUsers = async (leadId, userLeadsMap, usersMap, pipelinesData) => {
  const selectedUsers = userLeadsMap
    .filter(userLead => userLead.lead_id === leadId)
    .map(async userLead => {
      const user = usersMap.get(userLead.user_id);
      return user ? await findOrCreateUser(user, pipelinesData) : null;
    });
  return Promise.all(selectedUsers);
};

const pipelinesData = loadJSON('pipelines.json');
// Function to get stage ID by stage data
const getStageId = async (stageData) => {
  try {
    const pipelineId = stageData.pipeline_id;
    const pipelineData = pipelinesData.find(pipeline => pipeline.id === pipelineId);
    if (!pipelineData) {
      throw new Error(`Pipeline with ID ${pipelineId} not found in pipelinesData.`);
    }
    const pipelineDbId = await findOrCreatePipeline(pipelineData);
    let stage = await LeadStage.findOne({ name: stageData.name, pipeline_id: pipelineDbId });

    if (!stage) {
      stage = new LeadStage({
        name: stageData.name,
        pipeline_id: pipelineDbId, // Use the pipeline ID from findOrCreatePipeline
        order: stageData.order,
        created_at: stageData.created_at,
        updated_at: stageData.updated_at,
      });
      await stage.save();
    }

    return stage._id;
  } catch (error) {
    console.error('Error in getStageId:', error);
    throw error;
  }
};

// Function to create activity logs
const createActivityLogs = async (leadId, activityLogs, usersMap, pipelinesData) => {
  const activityLogPromises = activityLogs
    .filter(log => log.lead_id === leadId)
    .map(async log => {
      const user = usersMap.get(log.user_id);
      const userId = user ? await findOrCreateUser(user, pipelinesData) : null;
      const activityLog = new ActivityLog({
        user_id: userId,
        log_type: log.log_type,
        remark: log.remark,
        created_at: new Date(log.created_at),
        updated_at: new Date(log.updated_at),
      });
      await activityLog.save();
      return activityLog._id;
    });
  return Promise.all(activityLogPromises);
};

// Function to create lead discussions
const createLeadDiscussions = async (leadId, discussions, usersMap, pipelinesData) => {
  const discussionPromises = discussions
    .filter(discussion => discussion.lead_id === leadId)
    .map(async discussion => {
      const user = usersMap.get(discussion.created_by);
      const userId = user ? await findOrCreateUser(user, pipelinesData) : null;
      const leadDiscussion = new LeadDiscussion({
        created_by: userId,
        comment: discussion.comment,
        created_at: new Date(discussion.created_at),
        updated_at: new Date(discussion.updated_at),
      });
      await leadDiscussion.save();
      return leadDiscussion._id;
    });
  return Promise.all(discussionPromises);
};
const createLeadFiles = async (leadId, files) => {
  try {
    const filePromises = files
      .filter(file => file.lead_id === leadId)
      .map(async file => {
        const leadFile = new File({
          file_name: file.file_name,
          file_path: file.file_path,
          created_at: new Date(file.created_at),
          updated_at: new Date(file.updated_at),
        });
        await leadFile.save();
        return leadFile._id;
      });
    return Promise.all(filePromises);
  } catch (error) {
    console.error('Error creating lead files:', error);
    throw error;
  }
};


const insertLeads = async () => {
  try {
    const leadsData = loadJSON('leads.json');
    const pipelinesData = loadJSON('pipelines.json');
    const stagesData = loadJSON('lead_stages.json');
    const sourcesData = loadJSON('sources.json');
    const productsData = loadJSON('products.json');
    const labelsData = loadJSON('labels.json');
    const clientsData = loadJSON('clients.json');
    const leadTypesData = loadJSON('lead_types.json');
    const usersData = loadJSON('users.json');
    const businessBankingsData = loadJSON('business_bankings.json');
    const personalLoansData = loadJSON('personal_loans.json'); 
    const mortgageLoansData = loadJSON('mortgage_loans.json'); 
    const userLeadsData = loadJSON('user_leads.json');
    const activityLogsData = loadJSON('lead_activity_logs.json');
    const discussionsData = loadJSON('lead_discussions.json'); 
    const filesData = loadJSON('lead_files.json'); 

    const stagesMap = new Map(stagesData.map(stage => [stage.id, stage]));
    const productsMap = new Map(productsData.map(product => [product.id, product.name]));
    const labelsMap = new Map(labelsData.map(label => [label.id, label.name]));
    const clientsMap = new Map(clientsData.map(client => [client.id, client]));
    const usersMap = new Map(usersData.map(user => [user.id, user]));
    const businessBankingsMap = new Map(businessBankingsData.map(bb => [bb.lead_id, bb]));
    const personalLoansMap = new Map(personalLoansData.map(pl => [pl.lead_id, pl]));
    const mortgageLoansMap = new Map(mortgageLoansData.map(mortgage => [mortgage.lead_id, mortgage]));
    const userLeadsMap = userLeadsData; 

    // Create a map of pipeline IDs and data
    const pipelinesMap = new Map();
    for (const pipelineData of pipelinesData) {
      const pipelineId = await findOrCreatePipeline(pipelineData);
      pipelinesMap.set(pipelineData.id, pipelineId);
    }
    const sourcesMap = new Map();
    for (const sourceData of sourcesData) {
      const pipelineId = await findOrCreatesource(sourceData);
      sourcesMap.set(sourceData.id, pipelineId);
    }
    // Create a map of leadtype IDs and data
    const leadTypeMap = new Map();
    for (const leadTypeData of leadTypesData) {
      const leadTypeId = await findOrCreateLeadType(leadTypeData);
      leadTypeMap.set(leadTypeData.id, leadTypeId);
    }

    const mappedLeads = [];
    for (const lead of leadsData) {
      if (!lead.client_id) {
        console.warn(`Lead with ID ${lead.id} has no client_id`);
        continue;
      }

      const clientData = clientsMap.get(lead.client_id);
      if (!clientData) {
        console.warn(`Client ID ${lead.client_id} not found in clients.json`);
        continue;
      }

      const clientId = await findOrCreateClient(clientData);

      const userData = usersMap.get(lead.created_by);
      const createdBy = userData ? await findOrCreateUser(userData, pipelinesData) : null;
      const selectedUsers = await getSelectedUsers(lead.id, userLeadsMap, usersMap, pipelinesData);
      const activityLogIds = await createActivityLogs(lead.id, activityLogsData, usersMap, pipelinesData);
      const discussionIds = await createLeadDiscussions(lead.id, discussionsData, usersMap, pipelinesData);
      const fileIds = await createLeadFiles(lead.id, filesData);
      const stageId = await getStageId(stagesMap.get(lead.stage_id));
      const PipelineId = pipelinesMap.get(lead.pipeline_id);
      const LeadTypeId = leadTypeMap.get(lead.lead_type);
      const sourceId = sourcesMap.get(lead.sources);


      // Prepare the description field
      let description = lead.notes || '';

      if (lead.products === '1') {
        const businessBankingData = businessBankingsMap.get(lead.id);
        if (businessBankingData) {
          description += `\nBusiness Banking Services: ${businessBankingData.business_banking_services || 'N/A'}`;
          description += `\nCompany Name: ${businessBankingData.company_name || 'N/A'}`;
          description += `\nYearly Turnover: ${businessBankingData.yearly_turnover || 'N/A'}`;
          description += `\nHave Any POS: ${businessBankingData.have_any_pos || 'N/A'}`;
          description += `\nMonthly Amount: ${businessBankingData.monthly_amount || 'N/A'}`;
          description += `\nHave Auto Finance: ${businessBankingData.have_auto_finance || 'N/A'}`;
          description += `\nMonthly EMI: ${businessBankingData.monthly_emi || 'N/A'}`;
          description += `\nNotes: ${businessBankingData.notes || 'N/A'}`;
        } else {
          console.warn(`Business banking data not found for lead ID ${lead.id}`);
        }
      }

      if (lead.products === '2') {
        const personalLoanData = personalLoansMap.get(lead.id);
        if (personalLoanData) {
          description += `\nCompany Name: ${personalLoanData.company_name || 'N/A'}`;
          description += `\nMonthly Salary: ${personalLoanData.monthly_salary || 'N/A'}`;
          description += `\nLoan Amount: ${personalLoanData.load_amount || 'N/A'}`;
          description += `\nHave Any Loan: ${personalLoanData.have_any_loan || 'N/A'}`;
          description += `\nTaken Loan Amount: ${personalLoanData.taken_loan_amount || 'N/A'}`;
          description += `\nNotes: ${personalLoanData.notes || 'N/A'}`;
        } else {
          console.warn(`Personal loan data not found for lead ID ${lead.id}`);
        }
      }

      if (lead.products === '3') {
        const mortgageLoanData = mortgageLoansMap.get(lead.id);
        if (mortgageLoanData) {
          description += `\nType of Property: ${mortgageLoanData.type_of_property || 'N/A'}`;
          description += `\nLocation: ${mortgageLoanData.location || 'N/A'}`;
          description += `\nMonthly Income: ${mortgageLoanData.monthly_income || 'N/A'}`;
          description += `\nHave Any Other Loan: ${mortgageLoanData.have_any_other_loan || 'N/A'}`;
          description += `\nLoan Amount: ${mortgageLoanData.loanAmount || 'N/A'}`;
          description += `\nNotes: ${mortgageLoanData.notes || 'N/A'}`;
        } else {
          console.warn(`Mortgage loan data not found for lead ID ${lead.id}`);
        }
      }

        // Handle boolean fields based on the lead data
      const isActive = lead.is_active === 1 ? true : false;
      const isConverted = lead.is_converted === 1 ? true : false;
      const isReject = lead.is_reject === 1 ? true : false; 
      const newLead = new Lead({
        client: clientId,
        pipeline_id: PipelineId,
        description,
        lead_type: LeadTypeId,
        source: sourceId,
        stage: stageId,
        products: productsMap.get(lead.products) || 'Unknown',
        notes: lead.notes || '',
        labels: lead.labels ? lead.labels.split(',').map(labelId => labelsMap.get(labelId.trim()) || 'Unknown') : [],
        description: description.trim(),
        created_by: createdBy,
        selected_users: selectedUsers,
        activity_logs: activityLogIds,
        discussions: discussionIds, 
        order: lead.order || '',
        files: fileIds,
        is_active: isActive,         
        is_converted: isConverted,   
        is_reject: isReject, 
        created_at: new Date(lead.created_at),
        updated_at: new Date(lead.updated_at),
      });

      await newLead.save();
      mappedLeads.push(newLead);
    }

    console.log('Leads inserted:', mappedLeads);
  } catch (error) {
    console.error('Error inserting leads:', error);
  } finally {
    mongoose.disconnect();
  }
};

insertLeads();



   

