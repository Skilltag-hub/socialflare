"use client";

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/Button"
import { Users, BarChart3, Bookmark, User, Home, Clock, Zap, Loader2, Bell } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

interface Stats {
  activeGigs: number;
  totalGigs: number;
  totalApplications: number;
  shortlisted: number;
}

export default function ZigworkDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      if (status === 'authenticated') {
        try {
          setLoading(true);
          const response = await fetch('/api/companies/gigs');
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch stats');
          }
          
          setStats(data.stats);
        } catch (err) {
          console.error('Error fetching stats:', err);
          setError('Failed to load dashboard stats');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStats();
  }, [status]);

  const handlePostJobClick = () => {
    router.push('/companies/post-gig');
  };

  return (
    <div className="h-screen bg-black text-white overflow-hidden lg:ml-64">
      {/* Header with Post a Job button */}
      <div className="flex justify-end mb-4 p-6 pb-0">
        <Button
          onClick={handlePostJobClick}
          className="bg-[#5E17EB] hover:bg-[#4A12C4] text-white px-6 py-1.5 rounded-lg text-sm"
        >
          Post a Job
        </Button>
      </div>

      <div className="flex h-[calc(100vh-120px)] gap-6 p-6 pt-4">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Stats Cards - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4 max-w-2xl">
            {loading ? (
              // Loading state
              <Card className="bg-white rounded-xl shadow-sm col-span-2">
                <CardContent className="p-6 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#5E17EB] mr-2" />
                  <span className="text-gray-600">Loading stats...</span>
                </CardContent>
              </Card>
            ) : error ? (
              // Error state
              <Card className="bg-white rounded-xl shadow-sm col-span-2">
                <CardContent className="p-6 text-center">
                  <p className="text-red-500">{error}</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : stats ? (
              // Stats loaded
              <>
                <Card className="bg-white rounded-xl shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#5E17EB]/10 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-[#5E17EB]" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-[#5E17EB]">{stats.activeGigs}</div>
                        <div className="text-gray-500 font-normal text-xs">Active Gigs</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white rounded-xl shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#5E17EB]/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-[#5E17EB]" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-[#5E17EB]">{stats.totalGigs}</div>
                        <div className="text-gray-500 font-normal text-xs">All Gigs</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white rounded-xl shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#5E17EB]/10 rounded-lg flex items-center justify-center">
                        <Bookmark className="w-4 h-4 text-[#5E17EB]" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-[#5E17EB]">{stats.shortlisted}</div>
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
                        <div className="text-xl font-bold text-[#5E17EB]">{stats.totalApplications}</div>
                        <div className="text-gray-500 font-normal text-xs">Total Applications</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>

          {/* Post Ideas Section - 2 columns, compact cards */}
          <div className="flex-1 mb-4">
            <h2 className="text-xl font-normal mb-3 text-gray-200">Post Ideas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              {/* Create First Zig Card - Clickable, leads to post-gig with pre-fill */}
              <Card className="bg-transparent border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-[#5E17EB] transition-colors" onClick={() => {
                window.location.href = "/companies/post-gig?title=My%20First%20Zig&description=Describe%20your%20gig%20here";
              }}>
                <CardContent className="p-4 h-full flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#5E17EB] to-[#4A12C4] rounded-lg flex items-center justify-center mx-auto mb-2 transform -rotate-12">
                    <Zap className="w-4 h-4 text-white transform rotate-12" />
                  </div>
                  <div className="text-gray-400 font-normal text-sm">
                    + Post your first Zig
                  </div>
                </CardContent>
              </Card>

              {/* UGC Videos Card 1 - Clickable, leads to post-gig with pre-fill */}
              <Card className="bg-white text-black rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-colors" onClick={() => {
                window.location.href = "/companies/post-gig?title=UGC%20Videos%20for%20Myntra%20Showbizz&description=Create%20UGC%20Videos%20and%20get%20shares%20on%20Instagram%20about%20Myntra%20Showbizz%20now.";
              }}>
                <CardContent className="p-3">
                  <div className="mb-1">
                    <h3 className="font-normal text-gray-700 leading-tight text-sm line-clamp-2">
                      Create <span className="font-semibold text-gray-900">UGC Videos</span> and get shares on Instagram about Myntra Showbizz now.
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#5E17EB]" />
                      <span>100</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>1d</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#5E17EB]" />
                      <span className="font-bold text-sm">350</span>
                    </div>
                    <Button className="bg-[#5E17EB] hover:bg-[#4A12C4] text-white px-2 py-0.5 rounded-lg text-xs h-6">
                      Post
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* UGC Videos Card 2 - Clickable, leads to post-gig with pre-fill */}
              <Card
                className="bg-white text-black rounded-xl shadow-sm cursor-pointer"
                onClick={() => {
                  window.location.href =
                    "/companies/post-gig?title=UGC%20Videos%20for%20Myntra%20Showbizz&description=Create%20UGC%20Videos%20and%20get%20shares%20on%20Instagram%20about%20Myntra%20Showbizz%20now.";
                }}
              >
                <CardContent className="p-3">
                  <div className="mb-2">
                    <h3 className="font-normal text-gray-700 leading-relaxed text-sm">
                      Create{" "}
                      <span className="font-semibold text-gray-900">
                        UGC Videos
                      </span>{" "}
                      and get shares on Instagram about Myntra Showbizz now.
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
              <Card
                className="bg-white text-black rounded-xl shadow-sm cursor-pointer"
                onClick={() => {
                  window.location.href =
                    "/companies/post-gig?title=UGC%20Videos%20for%20Myntra%20Showbizz&description=Create%20UGC%20Videos%20and%20get%20shares%20on%20Instagram%20about%20Myntra%20Showbizz%20now.";
                }}
              >
                <CardContent className="p-3">
                  <div className="mb-2">
                    <h3 className="font-normal text-gray-700 leading-relaxed text-sm">
                      Create{" "}
                      <span className="font-semibold text-gray-900">
                        UGC Videos
                      </span>{" "}
                      and get shares on Instagram about Myntra Showbizz now.
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

        {/* Right Sidebar - Notifications */}
        <div className="w-72">
          <Card className="bg-white text-black rounded-xl shadow-sm h-fit flex flex-col">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6 text-black">Notifications</h2>
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No new notifications</p>
                <p className="text-gray-400 text-xs mt-1 text-center">When you get notifications, they'll appear here</p>
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
  );
}
