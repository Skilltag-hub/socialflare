"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bookmark,
  Clock,
  Users,
  Home,
  MessageCircle,
  Bell,
  Building2,
  User,
  FileText,
  Clock3,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ClickSpark from "@/utils/ClickSpark/ClickSpark";

export default function Component() {
  const jobCard = {
    company: "Myntra",
    openings: "100 Openings",
    timeAgo: "1d ago",
    description:
      "Create UGC Videos and get shares on Instagram about Myntra Showbizz now.",
    payment: "₹ 350",
    applicationDeadline: "2025-02-15", // Example deadline
  };

  // Helper function to check if deadline has passed
  const isDeadlinePassed = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const currentDate = new Date();
    return currentDate > deadlineDate;
  };

  // Helper function to format deadline display
  const formatDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const currentDate = new Date();
    const timeDiff = deadlineDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return "Deadline passed";
    } else if (daysDiff === 0) {
      return "Deadline today";
    } else if (daysDiff === 1) {
      return "1 day left";
    } else {
      return `${daysDiff} days left`;
    }
  };

  const JobCard = ({ job }: { job: typeof jobCard }) => {
    const deadlinePassed = isDeadlinePassed(job.applicationDeadline);
    const deadlineText = formatDeadline(job.applicationDeadline);
    
    // Calculate days difference for styling
    const deadlineDate = new Date(job.applicationDeadline);
    const currentDate = new Date();
    const timeDiff = deadlineDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return (
    <Card className="bg-white rounded-2xl shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-lg">JS</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{job.company}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-purple-500" />
                <span>{job.openings}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{job.timeAgo}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-4 leading-relaxed">
          Create <span className="font-semibold">UGC Videos</span> and get
          shares on Instagram about Myntra Showbizz now.
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-purple-600 text-lg">₹</span>
            <span className="text-purple-600 font-semibold text-lg">350</span>
          </div>
          <div className="flex items-center gap-3">
            <ClickSpark
              sparkColor="#000"
              sparkSize={5}
              sparkRadius={15}
              sparkCount={8}
              duration={400}
            >
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bookmark className="w-4 h-4 text-gray-400" />
              </Button>
            </ClickSpark>
            {deadlinePassed ? (
              <Button 
                disabled 
                className="bg-gray-400 text-gray-600 px-6 py-2 rounded-full cursor-not-allowed"
              >
                Deadline Passed
              </Button>
            ) : (
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full">
                Apply
              </Button>
            )}
          </div>
        </div>
        
        {/* Deadline indicator */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Application Deadline:</span>
            <span className={`font-medium ${
              deadlinePassed 
                ? "text-red-500" 
                : daysDiff <= 3 
                  ? "text-orange-500" 
                  : "text-green-500"
            }`}>
              {deadlineText}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
    );
  };

  return (
    <>
      {/* Mobile Layout - Below 700px */}
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 lg:hidden">
        <div className="w-full max-w-sm bg-gradient-to-b from-purple-100 to-purple-200 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-8">
            <div>
              <p className="text-gray-600 text-sm mb-1">Good morning, Luke!</p>
              <p className="text-purple-600 text-xl font-semibold">
                You Earned ₹0
              </p>
            </div>
            <Avatar className="w-12 h-12 bg-gray-300">
              <AvatarFallback className="bg-gray-300"></AvatarFallback>
            </Avatar>
          </div>

          {/* Job Cards */}
          <div className="px-4 space-y-4 pb-4">
            {Array(3)
              .fill(jobCard)
              .map((job, index) => (
                <JobCard key={index} job={job} />
              ))}
          </div>

          {/* Bottom Navigation */}
          <div className="bg-purple-600 px-4 py-4 mt-4 rounded-t-3xl">
            <div className="flex items-center justify-around">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-purple-500 h-12 w-12"
              >
                <Home className="w-6 h-6 fill-current" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-purple-500 h-12 w-12"
              >
                <MessageCircle className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-purple-500 h-12 w-12"
              >
                <Bell className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-purple-500 h-12 w-12"
              >
                <Building2 className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-purple-500 h-12 w-12"
              >
                <User className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Above 700px */}
      <div className="hidden lg:flex min-h-screen bg-black">
        {/* Sidebar */}
        <Navbar />
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="grid grid-cols-3 gap-6 max-w-6xl">
            {Array(9)
              .fill(jobCard)
              .map((job, index) => (
                <JobCard key={index} job={job} />
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
