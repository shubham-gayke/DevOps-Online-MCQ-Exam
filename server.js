const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Read atlas-credentials.env
let mongoUri = process.env.MONGODB_URI;
if (!mongoUri && fs.existsSync(path.join(__dirname, 'atlas-credentials.env'))) {
  const envContent = fs.readFileSync(path.join(__dirname, 'atlas-credentials.env'), 'utf8');
  const uriMatch = envContent.match(/MONGODB_URI=["'](.+)["']/);
  if (uriMatch) {
    mongoUri = uriMatch[1];
  }
}

if (!mongoUri) {
  console.warn('WARNING: MONGODB_URI not found in environment or atlas-credentials.env.');
}

const app = express();
const PORT = process.env.PORT || 3000;
const DB_NAME = 'devops_exam_hub';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

// Auto-connect middleware for serverless invocations (e.g. Vercel)
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && !db) {
    await connectToMongo();
  }
  next();
});

// Root route to serve frontend index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

let dbClient = null;
let db = null;

// Connect to MongoDB Atlas
async function connectToMongo() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    dbClient = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });
    await dbClient.connect();
    db = dbClient.db(DB_NAME);
    console.log(`Connected to MongoDB Atlas database: ${DB_NAME}`);

    // Auto-seed questions into database if needed
    await seedQuestionsIfEmpty();
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas:', err.message);
  }
}

// Function to collect all 100 questions from local JS files
function loadLocalQuestionBank() {
  global.window = { QUESTION_BANK: [] };
  const topicFiles = ['git', 'github', 'terraform', 'ansible', 'docker', 'kubernetes'];
  topicFiles.forEach(t => {
    delete require.cache[require.resolve(`./js/questions/${t}.js`)];
    require(`./js/questions/${t}.js`);
  });
  return global.window.QUESTION_BANK;
}

// Seed questions if collection is empty
async function seedQuestionsIfEmpty() {
  if (!db) return;
  try {
    const questionsCol = db.collection('questions');
    const count = await questionsCol.countDocuments();
    if (count === 0) {
      console.log('Seeding all 100 questions into MongoDB Atlas...');
      const bank = loadLocalQuestionBank();
      const result = await questionsCol.insertMany(bank);
      console.log(`Successfully seeded ${result.insertedCount} questions to MongoDB Atlas!`);
    } else {
      console.log(`MongoDB Atlas contains ${count} questions. Question bank ready.`);
    }
  } catch (err) {
    console.error('Error seeding questions:', err.message);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// API ROUTES
// ═════════════════════════════════════════════════════════════════════════════
const apiRouter = express.Router();

// Health / Status
async function handleStatus(req, res) {
  const isConnected = !!db;
  let questionCount = 0;
  let studentCount = 0;
  let submissionCount = 0;

  if (isConnected) {
    try {
      questionCount = await db.collection('questions').countDocuments();
      studentCount = await db.collection('students').countDocuments();
      submissionCount = await db.collection('submissions').countDocuments();
    } catch (e) {
      // ignore
    }
  }

  res.json({
    status: isConnected ? 'connected' : 'disconnected',
    database: DB_NAME,
    stats: {
      questions: questionCount,
      students: studentCount,
      submissions: submissionCount
    }
  });
}

apiRouter.get('/status', handleStatus);
apiRouter.get('/db-status', handleStatus);

// Student registration / account creation
apiRouter.post('/students/register', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }

  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Student name and email are required' });
  }

  const cleanName = String(name).trim();
  const cleanEmail = String(email).trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Invalid email address format' });
  }

  try {
    const studentsCol = db.collection('students');
    const existing = await studentsCol.findOne({ email: cleanEmail });

    if (existing) {
      // Update last login
      await studentsCol.updateOne(
        { _id: existing._id },
        { $set: { name: cleanName, lastLoginAt: new Date() } }
      );
      return res.json({
        success: true,
        message: 'Student account authenticated',
        student: {
          id: existing._id,
          name: cleanName,
          email: cleanEmail,
          isNew: false
        }
      });
    }

    // Create new student
    const newStudent = {
      name: cleanName,
      email: cleanEmail,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      examAttempts: 0
    };

    const insertResult = await studentsCol.insertOne(newStudent);
    console.log(`Created new student account in MongoDB: ${cleanEmail} (${cleanName})`);

    res.json({
      success: true,
      message: 'Student account created successfully in MongoDB Atlas',
      student: {
        id: insertResult.insertedId,
        name: cleanName,
        email: cleanEmail,
        isNew: true
      }
    });
  } catch (err) {
    console.error('Error registering student:', err.message);
    res.status(500).json({ error: 'Failed to create student account: ' + err.message });
  }
});

// Fetch questions from MongoDB Atlas
apiRouter.get('/questions', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }

  try {
    const questionsCol = db.collection('questions');
    const questions = await questionsCol.find({}).toArray();
    res.json({
      success: true,
      count: questions.length,
      questions: questions
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve questions: ' + err.message });
  }
});

// Force re-seed questions into database
apiRouter.post('/seed', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }

  try {
    const questionsCol = db.collection('questions');
    await questionsCol.deleteMany({});
    const bank = loadLocalQuestionBank();
    const result = await questionsCol.insertMany(bank);
    res.json({
      success: true,
      message: `Seeded ${result.insertedCount} questions into MongoDB Atlas collection 'questions'`,
      count: result.insertedCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed questions: ' + err.message });
  }
});

// Save exam submission
apiRouter.post('/submissions', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }

  const {
    studentName,
    studentEmail,
    score,
    total,
    percentage,
    stats,
    topicScores,
    answers,
    terminated,
    terminationReason,
    violations
  } = req.body;

  if (!studentEmail) {
    return res.status(400).json({ error: 'studentEmail is required' });
  }

  try {
    const submission = {
      studentName: studentName || 'Anonymous',
      studentEmail: String(studentEmail).trim().toLowerCase(),
      score: Number(score) || 0,
      total: Number(total) || 100,
      percentage: Number(percentage) || 0,
      stats: stats || {},
      topicScores: topicScores || {},
      answers: answers || {},
      terminated: !!terminated,
      terminationReason: terminationReason || null,
      violations: violations || [],
      submittedAt: new Date()
    };

    const submissionsCol = db.collection('submissions');
    const result = await submissionsCol.insertOne(submission);

    // Update student's attempt stats
    const studentsCol = db.collection('students');
    await studentsCol.updateOne(
      { email: submission.studentEmail },
      {
        $inc: { examAttempts: 1 },
        $set: {
          lastExamScore: submission.score,
          lastExamPercentage: submission.percentage,
          lastExamAt: submission.submittedAt
        }
      }
    );

    console.log(`Saved exam submission for ${submission.studentEmail}: ${submission.score}/100 (${submission.percentage}%)`);

    res.json({
      success: true,
      message: 'Exam submission saved successfully to MongoDB Atlas',
      submissionId: result.insertedId
    });
  } catch (err) {
    console.error('Error saving submission:', err.message);
    res.status(500).json({ error: 'Failed to save submission: ' + err.message });
  }
});

// Mount API router to handle both /api and direct paths
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Fallback middleware for non-API GET requests to serve index.html (Express 4 & 5 compatible)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  next();
});

// Start Express server locally or export for Vercel serverless
if (process.env.VERCEL !== '1' && !process.env.NOW_REGION) {
  app.listen(PORT, async () => {
    console.log(`DevOps Exam Hub server running at http://localhost:${PORT}`);
    await connectToMongo();
  });
}

module.exports = app;
