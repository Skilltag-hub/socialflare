import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  try {
    // Get the session with the correct auth options
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      console.error('No session or email found');
      return new NextResponse(
        JSON.stringify({ error: 'Not authenticated' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const client = await clientPromise;
    
    // Use the waitlist database
    const db = client.db('waitlist');
    
    // First, try to find by email in waitlist.companies collection
    let company = await db.collection('companies').findOne({
      email: session.user.email
    });
    
    // If not found by email, try by googleId
    if (!company) {
      const googleId = session.user.sub || (session.user as any).id;
      if (googleId) {
        company = await db.collection('companies').findOne({
          googleId: googleId
        });
      }
    }
            
    // If still not found, check if the user is actually a company user
    if (!company) {
      console.error('Company not found for user:', {
        email: session.user.email,
        googleId: session.user.sub || (session.user as any).id
      });
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Not a company account',
          message: 'This email is not associated with a company account.'
        }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify the company data is valid
    if (!company.email && !company.businessEmail) {
      console.error('Invalid company data found:', company);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid company data',
          message: 'The company record is missing required fields.'
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Remove sensitive data
    const { _id, password, ...companyData } = company;
    
    return new NextResponse(
      JSON.stringify({
        ...companyData,
        id: _id.toString(),
        email: companyData.email || session.user.email
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in /api/companies/me:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
