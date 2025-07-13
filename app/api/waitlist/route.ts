import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

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

export async function GET() {
  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection('waitlist');
    const waitlist = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ waitlist });
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { fullName, collegeName, year, branch, email } = data;
    
    if (!fullName || !collegeName || !year || !branch || !email) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
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

    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
} 