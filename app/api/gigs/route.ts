import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// Define the Gig type for TypeScript
// Database representation of a Gig
type Gig = {
  _id?: any;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  openings: number;
  description: string;
  payment: string;
  skills: string[];
  aboutCompany: string;
  datePosted: Date;
  dateUpdated?: Date;
  status?: string;
  category?: string;
  duration?: string;
  location?: string;
  requiredExperience?: string;
  applicationDeadline?: string;
};

// API response representation of a Gig
type GigResponse = Omit<Gig, 'datePosted' | 'dateUpdated'> & {
  _id: string;
  datePosted: string;
  dateUpdated?: string;
};

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("waitlist");
    const gigsCollection = db.collection<Gig>("gigs");

    // Fetch all gigs from the collection
    const gigs = await gigsCollection.find({}).toArray();

    // Format dates for JSON serialization and ensure dates are valid
    const formattedGigs: GigResponse[] = gigs.map((gig) => {
      // Create response object with string dates
      const response: GigResponse = {
        _id: gig._id.toString(),
        companyId: gig.companyId,
        companyName: gig.companyName,
        companyLogo: gig.companyLogo,
        openings: gig.openings,
        description: gig.description,
        payment: gig.payment,
        skills: gig.skills,
        aboutCompany: gig.aboutCompany,
        status: gig.status,
        category: gig.category,
        duration: gig.duration,
        location: gig.location,
        requiredExperience: gig.requiredExperience,
        applicationDeadline: gig.applicationDeadline,
        // Ensure datePosted is a valid ISO string
        datePosted: (gig.datePosted instanceof Date ? gig.datePosted : new Date(gig.datePosted)).toISOString(),
      };
      
      // Add dateUpdated if it exists
      if (gig.dateUpdated) {
        response.dateUpdated = (gig.dateUpdated instanceof Date ? gig.dateUpdated : new Date(gig.dateUpdated)).toISOString();
      }
      
      return response;
    });

    return NextResponse.json({ gigs: formattedGigs });
  } catch (error) {
    console.error("Error fetching gigs:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Require authentication
    const { getServerSession } = await import("next-auth/next");
    const { authOptions } = await import("@/lib/authOptions");
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated as company" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("waitlist");
    const gigsCollection = db.collection<Gig>("gigs");
    const companiesCollection = db.collection("companies");

    // Find the company by email
    const company = await companiesCollection.findOne({ email: session.user.email });
    if (!company || !company._id) {
      return NextResponse.json(
        { error: "Company not found or not onboarded" },
        { status: 403 }
      );
    }

    // Enforce approval before allowing gig creation
    if (!company.approved) {
      return NextResponse.json(
        { error: "Company is not approved to post gigs", code: "COMPANY_NOT_APPROVED" },
        { status: 403 }
      );
    }

    // Parse the request body
    const gigData = await request.json();
    // Validate required fields
    if (!gigData.companyName || !gigData.description || !gigData.payment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create a new gig document with company details
    const newGig: Gig = {
      companyId: company._id.toString(),
      companyName: gigData.companyName,
      companyLogo: company.logoUrl || '',
      openings: gigData.openings || 1,
      description: gigData.description,
      payment: gigData.payment,
      skills: Array.isArray(gigData.skills) ? gigData.skills : [],
      aboutCompany: gigData.aboutCompany || "",
      datePosted: new Date(gigData.datePosted || Date.now()),
      status: "active", // Default status
      category: gigData.category,
      duration: gigData.duration,
      location: gigData.location,
      requiredExperience: gigData.requiredExperience,
      applicationDeadline: gigData.applicationDeadline
    };

    // Insert the new gig into the database
    const result = await gigsCollection.insertOne(newGig);

    // Create response object with string dates
    const response: GigResponse = {
      _id: result.insertedId.toString(),
      companyId: newGig.companyId,
      companyName: newGig.companyName,
      companyLogo: newGig.companyLogo,
      openings: newGig.openings,
      description: newGig.description,
      payment: newGig.payment,
      skills: newGig.skills,
      aboutCompany: newGig.aboutCompany,
      status: newGig.status,
      category: newGig.category,
      duration: newGig.duration,
      location: newGig.location,
      requiredExperience: newGig.requiredExperience,
      applicationDeadline: newGig.applicationDeadline,
      datePosted: newGig.datePosted.toISOString()
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating gig:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Require authentication
    const { getServerSession } = await import("next-auth/next");
    const { authOptions } = await import("@/lib/authOptions");
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated as company" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("waitlist");
    const gigsCollection = db.collection<Gig>("gigs");
    const companiesCollection = db.collection("companies");

    // Find the company by email
    const company = await companiesCollection.findOne({ email: session.user.email });
    if (!company || !company._id) {
      return NextResponse.json(
        { error: "Company not found or not onboarded" },
        { status: 403 }
      );
    }

    // Enforce approval before allowing gig updates
    if (!company.approved) {
      return NextResponse.json(
        { error: "Company is not approved to update gigs", code: "COMPANY_NOT_APPROVED" },
        { status: 403 }
      );
    }

    // Parse the request body
    const updateData = await request.json();
    const { _id, ...gigUpdates } = updateData;

    if (!_id) {
      return NextResponse.json(
        { error: "Gig ID is required" },
        { status: 400 }
      );
    }

    // Check if the gig exists and belongs to the company
    const existingGig = await gigsCollection.findOne({
      _id: new ObjectId(_id),
      companyId: company._id.toString()
    });

    if (!existingGig) {
      return NextResponse.json(
        { error: "Gig not found or access denied" },
        { status: 404 }
      );
    }

    // Update the gig
    const result = await gigsCollection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: { ...gigUpdates, dateUpdated: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update gig" },
        { status: 500 }
      );
    }

    // Return the updated gig
    const updatedGig = await gigsCollection.findOne({ _id: new ObjectId(_id) });
    
    if (!updatedGig) {
      return NextResponse.json(
        { error: "Failed to retrieve updated gig" },
        { status: 500 }
      );
    }

    // Create response object with string dates
    const response: GigResponse = {
      _id: updatedGig._id.toString(),
      companyId: updatedGig.companyId,
      companyName: updatedGig.companyName,
      companyLogo: updatedGig.companyLogo,
      openings: updatedGig.openings,
      description: updatedGig.description,
      payment: updatedGig.payment,
      skills: updatedGig.skills,
      aboutCompany: updatedGig.aboutCompany,
      status: updatedGig.status,
      category: updatedGig.category,
      duration: updatedGig.duration,
      location: updatedGig.location,
      requiredExperience: updatedGig.requiredExperience,
      applicationDeadline: updatedGig.applicationDeadline,
      // Ensure datePosted is a valid ISO string
      datePosted: (updatedGig.datePosted instanceof Date ? updatedGig.datePosted : new Date(updatedGig.datePosted)).toISOString(),
    };

    // Add dateUpdated if it exists
    if (updatedGig.dateUpdated) {
      response.dateUpdated = (updatedGig.dateUpdated instanceof Date ? updatedGig.dateUpdated : new Date(updatedGig.dateUpdated)).toISOString();
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating gig:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Require authentication
    const { getServerSession } = await import("next-auth/next");
    const { authOptions } = await import("@/lib/authOptions");
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated as company" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("waitlist");
    const gigsCollection = db.collection<Gig>("gigs");
    const companiesCollection = db.collection("companies");

    // Find the company by email
    const company = await companiesCollection.findOne({ email: session.user.email });
    if (!company || !company._id) {
      return NextResponse.json(
        { error: "Company not found or not onboarded" },
        { status: 403 }
      );
    }

    // Enforce approval before allowing gig deletion
    if (!company.approved) {
      return NextResponse.json(
        { error: "Company is not approved to delete gigs", code: "COMPANY_NOT_APPROVED" },
        { status: 403 }
      );
    }

    // Parse the request body
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Gig ID is required" },
        { status: 400 }
      );
    }

    // Check if the gig exists and belongs to the company
    const existingGig = await gigsCollection.findOne({
      _id: new ObjectId(id),
      companyId: company._id.toString()
    });

    if (!existingGig) {
      return NextResponse.json(
        { error: "Gig not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the gig
    const result = await gigsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Failed to delete gig" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Gig deleted successfully" });
  } catch (error) {
    console.error("Error deleting gig:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
