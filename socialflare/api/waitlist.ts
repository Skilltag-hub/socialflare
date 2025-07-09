// Serverless function for Vercel/Netlify style API
// Make sure to install 'mongodb' and '@types/node' for type support
import { MongoClient } from 'mongodb';
import type { IncomingMessage, ServerResponse } from 'http';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'waitlist';

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  if (!uri) throw new Error('MONGODB_URI not set');
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req: IncomingMessage & { body?: any; method?: string }, res: ServerResponse & { status?: any; json?: any }) {
  if (req.method === 'GET') {
    try {
      const client = await connectToDatabase();
      const db = client.db(dbName);
      const collection = db.collection('waitlist');
      const waitlist = await collection.find({}).sort({ createdAt: -1 }).toArray();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ waitlist }));
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Server error', error: (error as Error).message }));
    }
    return;
  }
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ message: 'Method Not Allowed' }));
    return;
  }
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      const { fullName, collegeName, year, branch, email } = data;
      if (!fullName || !collegeName || !year || !branch || !email) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Missing required fields' }));
        return;
      }
      const client = await connectToDatabase();
      const db = client.db(dbName);
      const collection = db.collection('waitlist');
      await collection.insertOne({
        fullName,
        collegeName,
        year,
        branch,
        email,
        createdAt: new Date(),
      });
      res.statusCode = 200;
      res.end(JSON.stringify({ message: 'Success' }));
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Server error', error: (error as Error).message }));
    }
  });
} 