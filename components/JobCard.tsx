"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Users, Clock, Loader2, Eye } from "lucide-react"

interface JobCardProps {
  job: {
    _id: string
    gigTitle: string
    description: string
    payment?: string
    skills?: string[]
    datePosted: string
    status?: string
  }
  applications: Record<
    string,
    Array<{
      _id: string
      applicantEmail: string
      status: string
    }>
  >
  handleEditJob: (job: any, e: React.MouseEvent) => void
  handleDeleteJob: (jobId: string, e: React.MouseEvent) => void
  markCompleted: (jobId: string, e: React.MouseEvent) => void
  isDeleting: boolean
}

export default function JobCard({
  job,
  applications,
  handleEditJob,
  handleDeleteJob,
  markCompleted,
  isDeleting,
}: JobCardProps) {
  const handleViewApplications = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.location.href = `/companies/job-applications/${job._id}`
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {job.gigTitle}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{job.description}</p>
        </div>

        {/* Payment Section */}
        {job.payment && (
          <div className="mb-4">
            <div className="inline-flex items-center bg-green-50 border border-green-200 rounded-lg px-3 py-1">
              <span className="text-sm font-medium text-green-700">Payment: ₹{job.payment}</span>
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
                  className="inline-flex items-center bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full border border-blue-200"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 3 && (
                <span className="inline-flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                  +{job.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="flex items-center gap-6 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" />
            <span className="font-medium">{applications[job._id]?.length || 0} Applicants</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{new Date(job.datePosted).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Applications Section */}
        {applications[job._id] && applications[job._id].length > 0 && (
          <div className="mb-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Applications</h4>
            {applications[job._id].slice(0, 2).map((app) => (
              <div
                key={app._id}
                className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2 border border-gray-100"
              >
                <span className="text-gray-700 font-medium">{app.applicantEmail}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    app.status === "accepted"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : app.status === "rejected"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  }`}
                >
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </div>
            ))}
            {applications[job._id].length > 2 && (
              <p className="text-xs text-gray-500 text-center">+{applications[job._id].length - 2} more applications</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
              onClick={(e) => handleEditJob(job, e)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 text-gray-500 hover:text-red-600 hover:bg-red-50"
              onClick={(e) => handleDeleteJob(job._id, e)}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="px-3 text-sm font-medium text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 bg-transparent"
              onClick={handleViewApplications}
            >
              <Eye className="h-4 w-4 mr-1" />
            </Button>
            <Button
              className={`px-4 rounded-lg font-medium text-sm transition-all ${
                job.status === "completed"
                  ? "bg-green-100 text-green-700 border border-green-200 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md"
              }`}
              onClick={(e) => markCompleted(job._id, e)}
              disabled={job.status === "completed"}
            >
              {job.status === "completed" ? "✓ Completed" : "Mark Completed"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
