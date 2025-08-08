"use client";

import React from "react";
import Navbar from "@/components/Navbar";

const NotificationsPage = () => {
  return (
    <>
      {/* Mobile Layout - Below 700px */}
      <div className="min-h-screen bg-gray-100 flex flex-col lg:hidden">
        <div className="w-full max-w-sm mx-auto bg-gradient-to-b from-purple-100 to-purple-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-screen relative">
          <Navbar />
          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-8 bg-gradient-to-b from-purple-100 to-purple-200 sticky top-0 z-10">
            <div>
              <p className="text-gray-600 text-sm mb-1">Notifications</p>
              <p className="text-skill text-xl font-semibold">Notifications</p>
            </div>
          </div>
          {/* Content */}
          <div className="px-4 space-y-4 pb-[100px] pt-2 flex-1 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <h2 className="text-lg font-semibold mb-2 text-skill">
                No new notifications
              </h2>
              <p className="text-gray-500 text-sm">
                When you get notifications, they'll appear here.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Above 700px */}
      <div className="hidden lg:flex min-h-screen bg-black">
        {/* Sidebar */}
        <Navbar />
        {/* Main Content */}
        <div className="flex-1 p-8 lg:ml-64">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-skill">
              Notifications
            </h1>
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-xl mx-auto">
              <h2 className="text-lg font-semibold mb-2 text-skill">
                No new notifications
              </h2>
              <p className="text-gray-500 text-sm">
                When you get notifications, they'll appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
