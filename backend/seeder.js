const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const path = require('path');
const SheetTopic = require('./models/SheetTopic');
const connectMongoDB = require('./config/db');

dotenv.config();

// Fix for Node on Windows querySrv ECONNREFUSED with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore fallback
}

// Load Core CS topics directly from frontend data module
const CS_SHEETS_DATA = require('../frontend/cs_sheets_data');

const seedDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await connectMongoDB();

    const rawTopics = CS_SHEETS_DATA.getAllTopics();
    const formattedTopics = rawTopics.map(t => ({
      topicId: t.id,
      subject: t.subject,
      category: t.category,
      title: t.title,
      difficulty: t.difficulty || 'medium',
      isHighFrequency: Boolean(t.isHighFrequency),
      description: t.description || '',
      keyTakeaways: t.keyTakeaways || '',
      link: t.link || ''
    }));

    console.log('🗑️  Clearing existing SheetTopics in MongoDB Atlas...');
    await SheetTopic.deleteMany({});

    console.log(`🌱 Seeding ${formattedTopics.length} curated Striver Core CS topics into MongoDB Atlas...`);
    const inserted = await SheetTopic.insertMany(formattedTopics);

    console.log(`\n🎉 SUCCESS! Successfully seeded ${inserted.length} topics into MongoDB Atlas collection: 'sheettopics'`);
    console.log('   Subjects seeded: Operating Systems (OS), Database Systems (DBMS), Computer Networks (CN)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
};

seedDB();
