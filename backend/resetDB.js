const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const path = require('path');
const connectMongoDB = require('./config/db');
const User = require('./models/User');
const Question = require('./models/Question');
const Slot = require('./models/Slot');
const Booking = require('./models/Booking');
const SheetTopic = require('./models/SheetTopic');
const CS_SHEETS_DATA = require('../frontend/cs_sheets_data');

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const resetDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await connectMongoDB();

    console.log('🗑️  Wiping all collections from "preploop" database...');
    await Promise.all([
      User.deleteMany({}),
      Question.deleteMany({}),
      Slot.deleteMany({}),
      Booking.deleteMany({}),
      SheetTopic.deleteMany({})
    ]);
    console.log('✅ Cleared collections: users, questions, slots, bookings, sheettopics');

    console.log('🌱 Reseeding 32 Core CS sheet topics...');
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
    const inserted = await SheetTopic.insertMany(formattedTopics);
    console.log(`✅ Seeded ${inserted.length} Core CS topics into 'sheettopics' collection.`);

    console.log('\n🎉 DATABASE RESET COMPLETE!');
    console.log('   All users, questions, slots, and bookings are cleared.');
    console.log('   Fresh sheet topics are ready.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset error:', error);
    process.exit(1);
  }
};

resetDatabase();
