"use client";

import ZigworkDashboard from "@/components/zigwork-dashboard";

export default function CompaniesHome() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      {/* Mobile/Tablet message */}
      <div className="block lg:hidden text-center space-y-3">
        <h1 className="text-white text-3xl font-semibold tracking-tight">Skilltag</h1>
        <p className="text-[#ADFF00] text-base leading-relaxed">
          Companies are requested to log in on a desktop for the best experience.
        </p>
      </div>

      {/* Desktop content */}
      <div className="hidden lg:block w-full">
        <ZigworkDashboard />
      </div>
    </div>
  );
}