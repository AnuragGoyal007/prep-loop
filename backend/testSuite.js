// backend/testSuite.js - Comprehensive End-to-End Audit & AtlasDB Verification
const dns = require('dns');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Configure environment & DNS for Atlas
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const app = require('./server');
const connectMongoDB = require('./config/db');
const User = require('./models/User');
const Question = require('./models/Question');
const Slot = require('./models/Slot');
const Booking = require('./models/Booking');
const SheetTopic = require('./models/SheetTopic');
const CS_SHEETS_DATA = require('../frontend/cs_sheets_data');

// Mini HTTP client for testing express app directly
const http = require('http');

let serverInstance;
let PORT = 5055;
let BASE = `http://127.0.0.1:${PORT}`;

function apiRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runAudit() {
  console.log('================================================================');
  console.log('🚀 PREPLOOP COMPLETE END-TO-END AUDIT & ATLAS VERIFICATION SUITE');
  console.log('================================================================\n');

  try {
    await connectMongoDB();
    console.log('✅ 1. MongoDB Atlas Connection: HEALTHY & CONNECTED');

    // Start ephemeral test server
    serverInstance = app.listen(PORT);
    console.log(`✅ 2. Test Server active on port ${PORT}\n`);

    // -------------------------------------------------------------------------
    // TEST SECTION A: USER AUTHENTICATION & ATLAS DOCUMENT VERIFICATION
    // -------------------------------------------------------------------------
    console.log('--- [TEST A] User Registration, Login & Google OAuth in Atlas ---');

    const testEmail = `audit_student_${Date.now()}@example.com`;
    const regPayload = {
      name: "Audit Candidate",
      email: testEmail,
      password: "SecretPassword123!",
      university: "Chitkara University",
      course: "B.Tech CSE AIML",
      year: "3rd Year",
      leetcode: "audit_leet",
      gfg: "audit_gfg",
      github: "audit_git"
    };

    // A1: Register User
    const regRes = await apiRequest('POST', '/api/auth/register', regPayload);
    if (regRes.status !== 201 || !regRes.data.token) {
      throw new Error(`Registration failed with status ${regRes.status}: ${JSON.stringify(regRes.data)}`);
    }
    const token = regRes.data.token;
    console.log(`  ✓ Registration API: Success (User ID: ${regRes.data._id})`);

    // Verify in Atlas
    const userDocInAtlas = await User.findOne({ email: testEmail });
    if (!userDocInAtlas || userDocInAtlas.isGoogle !== false || userDocInAtlas.university !== "Chitkara University") {
      throw new Error('Atlas DB verification failed: User document not properly recorded in Atlas');
    }
    console.log(`  ✓ Atlas DB Check: Document verified in 'users' collection (isGoogle = ${userDocInAtlas.isGoogle}, Hashed Password present)`);

    // A2: Standard Login
    const loginRes = await apiRequest('POST', '/api/auth/login', { email: testEmail, password: "SecretPassword123!" });
    if (loginRes.status !== 200 || !loginRes.data.token) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }
    console.log('  ✓ Standard Login API: Authenticated successfully & received JWT');

    // A3: Authenticated /api/auth/me
    const meRes = await apiRequest('GET', '/api/auth/me', null, token);
    if (meRes.status !== 200 || meRes.data.email !== testEmail) {
      throw new Error('Auth /me failed');
    }
    console.log(`  ✓ Protected Route /api/auth/me: Verified token claims for ${meRes.data.name}`);

    // A4: Google Sync via /api/auth/google
    const googleRes = await apiRequest('POST', '/api/auth/google', {
      email: testEmail,
      name: "Audit Candidate",
      googleId: "google-uid-998877",
      avatar: "https://lh3.googleusercontent.com/avatar-test"
    });
    if (googleRes.status !== 200 || googleRes.data.isGoogle !== true) {
      throw new Error('Google auth sync failed');
    }

    const updatedUserInAtlas = await User.findOne({ email: testEmail });
    if (!updatedUserInAtlas || updatedUserInAtlas.isGoogle !== true || updatedUserInAtlas.googleId !== "google-uid-998877") {
      throw new Error('Atlas DB check failed: isGoogle was not set to true in Atlas');
    }
    console.log(`  ✓ Google OAuth Sync: Atlas user document updated (isGoogle = ${updatedUserInAtlas.isGoogle}, googleId = ${updatedUserInAtlas.googleId})\n`);

    // -------------------------------------------------------------------------
    // TEST SECTION B: SM-2 QUESTION SPACED REPETITION LOOP & ATLAS UPDATES
    // -------------------------------------------------------------------------
    console.log('--- [TEST B] SM-2 Question Spaced Repetition Loop in Atlas ---');

    // B1: Add new Question (First attempt)
    const newQPayload = {
      topic: "LRU Cache Implementation",
      tag: "DSA",
      difficulty: "hard",
      outcome: "solved",
      timeTaken: 25,
      repetition: 1,
      interval: 1,
      easeFactor: 2.5,
      nextReviewDate: "2026-10-26"
    };

    const addQRes = await apiRequest('POST', '/api/questions', newQPayload, token);
    if (addQRes.status !== 201 || !addQRes.data._id) {
      throw new Error(`Add question failed: ${JSON.stringify(addQRes.data)}`);
    }
    const qId = addQRes.data._id;
    console.log(`  ✓ Add Question API: Created question '${newQPayload.topic}' with ID: ${qId}`);

    // Verify in Atlas
    let qDocInAtlas = await Question.findById(qId);
    if (!qDocInAtlas || qDocInAtlas.interval !== 1 || qDocInAtlas.easeFactor !== 2.5) {
      throw new Error('Atlas DB check failed: Question not found in Atlas');
    }
    console.log(`  ✓ Atlas DB Check: Found question in 'questions' collection (interval: ${qDocInAtlas.interval}d, easeFactor: ${qDocInAtlas.easeFactor})`);

    // B2: SM-2 Review Attempt (Recalculation Loop)
    // Simulate reviewing the question correctly again: interval jumps to 6d, easeFactor updates to 2.6
    const reviewPayload = {
      repetition: 2,
      interval: 6,
      easeFactor: 2.6,
      timeTaken: 18,
      outcome: "solved",
      nextReviewDate: "2026-11-01"
    };
    const updateQRes = await apiRequest('PUT', `/api/questions/${qId}`, reviewPayload, token);
    if (updateQRes.status !== 200) {
      throw new Error(`Update question failed: ${JSON.stringify(updateQRes.data)}`);
    }
    console.log(`  ✓ SM-2 Review Loop API: Recalculated parameters sent to PUT /api/questions/${qId}`);

    // Verify revision parameters in Atlas
    qDocInAtlas = await Question.findById(qId);
    if (qDocInAtlas.interval !== 6 || qDocInAtlas.easeFactor !== 2.6 || qDocInAtlas.repetition !== 2) {
      throw new Error('Atlas DB check failed: SM-2 parameters were not updated in Atlas');
    }
    console.log(`  ✓ Atlas DB Check: Verified updated SM-2 fields in Atlas (interval: ${qDocInAtlas.interval}d, easeFactor: ${qDocInAtlas.easeFactor}, nextReview: ${qDocInAtlas.nextReviewDate})`);

    // B3: Delete Question
    const delQRes = await apiRequest('DELETE', `/api/questions/${qId}`, null, token);
    if (delQRes.status !== 200) {
      throw new Error(`Delete question failed: ${JSON.stringify(delQRes.data)}`);
    }
    const checkDeletedQ = await Question.findById(qId);
    if (checkDeletedQ) {
      throw new Error('Atlas DB check failed: Question still exists after DELETE');
    }
    console.log(`  ✓ Delete Question API & Atlas Check: Question successfully removed from Atlas\n`);

    // -------------------------------------------------------------------------
    // TEST SECTION C: MOCK INTERVIEW SCHEDULER & BOOKINGS IN ATLAS
    // -------------------------------------------------------------------------
    console.log('--- [TEST C] Mock Interview Scheduler (Slots, Bookings, Feedback, Deletion) ---');

    // C1: Create Slot
    const slotPayload = {
      hostName: "Audit Host",
      day: "Friday",
      time: "15:00",
      tag: "System Design",
      link: ""
    };
    const slotRes = await apiRequest('POST', '/api/scheduler/slots', slotPayload);
    if (slotRes.status !== 201 || !slotRes.data._id) {
      throw new Error(`Create slot failed: ${JSON.stringify(slotRes.data)}`);
    }
    const slotId = slotRes.data._id;
    console.log(`  ✓ Create Slot API: Created open slot for ${slotPayload.day} ${slotPayload.time} (ID: ${slotId})`);

    let slotDocInAtlas = await Slot.findById(slotId);
    if (!slotDocInAtlas || slotDocInAtlas.isBooked !== false) {
      throw new Error('Atlas DB check failed: Slot not found or already booked in Atlas');
    }
    console.log(`  ✓ Atlas DB Check: Slot confirmed in 'slots' collection (isBooked = ${slotDocInAtlas.isBooked})`);

    // C2: Book the Slot
    const bookPayload = {
      slotId: slotId,
      requesterName: "Audit Candidate"
    };
    const bookRes = await apiRequest('POST', '/api/scheduler/bookings', bookPayload);
    if (bookRes.status !== 201 || !bookRes.data._id) {
      throw new Error(`Book slot failed: ${JSON.stringify(bookRes.data)}`);
    }
    const bookingId = bookRes.data._id;
    console.log(`  ✓ Book Slot API: Created confirmed booking (ID: ${bookingId})`);

    // Verify booking and slot status in Atlas
    slotDocInAtlas = await Slot.findById(slotId);
    const bookingDocInAtlas = await Booking.findById(bookingId);
    if (!slotDocInAtlas.isBooked || !bookingDocInAtlas) {
      throw new Error('Atlas DB check failed: Slot was not marked booked or booking was not saved');
    }
    console.log(`  ✓ Atlas DB Check: Slot isBooked status updated to ${slotDocInAtlas.isBooked} in Atlas`);

    // C3: Submit Reflection Feedback
    const feedbackPayload = {
      communication: 5,
      problemSolving: 5,
      codeQuality: 4,
      comment: "Exceptional candidate with deep knowledge of SM-2 and Atlas!"
    };
    const feedbackRes = await apiRequest('POST', `/api/scheduler/bookings/${bookingId}/feedback`, feedbackPayload);
    if (feedbackRes.status !== 200) {
      throw new Error(`Submit feedback failed: ${JSON.stringify(feedbackRes.data)}`);
    }

    const updatedBookingInAtlas = await Booking.findById(bookingId);
    if (!updatedBookingInAtlas || updatedBookingInAtlas.communication !== 5 || !updatedBookingInAtlas.comment.includes('Exceptional')) {
      throw new Error('Atlas DB check failed: Feedback was not saved in Atlas');
    }
    console.log(`  ✓ Submit Feedback API & Atlas Check: Feedback recorded in Atlas booking (Communication: ${updatedBookingInAtlas.communication}/5)`);

    // C4: Cancel Booking & Release Slot
    const cancelRes = await apiRequest('DELETE', `/api/scheduler/bookings/${bookingId}`);
    if (cancelRes.status !== 200) {
      throw new Error(`Cancel booking failed: ${JSON.stringify(cancelRes.data)}`);
    }

    slotDocInAtlas = await Slot.findById(slotId);
    const checkBookingDeleted = await Booking.findById(bookingId);
    if (checkBookingDeleted || slotDocInAtlas.isBooked !== false) {
      throw new Error('Atlas DB check failed: Booking was not removed or slot was not freed in Atlas');
    }
    console.log(`  ✓ Cancel Booking API & Atlas Check: Booking removed and slot freed in Atlas (isBooked = ${slotDocInAtlas.isBooked})`);

    // C5: Delete Slot
    const delSlotRes = await apiRequest('DELETE', `/api/scheduler/slots/${slotId}`);
    if (delSlotRes.status !== 200) {
      throw new Error(`Delete slot failed: ${JSON.stringify(delSlotRes.data)}`);
    }
    const checkSlotDeleted = await Slot.findById(slotId);
    if (checkSlotDeleted) {
      throw new Error('Atlas DB check failed: Slot still exists after deletion');
    }
    console.log(`  ✓ Delete Slot API & Atlas Check: Slot removed from Atlas 'slots' collection\n`);

    // -------------------------------------------------------------------------
    // TEST SECTION D: CORE CS SHEETS REPOSITORY IN ATLAS
    // -------------------------------------------------------------------------
    console.log('--- [TEST D] Core CS Sheets Collection in Atlas ---');
    const sheetsRes = await apiRequest('GET', '/api/sheets');
    if (sheetsRes.status !== 200 || !Array.isArray(sheetsRes.data) || sheetsRes.data.length === 0) {
      throw new Error('Get sheets failed or returned 0 topics');
    }
    console.log(`  ✓ GET /api/sheets: Returned ${sheetsRes.data.length} curated Striver Core CS topics from Atlas\n`);

    console.log('================================================================');
    console.log('🎉 ALL SYSTEM AUDIT CHECKS PASSED WITH 100% SUCCESS!');
    console.log('================================================================\n');

    // -------------------------------------------------------------------------
    // FINAL STEP: RESET DATABASE & RESEED SHEET TOPICS AS REQUESTED
    // -------------------------------------------------------------------------
    console.log('🔄 FINAL STEP: Resetting Atlas DB & Reseeding fresh sheet topics...');
    await Promise.all([
      User.deleteMany({}),
      Question.deleteMany({}),
      Slot.deleteMany({}),
      Booking.deleteMany({}),
      SheetTopic.deleteMany({})
    ]);

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
    await SheetTopic.insertMany(formattedTopics);

    const userCount = await User.countDocuments();
    const qCount = await Question.countDocuments();
    const slotCount = await Slot.countDocuments();
    const bookCount = await Booking.countDocuments();
    const topicCount = await SheetTopic.countDocuments();

    console.log(`✅ Atlas Database 'preploop' has been completely reset:`);
    console.log(`   - users: ${userCount}`);
    console.log(`   - questions: ${qCount}`);
    console.log(`   - slots: ${slotCount}`);
    console.log(`   - bookings: ${bookCount}`);
    console.log(`   - sheettopics: ${topicCount} (32 Curated Core CS topics ready)`);

    serverInstance.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ AUDIT FAILED:', error);
    if (serverInstance) serverInstance.close();
    process.exit(1);
  }
}

runAudit();
