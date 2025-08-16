import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/lib/authOptions";

// Import the same whitelist logic used in authOptions via a lightweight checker
const COMPANY_DOMAIN_WHITELIST = (
  process.env.COMPANY_EMAIL_DOMAINS || "mlrit.ac.in,enterprise.com,gmail.com"
)
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

const isCompanyEmail = (email: string) => {
  const domain = (email || "").split("@")[1]?.toLowerCase() || "";
  return COMPANY_DOMAIN_WHITELIST.some(
    (d) => domain === d || domain.endsWith(`.${d}`)
  );
};

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("waitlist");

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Enforce company domain whitelist
    if (!isCompanyEmail(session.user.email)) {
      return NextResponse.json(
        {
          error: "Please use your company email address",
          code: "NOT_COMPANY_EMAIL",
        },
        { status: 403 }
      );
    }

    const email = session.user.email;

    // Check if company already exists
    let company = await db.collection("companies").findOne({ email });

    if (!company) {
      // Create new company
      const newCompany = {
        email,
        googleId: session.user.id,
        isOnboarded: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("companies").insertOne(newCompany);
      company = { ...newCompany, _id: result.insertedId };
    }

    return NextResponse.json({
      company: {
        id: company._id,
        email: company.email,
        isOnboarded: company.isOnboarded,
        companyName: company.companyName,
      },
    });
  } catch (error) {
    console.error("Company auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("waitlist");

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Enforce company domain whitelist
    if (!isCompanyEmail(session.user.email)) {
      return NextResponse.json(
        {
          error: "Please use your company email address",
          code: "NOT_COMPANY_EMAIL",
        },
        { status: 403 }
      );
    }

    const company = await db
      .collection("companies")
      .findOne({ email: session.user.email });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      company: {
        id: company._id,
        email: company.email,
        isOnboarded: company.isOnboarded,
        companyName: company.companyName,
        companyWebsite: company.companyWebsite,
        contactName: company.contactName,
        businessEmail: company.businessEmail,
        logoUrl: company.logoUrl,
      },
    });
  } catch (error) {
    console.error("Get company error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
