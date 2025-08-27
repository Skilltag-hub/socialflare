import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params;

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(companyId)) {
      return NextResponse.json({ error: 'Invalid company ID format' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('waitlist');

    const company = await db.collection('companies').findOne(
      { _id: new ObjectId(companyId) },
      {
        projection: {
          _id: 1,
          name: 1,
          email: 1,
          companyName: 1,
          logoUrl: 1,
          description: 1,
          website: 1,
          industry: 1,
          size: 1,
          foundedYear: 1,
          address: 1,
          phone: 1,
          contactName: 1,
          businessEmail: 1,
          certificateUrl: 1,
          isOnboarded: 1,
          approved: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    );

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Convert ObjectId to string for JSON serialization
    const companyData = {
      ...company,
      _id: company._id.toString(),
      createdAt: company.createdAt ? company.createdAt.toISOString() : undefined,
      updatedAt: company.updatedAt ? company.updatedAt.toISOString() : undefined
    };

    return NextResponse.json({ company: companyData });
  } catch (error) {
    console.error('Error fetching company details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
