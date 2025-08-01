"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BarChart3, Bookmark, User, Home, Clock, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Component() {
  return (
    <div className="h-screen bg-black text-white overflow-hidden p-6">
      {/* Header with Post a Job button */}
      <div className="flex justify-end mb-4">
        <Link href="/companies/post-gig">
          <Button className="bg-[#5E17EB] hover:bg-[#4A12C4] text-white px-6 py-1.5 rounded-lg text-sm">
            Post a Job
          </Button>
        </Link>
      </div>

      <div className="flex h-[calc(100vh-120px)] gap-6">
        {/* Left Sidebar */}
        <div className="w-64 pl-8 pr-6 py-0 flex flex-col">
          {/* Logo - Vertical Layout */}
          <div className="flex flex-col items-center mb-12 mt-0">
            <img src="/zigwork-logo.svg" alt="Zigwork Logo" width={64} height={64} className="w-16 h-16 mb-2" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/vite.svg'; }} />
            <span className="text-xl font-bold">zigwork</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-auto">
            <Link
              href="/companies"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#5E17EB]/20 text-[#5E17EB] border border-[#5E17EB]/30"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium text-sm">Home</span>
            </Link>
            <Link
              href="/companies/my-zigs"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="font-medium text-sm">My Zigs</span>
            </Link>
            <Link
              href="/companies/shortlist"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              <span className="font-medium text-sm">Shortlist</span>
            </Link>
            <Link
              href="/companies/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="font-medium text-sm">Profile</span>
            </Link>
          </nav>

          {/* Footer Links */}
          <div className="space-y-2 text-xs text-gray-400 px-3 mb-4">
            <div className="hover:text-white cursor-pointer transition-colors">Support</div>
            <div className="hover:text-white cursor-pointer transition-colors">Privacy Policy</div>
            <div className="hover:text-white cursor-pointer transition-colors">Terms & Conditions</div>
            <div className="text-xs mt-4 text-gray-500">©All Rights Reserved Zigwork</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Stats Cards - 2x2 Grid - Same width as Post Ideas */}
          <div className="grid grid-cols-2 gap-3 mb-4 max-w-2xl">
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#5E17EB]/10 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#5E17EB]" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#5E17EB]">12</div>
                    <div className="text-gray-500 font-normal text-xs">Active Gigs</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#5E17EB]/10 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#5E17EB]" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#5E17EB]">100</div>
                    <div className="text-gray-500 font-normal text-xs">All Gigs</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#5E17EB]/10 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#5E17EB]" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#5E17EB]">100</div>
                    <div className="text-gray-500 font-normal text-xs">Shortlisted</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#5E17EB]/10 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#5E17EB]" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#5E17EB]">100</div>
                    <div className="text-gray-500 font-normal text-xs">Applied</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Post Ideas Section - 2 columns, slightly smaller cards */}
          <div className="flex-1 overflow-hidden mb-4">
            <h2 className="text-xl font-normal mb-3 text-gray-200">Post Ideas</h2>
            <div className="grid grid-cols-2 gap-3 max-w-2xl h-[calc(100vh-360px)]">
              {/* Create First Zig Card - Clickable, leads to post-gig with pre-fill */}
              <Card className="bg-transparent border-2 border-dashed border-gray-600 rounded-xl cursor-pointer" onClick={() => {
                window.location.href = "/companies/post-gig?title=My%20First%20Zig&description=Describe%20your%20gig%20here";
              }}>
                <CardContent className="p-3 h-full flex flex-col items-center justify-center text-center">
                  <div className="w-9 h-9 bg-gradient-to-br from-[#5E17EB] to-[#4A12C4] rounded-lg flex items-center justify-center mx-auto mb-2 transform -rotate-12">
                    <Zap className="w-5 h-5 text-white transform rotate-12" />
                  </div>
                  <div className="text-gray-400 font-normal text-sm">+ Post your first Zig</div>
                </CardContent>
              </Card>

              {/* UGC Videos Card 1 - Clickable, leads to post-gig with pre-fill */}
              <Card className="bg-white text-black rounded-xl shadow-sm cursor-pointer" onClick={() => {
                window.location.href = "/companies/post-gig?title=UGC%20Videos%20for%20Myntra%20Showbizz&description=Create%20UGC%20Videos%20and%20get%20shares%20on%20Instagram%20about%20Myntra%20Showbizz%20now.";
              }}>
                <CardContent className="p-3">
                  <div className="mb-2">
                    <h3 className="font-normal text-gray-700 leading-relaxed text-sm">
                      Create <span className="font-semibold text-gray-900">UGC Videos</span> and get shares on Instagram
                      about Myntra Showbizz now.
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#5E17EB]" />
                      <span>100 Applicants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>1d ago</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-[#5E17EB]" />
                      <span className="font-bold text-base">350</span>
                    </div>
                    <Button className="bg-[#5E17EB] hover:bg-[#4A12C4] text-white px-3 py-1 rounded-lg font-normal text-xs">
                      Post
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* UGC Videos Card 2 - Clickable, leads to post-gig with pre-fill */}
              <Card className="bg-white text-black rounded-xl shadow-sm cursor-pointer" onClick={() => {
                window.location.href = "/companies/post-gig?title=UGC%20Videos%20for%20Myntra%20Showbizz&description=Create%20UGC%20Videos%20and%20get%20shares%20on%20Instagram%20about%20Myntra%20Showbizz%20now.";
              }}>
                <CardContent className="p-3">
                  <div className="mb-2">
                    <h3 className="font-normal text-gray-700 leading-relaxed text-sm">
                      Create <span className="font-semibold text-gray-900">UGC Videos</span> and get shares on Instagram
                      about Myntra Showbizz now.
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#5E17EB]" />
                      <span>100 Applicants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>1d ago</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-[#5E17EB]" />
                      <span className="font-bold text-base">350</span>
                    </div>
                    <Button className="bg-[#5E17EB] hover:bg-[#4A12C4] text-white px-3 py-1 rounded-lg font-normal text-xs">
                      Post
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* UGC Videos Card 3 - Clickable, leads to post-gig with pre-fill */}
              <Card className="bg-white text-black rounded-xl shadow-sm cursor-pointer" onClick={() => {
                window.location.href = "/companies/post-gig?title=UGC%20Videos%20for%20Myntra%20Showbizz&description=Create%20UGC%20Videos%20and%20get%20shares%20on%20Instagram%20about%20Myntra%20Showbizz%20now.";
              }}>
                <CardContent className="p-3">
                  <div className="mb-2">
                    <h3 className="font-normal text-gray-700 leading-relaxed text-sm">
                      Create <span className="font-semibold text-gray-900">UGC Videos</span> and get shares on Instagram
                      about Myntra Showbizz now.
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#5E17EB]" />
                      <span>100 Applicants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>1d ago</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-[#5E17EB]" />
                      <span className="font-bold text-base">350</span>
                    </div>
                    <Button className="bg-[#5E17EB] hover:bg-[#4A12C4] text-white px-3 py-1 rounded-lg font-normal text-xs">
                      Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Notifications with White Background - Longer */}
        <div className="w-72">
          <Card className="bg-white text-black rounded-xl shadow-sm h-[calc(78.2vh)] flex flex-col">
            <CardContent className="p-6 flex flex-col h-full">
              <h2 className="text-xl font-bold mb-6 text-black">Notifications</h2>
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center gap-1 text-sm text-[#5E17EB] mb-2">
                      <Clock className="w-4 h-4" />
                      <span>1d ago</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Create <span className="font-bold text-black">UGC Videos</span> and get shares on Instagram about Myntra Showbizz
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
