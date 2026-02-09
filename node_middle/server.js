const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'test';
const COLLECTION = process.env.COLLECTION || 'items';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

let client;
let collection;

async function connectMongo() {
  if (collection) return collection;
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  collection = db.collection(COLLECTION);
  console.log('Connected to MongoDB:', MONGODB_URI, 'DB:', DB_NAME, 'COLL:', COLLECTION);
  return collection;
}

app.get('/health', async (req, res) => {
  try {
    await connectMongo();
    res.json({ status: 'ok', db: DB_NAME, collection: COLLECTION });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/items?limit=10
app.get('/api/items', async (req, res) => {
  try {
    const coll = await connectMongo();
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 1000);
    const q = req.query.q;

    const filter = q ? { $text: { $search: q } } : {};

    const cursor = coll.find(filter).limit(limit);
    const results = await cursor.toArray();
    res.json({ count: results.length, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET single item by id: /api/items/:id
const { ObjectId } = require('mongodb');
app.get('/api/items/:id', async (req, res) => {
  try {
    const coll = await connectMongo();
    const id = req.params.id;
    const doc = await coll.findOne({ _id: ObjectId(id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  try {
    if (client) await client.close();
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
});
