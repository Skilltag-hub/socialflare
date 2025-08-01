import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST() {
  try {
    const client = await clientPromise
    const db = client.db()

    // Sample email addresses
    const sampleEmails = [
      'john.doe@example.com',
      'designer.pro@example.com',
      'dev.ninja@example.com',
      'creative.mind@example.com',
      'tech.guru@example.com'
    ]

    // Get all jobs
    const jobs = await db.collection("jobs").find({}).toArray()

    for (const job of jobs) {
      // Add 2-4 random applications to each job
      const numApplications = Math.floor(Math.random() * 3) + 2
      const applications = []
      const applicants = []

      for (let i = 0; i < numApplications; i++) {
        const email = sampleEmails[Math.floor(Math.random() * sampleEmails.length)]
        const appliedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        
        // Only add if email not already present
        if (!applications.some(app => app.applicantEmail === email)) {
          const application = {
            applicantEmail: email,
            status: "applied",
            appliedAt,
            resumeUrl: `https://example.com/resumes/${email.split('@')[0]}.pdf`,
            portfolio: `https://portfolio.com/${email.split('@')[0]}`,
            skills: ['JavaScript', 'React', 'Node.js']
          }
          
          const applicant = {
            email,
            status: "applied",
            appliedAt
          }

          applications.push(application)
          applicants.push(applicant)
        }
      }

      // Update job with new applications
      await db.collection("jobs").updateOne(
        { _id: job._id },
        { 
          $set: { 
            applications,
            applicants 
          } 
        }
      )
    }

    return NextResponse.json({ message: "Successfully populated applications" })
  } catch (error) {
    console.error("Error populating applications:", error)
    return NextResponse.json(
      { error: "Failed to populate applications" },
      { status: 500 }
    )
  }
}
