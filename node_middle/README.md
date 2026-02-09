# node_middle — minimal Express + MongoDB API

This folder contains a minimal Express API that connects to MongoDB and exposes documents from a collection.

Quick start

1. Copy `.env.example` to `.env` and set `MONGODB_URI`, `DB_NAME`, and `COLLECTION`.
2. Install dependencies (run in `node_middle`):

```bash
npm install
```

3. Run the server:

```bash
npm start
# or for development with auto-reload:
npm run dev
```

Endpoints

- `GET /health` — checks DB connectivity
- `GET /api/items?limit=50&q=term` — lists documents (supports simple text search if collection has a text index)
- `GET /api/items/:id` — fetch single document by ObjectId

Notes for contributors / agents

- If you need to change the DB or collection name, update `.env` rather than hardcoding values. The server defaults to `mongodb://localhost:27017`, DB `test`, collection `items`.
- The server uses a single MongoClient connection and reuses the collection for requests.
- If you plan to add write endpoints, follow the pattern in `server.js` for acquiring `collection` and handle ObjectId conversions.
