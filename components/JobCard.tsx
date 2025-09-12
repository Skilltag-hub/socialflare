"use client";

import type React from "react";
import { Button } from "@/components/ui/Button";
import {
  Edit2,
  Trash2,
  Users,
  Clock,
  Loader2,
  Eye,
  CheckCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface JobCardProps {
  job: {
    _id: string;
    gigTitle: string;
    description: string;
    payment?: string;
    skills?: string[];
    datePosted: string;
    status?: string;
  };
  applications: Record<
    string,
    Array<{
      _id: string;
      applicantEmail: string;
      status: string;
    }>
  >;
  handleEditJob: (job: any, e: React.MouseEvent) => void;
  handleDeleteJob: (jobId: string, e: React.MouseEvent) => void;
  markCompleted: (jobId: string, e: React.MouseEvent) => void;
  isDeleting: boolean;
  hideActions?: boolean;
}

export default function JobCard({
  job,
  applications,
  handleEditJob,
  handleDeleteJob,
  markCompleted,
  isDeleting,
  hideActions = false,
}: JobCardProps) {
  const handleViewApplications = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/companies/job-applications/${job._id}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="p-4">
        {/* Header Section */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {job.gigTitle}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        </div>

        {/* Payment Section */}
        {job.payment && (
          <div className="mb-4">
            <div className="inline-flex items-center bg-green-50 border border-green-200 rounded-lg px-2.5 py-0.5">
              <span className="text-xs font-medium text-green-700">
                Payment: ₹{job.payment}
              </span>
            </div>
          </div>
        )}

        {/* Skills Section */}
        {job.skills && job.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {job.skills.slice(0, 3).map((skill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full border border-blue-200"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 3 && (
                <span className="inline-flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
                  +{job.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-purple-500" />
            <span className="font-medium">
              {applications[job._id]?.length || 0} Applicants
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{new Date(job.datePosted).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {!hideActions && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <TooltipProvider>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      onClick={(e) => handleEditJob(job, e)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit job</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => handleDeleteJob(job._id, e)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete job</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      onClick={handleViewApplications}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View applications</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={job.status === "completed" ? "outline" : "default"}
                      size="sm"
                      className={`${
                        job.status === "completed"
                          ? "h-8 w-8 text-green-700 bg-green-50 border border-green-200 cursor-not-allowed"
                          : "h-8 w-8 bg-purple-600 hover:bg-purple-700 text-white"
                      }`}
                      onClick={(e) => markCompleted(job._id, e)}
                      disabled={job.status === "completed"}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {job.status === "completed"
                        ? "Completed"
                        : "Mark completed"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
}
