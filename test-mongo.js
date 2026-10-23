const { MongoClient } = require('mongodb');
const fs = require('fs');

// Read env file
const envContent = fs.readFileSync('./atlas-credentials.env', 'utf8');
const uriMatch = envContent.match(/MONGODB_URI=["'](.+)["']/);
if (!uriMatch) {
  console.error('Could not find MONGODB_URI in atlas-credentials.env');
  process.exit(1);
}

const uri = uriMatch[1];
console.log('Connecting to MongoDB Atlas...');

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 10000,
});

async function run() {
  try {
    await client.connect();
    console.log('SUCCESS: Successfully connected to MongoDB Atlas!');
    const adminDb = client.db().admin();
    const pingResult = await adminDb.ping();
    console.log('Ping result:', pingResult);
    const dbs = await adminDb.listDatabases();
    console.log('Available databases:', dbs.databases.map(d => d.name));
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await client.close();
  }
}

run();
