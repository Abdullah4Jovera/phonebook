const mongoose = require('mongoose');
const LeadStage = require('../models/leadStageModel');
const Pipeline = require('../models/pipelineModel');
const fs = require('fs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/maping', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Load JSON data
const leadStagesData = JSON.parse(fs.readFileSync('../data/lead_stages.json', 'utf-8'));
const pipelinesData = JSON.parse(fs.readFileSync('../data/pipelines.json', 'utf-8'));

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

// Function to insert lead stages
const insertLeadStages = async () => {
  try {
    for (const stageData of leadStagesData) {
      const pipelineData = pipelinesData.find(p => p.id === stageData.pipeline_id);
      
      if (!pipelineData) {
        console.error(`Pipeline with ID ${stageData.pipeline_id} not found.`);
        continue;
      }

      const pipelineDbId = await findOrCreatePipeline(pipelineData);

      let stage = await LeadStage.findOne({ name: stageData.name, pipeline_id: pipelineDbId });
      
      if (!stage) {
        stage = new LeadStage({
          name: stageData.name,
          pipeline_id: pipelineDbId,
          order: stageData.order,
          created_at: stageData.created_at ? new Date(stageData.created_at) : null,
          updated_at: new Date(stageData.updated_at),
        });
        await stage.save();
        console.log(`Inserted lead stage: ${stage.name}`);
      } else {
        console.log(`Lead stage already exists: ${stage.name}`);
      }
    }
    console.log('Data insertion completed.');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error inserting lead stages:', error);
  }
};

// Run the insertion script
insertLeadStages();
