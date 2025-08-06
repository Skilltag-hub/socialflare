'use client';

import React from 'react';
import Navbar from "@/components/Navbar";

const NotificationsPage = () => {
  return (
    <>
      {/* Mobile Layout - Below 700px */}
      <div className="min-h-screen bg-gray-100 flex items-center justify-center lg:hidden">
        <div className="w-full bg-gradient-to-b from-green-100 to-green-200 flex flex-col relative">
          <div className="fixed bottom-1 inset-x-0 z-50">
            <Navbar />
          </div>
          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-8 sticky top-0 z-10 bg-gradient-to-b from-green-100 to-green-200">
            <div>
              <p className="text-gray-600 text-sm mb-1">Notifications</p>
              <p className="text-green-600 text-xl font-semibold">Notifications</p>
            </div>
          </div>
          {/* Content */}
          <div className="px-4 space-y-4 pb-[100px] pt-2 flex-1 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <h2 className="text-lg font-semibold mb-2 text-green-600">No new notifications</h2>
              <p className="text-gray-500 text-sm">When you get notifications, they'll appear here.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Above 700px */}
      <div className="hidden lg:flex min-h-screen bg-black">
        {/* Sidebar */}
        <Navbar />
        {/* Main Content */}
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="max-w-xl w-full">
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
              <h1 className="text-3xl font-bold mb-4 text-green-600">Notifications</h1>
              <h2 className="text-lg font-semibold mb-2 text-green-600">No new notifications</h2>
              <p className="text-gray-500 text-sm">When you get notifications, they'll appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
