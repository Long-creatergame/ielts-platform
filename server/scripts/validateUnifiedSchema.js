const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const cols = (await db.listCollections().toArray()).map(c => c.name).sort();
  const required = ['users', 'examsessions', 'ai_feedbacks', 'examresults', 'learningpaths'];
  const missing = required.filter(n => !cols.includes(n));
  console.log('Collections:', cols);
  if (missing.length) {
    console.error('❌ Missing collections:', missing);
    process.exit(1);
  }
  console.log('✅ Unified schema validated');
  process.exit(0);
}

main().catch(err => { console.error('Error', err.message); process.exit(1); });


