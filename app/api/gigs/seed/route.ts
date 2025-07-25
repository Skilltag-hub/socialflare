import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("waitlist");
    const gigsCollection = db.collection("gigs");

    // Dummy gig data
    const gigs = [
      {
        companyName: "TechNova",
        openings: 3,
        datePosted: new Date("2024-06-01"),
        description: "Frontend developer needed for React/Next.js project.",
        payment: "$2000/month",
        skills: ["React", "Next.js", "JavaScript", "CSS"],
        aboutCompany:
          "TechNova is a fast-growing SaaS company focused on web solutions.",
      },
      {
        companyName: "HealthSync",
        openings: 2,
        datePosted: new Date("2024-06-02"),
        description: "Backend engineer for healthcare data platform.",
        payment: "$2500/month",
        skills: ["Node.js", "MongoDB", "Express", "API Design"],
        aboutCompany: "HealthSync builds secure, scalable health data systems.",
      },
      {
        companyName: "EduSpark",
        openings: 4,
        datePosted: new Date("2024-06-03"),
        description: "Content writer for online education platform.",
        payment: "$800/article",
        skills: ["Writing", "SEO", "Research", "EdTech"],
        aboutCompany:
          "EduSpark is revolutionizing online learning for all ages.",
      },
      {
        companyName: "GreenGrid",
        openings: 1,
        datePosted: new Date("2024-06-04"),
        description: "UI/UX designer for sustainability dashboard.",
        payment: "$1800/month",
        skills: ["Figma", "UI/UX", "Prototyping", "Sustainability"],
        aboutCompany:
          "GreenGrid helps companies track and reduce their carbon footprint.",
      },
      {
        companyName: "FinPeak",
        openings: 2,
        datePosted: new Date("2024-06-05"),
        description: "Full-stack developer for fintech app.",
        payment: "$3000/month",
        skills: ["React", "Node.js", "TypeScript", "Finance APIs"],
        aboutCompany:
          "FinPeak delivers innovative solutions for personal finance management.",
      },
      {
        companyName: "MediQuick",
        openings: 3,
        datePosted: new Date("2024-06-06"),
        description: "Mobile app developer for telemedicine platform.",
        payment: "$2200/month",
        skills: ["Flutter", "Dart", "Mobile Apps", "Healthcare"],
        aboutCompany:
          "MediQuick connects patients and doctors through technology.",
      },
      {
        companyName: "ShopEase",
        openings: 5,
        datePosted: new Date("2024-06-07"),
        description: "Customer support for e-commerce startup.",
        payment: "$15/hour",
        skills: ["Communication", "CRM", "Problem Solving", "E-commerce"],
        aboutCompany: "ShopEase is a rapidly growing online marketplace.",
      },
      {
        companyName: "DataNest",
        openings: 2,
        datePosted: new Date("2024-06-08"),
        description: "Data analyst for cloud data warehouse.",
        payment: "$2000/month",
        skills: ["SQL", "Python", "Data Visualization", "Cloud"],
        aboutCompany:
          "DataNest provides cloud-based analytics for enterprises.",
      },
      {
        companyName: "AdVibe",
        openings: 1,
        datePosted: new Date("2024-06-09"),
        description: "Digital marketing specialist for ad agency.",
        payment: "$1800/month",
        skills: ["Digital Marketing", "Google Ads", "Analytics", "Copywriting"],
        aboutCompany: "AdVibe creates high-impact campaigns for global brands.",
      },
      {
        companyName: "Buildify",
        openings: 2,
        datePosted: new Date("2024-06-10"),
        description: "DevOps engineer for SaaS infrastructure.",
        payment: "$2700/month",
        skills: ["AWS", "Docker", "CI/CD", "DevOps"],
        aboutCompany:
          "Buildify powers scalable SaaS products with robust infrastructure.",
      },
    ];

    // Insert gigs
    await gigsCollection.insertMany(gigs);

    return NextResponse.json({ message: "Seeded 10 gigs successfully." });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
