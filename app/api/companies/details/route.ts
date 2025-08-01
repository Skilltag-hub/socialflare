import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import clientPromise from "@/lib/mongodb"
import { authOptions } from "@/lib/authOptions"
import { ObjectId } from "mongodb"

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const {
      companyName,
      companyWebsite,
      contactName,
      businessEmail,
      logoUrl,
      gstCertificate,
      cinDocument
    } = data

    const client = await clientPromise
    const db = client.db()

    // Update company details
    const result = await db.collection("companies").updateOne(
      { email: session.user.email },
      {
        $set: {
          companyName,
          companyWebsite,
          contactName,
          businessEmail,
          logoUrl,
          gstCertificate,
          cinDocument,
          isOnboarded: true,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error updating company details:", error)
    return NextResponse.json(
      { error: "Failed to update company details" },
      { status: 500 }
    )
  }
}
