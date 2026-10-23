const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

let mongoUri = process.env.MONGODB_URI;
if (!mongoUri && fs.existsSync(path.join(__dirname, 'atlas-credentials.env'))) {
  const envContent = fs.readFileSync(path.join(__dirname, 'atlas-credentials.env'), 'utf8');
  const uriMatch = envContent.match(/MONGODB_URI=["'](.+)["']/);
  if (uriMatch) {
    mongoUri = uriMatch[1];
  }
}

if (!mongoUri) {
  console.error('ERROR: MONGODB_URI not found.');
  process.exit(1);
}

global.window = { QUESTION_BANK: [] };
const topicFiles = ['git', 'github', 'terraform', 'ansible', 'docker', 'kubernetes'];
topicFiles.forEach(t => require(`./js/questions/${t}.js`));
const bank = global.window.QUESTION_BANK;

console.log(`Loaded ${bank.length} questions from local bank.`);

const client = new MongoClient(mongoUri);

async function seed() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas.');
    const db = client.db('devops_exam_hub');
    const questionsCol = db.collection('questions');

    await questionsCol.deleteMany({});
    console.log('Cleared existing questions collection.');

    const result = await questionsCol.insertMany(bank);
    console.log(`Successfully seeded ${result.insertedCount} questions with correct answers into MongoDB Atlas!`);
  } catch (err) {
    console.error('Seeding error:', err.message);
  } finally {
    await client.close();
    console.log('Done.');
  }
}

seed();
