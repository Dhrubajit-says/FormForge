const mongoose = require('mongoose');
require('dotenv').config();

const Template = require('../models/Template');
const User = require('../models/User');

async function updateTemplateAssociations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Get all templates
    const templates = await Template.find();
    console.log(`Found ${templates.length} templates`);

    // Update each template and its creator's user document
    for (const template of templates) {
      if (template.creator) {
        // Update user's templates array
        await User.findByIdAndUpdate(
          template.creator,
          { $addToSet: { templates: template._id } },
          { new: true }
        );
        console.log(`Updated user ${template.creator} with template ${template._id}`);
      }
    }

    console.log('Finished updating template associations');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updateTemplateAssociations(); 