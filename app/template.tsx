"use client";

import { animatePageIn } from "@/utils/animations";
import { useState, useEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    animatePageIn();
  }, []);
  return (
    <>
      <div
        id="left-banner"
        className="min-h-screen bg-[#ADFF00] z-50 fixed top-0 left-0 w-1/2"
      >
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
          <h1 className="text-6xl font-poppins font-extrabold">SKILL</h1>
        </div>
      </div>
      <div
        id="right-banner"
        className="min-h-screen bg-black z-50 fixed top-0 right-0 w-1/2"
      >
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
          <h1 className="text-6xl font-poppins text-[#ADFF00] font-extrabold">
            TAG
          </h1>
        </div>
      </div>
      {children}
    </>
  );
}
