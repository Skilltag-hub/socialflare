import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

export async function GET() {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('waitlist');
    
    // Fetch 5 random users from the waitlist
    const users = await db.collection('users')
      .aggregate([
        { $sample: { size: 5 } },
        { $project: { 
          _id: 0,
          id: '$_id',
          name: 1,
          image: { $ifNull: ['$image', '/profiles/default-avatar.png'] },
          trending: true
        }}
      ])
      .toArray();
      
    await client.close();

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching waitlist users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist users' },
      { status: 500 }
    );
  }
}
