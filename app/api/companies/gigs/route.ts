import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/authOptions';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('waitlist');
    
    // First, get the company ID using the email from session
    const company = await db.collection('companies').findOne({
      $or: [
        { email: session.user.email },
        { googleId: session.user.sub || (session.user as any).id }
      ]
    });

    if (!company) {
      await client.close();
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Now get all gigs for this company
    const gigs = await db.collection('gigs')
      .find({ companyId: company._id.toString() })
      .toArray();
    
    await client.close();

    // Calculate stats
    const activeGigs = gigs.filter(gig => gig.status === 'active').length;
    const totalGigs = gigs.length;
    
    // Calculate total applications across all gigs
    const totalApplications = gigs.reduce((sum, gig) => {
      return sum + (Array.isArray(gig.applications) ? gig.applications.length : 0);
    }, 0);

    return NextResponse.json({
      stats: {
        activeGigs,
        totalGigs,
        totalApplications,
        // For now, we'll set shortlisted to 0 as it's not in the schema
        shortlisted: 0
      },
      gigs
    });
  } catch (error) {
    console.error('Error fetching company gigs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company gigs' },
      { status: 500 }
    );
  }
}
