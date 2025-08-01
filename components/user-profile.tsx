"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Bookmark, User, Home, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface UserProfileProps {
  userId: string
}

const mockUserData = {
  name: "Laura Sullivan",
  avatar: "/placeholder.svg?height=80&width=80",
  rating: 5.0,
  isAvailable: true,
  skills: ["UI Designer", "UX Designer", "User Research", "Animation", "Landing Page", "Figma"],
  description:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets.",
  education: {
    college: "College Name",
    degree: "CSE",
    years: "2009-2013",
  },
  personalDetails: {
    mobile: "+91 8008900988",
    email: "devfrederick@gmail.com",
    gender: "Male",
    dateOfBirth: "26-05-1992",
  },
  referrals: [
    { name: "Akhil Samudrala", institution: "NIT Raipur" },
    { name: "Akhil Samudrala", institution: "NIT Raipur" },
    { name: "Akhil Samudrala", institution: "NIT Raipur" },
    { name: "Akhil Samudrala", institution: "NIT Raipur" },
    { name: "Akhil Samudrala", institution: "NIT Raipur" },
    { name: "Akhil Samudrala", institution: "NIT Raipur" },
    { name: "Akhil Samudrala", institution: "NIT Raipur" },
    { name: "Akhil Samudrala", institution: "NIT Raipur" },
  ],
}

export default function UserProfile({ userId }: UserProfileProps) {
  return (
    <div className="h-screen bg-black text-white overflow-hidden p-6">
      {/* Header spacing to match other pages */}
      <div className="flex justify-end mb-4">
        <div className="h-[34px]"></div>
      </div>

      <div className="flex h-[calc(100vh-120px)] gap-6">
        {/* Left Sidebar - Same as other pages */}
        <div className="w-64 pl-8 pr-6 py-0 flex flex-col">
          {/* Logo - Vertical Layout */}
          <div className="flex flex-col items-center mb-12 mt-4">
            <img src="/zigwork-logo.svg" alt="Zigwork Logo" width={64} height={64} className="w-16 h-16 mb-2" />
            <span className="text-xl font-bold">zigwork</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-auto">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium text-sm">Home</span>
            </Link>
            <Link
              href="/my-zigs"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="font-medium text-sm">My Zigs</span>
            </Link>
            <Link
              href="/shortlist"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              <span className="font-medium text-sm">Shortlist</span>
            </Link>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#5E17EB]/20 text-[#5E17EB] border border-[#5E17EB]/30">
              <User className="w-4 h-4" />
              <span className="font-medium text-sm">Profile</span>
            </div>
          </nav>

          {/* Footer Links */}
          <div className="space-y-2 text-xs text-gray-400 px-3 mb-4">
            <div className="hover:text-white cursor-pointer transition-colors">Support</div>
            <div className="hover:text-white cursor-pointer transition-colors">Privacy Policy</div>
            <div className="hover:text-white cursor-pointer transition-colors">Terms & Conditions</div>
            <div className="text-xs mt-4 text-gray-500">©All Rights Reserved Zigwork</div>
          </div>
        </div>

        {/* Main Content - Scrollable with proper spacing */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pr-6">
          <div className="grid grid-cols-3 gap-4 pb-6">
            {/* Profile Card */}
            <Card className="bg-white text-black rounded-xl shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3"></div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{mockUserData.name}</h2>
                <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs mb-3">
                  Available for Zigs
                </div>
                <div className="flex items-center justify-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-1 text-xs font-medium">{mockUserData.rating}</span>
                </div>
                <Button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm py-1">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Skills and Expertise Card */}
            <Card className="bg-white text-black rounded-xl shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Skills and Expertise</h3>
                <div className="grid grid-cols-2 gap-2">
                  {mockUserData.skills.map((skill, index) => (
                    <div key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs text-center">
                      {skill}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Referrals Card */}
            <Card className="bg-white text-black rounded-xl shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Refer Friends and Earn 10%</h3>
                <p className="text-xs text-gray-600 mb-3">of their earning for life.</p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value="www.zigwork.in/signup"
                    readOnly
                    className="flex-1 px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs"
                  />
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs">Invite</Button>
                </div>
                <div className="border-t pt-3">
                  <h4 className="font-medium text-gray-900 mb-2 text-xs">My Referrals (10)</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-hide">
                    {mockUserData.referrals.slice(0, 6).map((referral, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          A
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-900">{referral.name}</div>
                          <div className="text-xs text-gray-500">{referral.institution}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description Card - Full Width */}
            <Card className="bg-white text-black rounded-xl shadow-sm col-span-2">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed text-xs">{mockUserData.description}</p>
              </CardContent>
            </Card>

            {/* Education Card */}
            <Card className="bg-white text-black rounded-xl shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Education</h3>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{mockUserData.education.college}</div>
                    <div className="text-xs text-gray-500">
                      {mockUserData.education.degree} | {mockUserData.education.years}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Details Card */}
            <Card className="bg-white text-black rounded-xl shadow-sm col-span-3">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Personal Details.</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium text-gray-900">Mobile Number:</span>
                    <span className="text-gray-700 ml-1">{mockUserData.personalDetails.mobile}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Email:</span>
                    <span className="text-gray-700 ml-1">{mockUserData.personalDetails.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Gender:</span>
                    <span className="text-gray-700 ml-1">{mockUserData.personalDetails.gender}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Date of Birth:</span>
                    <span className="text-gray-700 ml-1">{mockUserData.personalDetails.dateOfBirth}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
