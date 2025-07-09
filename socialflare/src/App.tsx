// src/App.tsx
import React, { useState } from "react";
import { FaChevronDown, FaPlay, FaArrowRight } from "react-icons/fa";
import { Routes, Route, useNavigate } from 'react-router-dom';
// @ts-expect-error: FlyingBanner is a JS component without a type declaration
import FlyingBanner from "./components/FlyingBanner";
import Lanyard from "./components/Lanyard";
import TrustedBy from "./components/TrustedBy";
import Stack from './components/Stack';
import CircularGallery from './components/CircularGallery.jsx';
import WaitlistForm from './components/WaitlistForm';
import AdminPage from './components/AdminPage';

const languages = [
  { code: "EN", label: "English" },
  { code: "FR", label: "French" },
  { code: "ES", label: "Spanish" },
  { code: "DE", label: "German" },
  { code: "RU", label: "Russian" },
];

function LanguageDropdown({ className = "" }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(languages[0]);

  return (
    <div className="relative">
      <button
        className={`rounded-4xl px-4 bg-inherit text-[#ADFF00] p-1 font-poppins border border-[#ADFF00] shadow transition-colors duration-200 hover:bg-[#ADFF0038] hover:border-[#ADFF00] flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#ADFF00] ${className}`}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
      >
        {selected.code}
        <FaChevronDown />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 bg-black rounded shadow z-20">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className="px-4 py-2 cursor-pointer hover:bg-[#ADFF0038] transition-colors duration-200 text-[#ADFF00] font-poppins"
              onMouseDown={() => {
                setSelected(lang);
                setOpen(false);
              }}
            >
              {lang.code}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const images = [
  { id: 1, img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=500&auto=format" },
  { id: 2, img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=500&auto=format" },
  { id: 3, img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?q=80&w=500&auto=format" },
  { id: 4, img: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format" },
];

const galleryItems = [
  { image: "https://picsum.photos/seed/1/800/600", text: "Daniel Lee\nGraphic Designer" },
  { image: "https://picsum.photos/seed/2/800/600", text: "Emily Taylor\nSocial Media Manager" },
  { image: "https://picsum.photos/seed/3/800/600", text: "Sarah Collins\nSocial Media Analyst" },
  { image: "https://picsum.photos/seed/4/800/600", text: "Michael Chen\nUX Designer" },
  { image: "https://picsum.photos/seed/5/800/600", text: "Jessica Wong\nContent Creator" },
];

const App = () => {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="/" element={
        <>
          <div className="relative h-screen w-screen bg-black overflow-x-hidden">
            {/* Background gradient */}
            <div className="grid-fade-bg" />

            {/* Top nav */}
            <div>
              <div className="absolute top-[8vh] sm:top-[15vh] left-0 w-full flex flex-row items-center justify-center gap-2 z-10 px-2 sm:left-[10vw] sm:w-auto sm:justify-start">
                <button className="rounded-3xl px-3 sm:px-6 py-1 text-xs h-8 sm:text-base sm:h-auto text-[#ADFF00] font-poppins border border-[#ADFF00] bg-transparent transition-colors duration-200 hover:bg-[#ADFF0038] hover:border-[#ADFF00] focus:outline-none focus:ring-2 focus:ring-[#ADFF00]">
                  For Talent
                </button>
                <button className="rounded-3xl px-3 sm:px-6 py-1 text-xs h-8 sm:text-base sm:h-auto text-[#ADFF00] font-poppins border border-[#ADFF00] bg-transparent transition-colors duration-200 hover:bg-[#ADFF0038] hover:border-[#ADFF00] flex items-center gap-1 sm:gap-2 focus:outline-none focus:ring-2 focus:ring-[#ADFF00]">
                  For Companies
                  <img src="/forcompaniessvg.svg" alt="icon" className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <div className="sm:hidden">
                  <LanguageDropdown className="rounded-3xl px-4 py-1 text-xs h-8 min-w-[64px] text-[#ADFF00] font-poppins border border-[#ADFF00] bg-transparent transition-colors duration-200 hover:bg-[#ADFF0038] hover:border-[#ADFF00] focus:outline-none focus:ring-2 focus:ring-[#ADFF00]" />
                </div>
              </div>
              <div className="hidden sm:block absolute top-[15vh] right-[10vw] z-10">
                <LanguageDropdown className="rounded-3xl px-4 py-1 text-base h-auto min-w-[64px] text-[#ADFF00] font-poppins border border-[#ADFF00] bg-transparent transition-colors duration-200 hover:bg-[#ADFF0038] hover:border-[#ADFF00] focus:outline-none focus:ring-2 focus:ring-[#ADFF00]" />
              </div>
            </div>

            {/* Lanyard & Headline + Waitlist/Video (responsive) */}
            <Lanyard position={[0, 0, 15]} gravity={[0, -40, 0]} />
            <div className="absolute top-[75vh] sm:top-[35vh] left-0 sm:left-[10vw] z-20 w-full sm:w-auto flex flex-col items-center sm:items-start">
              <div className="w-full max-w-[95vw] sm:max-w-[45Dvw] px-2 sm:px-0 flex flex-col sm:block items-center sm:items-start justify-center gap-2 sm:gap-0">
                <div className="text-white text-lg sm:text-6xl font-black font-poppins text-center sm:text-left mb-2 sm:mb-0">
                  100+ GIG-JOB DROPS EVERY FRIDAY, 5 PM
                </div>
                <div className="flex flex-row items-center justify-center sm:justify-start gap-2 sm:gap-8 mt-2 sm:mt-8">
                  <div className="bg-[#ADFF0038] rounded-full p-1 sm:p-2">
                    <div
                      className="bg-[#ADFF00] rounded-full px-3 py-1 sm:px-6 sm:py-2 font-poppins font-semibold text-black flex items-center gap-2 shadow text-xs sm:text-base cursor-pointer"
                      onClick={() => navigate('/waitlist')}
                    >
                      Join the waitlist
                      <FaArrowRight className="rotate-315" />
                    </div>
                  </div>
                  <button className="rounded-full bg-[#1A2B0A] w-8 h-8 sm:w-14 sm:h-14 flex items-center justify-center border-2 border-[#4B8000] shadow-lg">
                    <FaPlay className="text-[#ADFF00] text-base sm:text-xl" />
                  </button>
                  <span className="text-white font-poppins text-xs sm:text-lg">Watch Video</span>
                </div>
              </div>
            </div>

            {/* Flying banners */}
            <div className="hidden sm:block">
              <FlyingBanner
                style={{ position: "absolute", top: "30%", left: "50%" }}
                className="float-animate-y float-delay-0"
                title="10k+ Micro Gigs"
                avatars={[
                  "/avatars/avatar1.png",
                  "/avatars/avatar2.png",
                  "/avatars/avatar3.png",
                  "/avatars/avatar4.png",
                ]}
                extra={<div className="w-5 h-5 bg-black rounded-full ml-1" />}
              />
              <FlyingBanner
                style={{ position: "absolute", bottom: "18%", left: "65%" }}
                className="float-animate-x float-delay-1"
                title="10k+ Skill Tags"
                avatars={[
                  "/avatars/avatar1.png",
                  "/avatars/avatar2.png",
                  "/avatars/avatar3.png",
                  "/avatars/avatar4.png",
                ]}
                extra={<div className="w-5 h-5 bg-black rounded-full ml-1" />}
              />
              <FlyingBanner
                style={{ position: "absolute", top: "22%", right: "15%" }}
                className="float-animate-y float-delay-2"
                title={
                  <span>
                    <span className="font-bold">₹10L</span>
                    <br />
                    Disbursed
                  </span>
                }
                avatars={[]}
              />
            </div>

            {/* Trusted by + Gallery intro */}
            <div className="relative z-10 -mt-2">
              <div className="mx-auto w-full sm:w-[80vw] sm:max-w-[60vw] bg-[#F6F9FF] rounded-none sm:rounded-t-4xl px-2 sm:px-8 py-4 sm:py-6 relative z-20">
                <TrustedBy />
                <div className="w-full flex justify-center mt-2">
                  <span className="text-[#1F2E47] text-base sm:text-lg font-semibold text-center">125k+ companies</span>
                </div>
              </div>
              <div className="w-full bg-[#F6F9FF] rounded-none sm:rounded-t-4xl">
                <div className="mx-auto max-w-[1100px] px-2 sm:px-8 py-6 sm:py-12">
                  <div className="h-8 sm:h-[15vh]"></div>
                  <h2
                    className="text-2xl sm:text-4xl font-poppins text-center font-bold mb-2 sm:mb-4"
                    style={{ color: "#1F2E47" }}
                  >
                    Browse All Skill Gigs
                  </h2>
                  <p
                    className="text-center text-sm sm:text-lg font-poppins font-light"
                    style={{ color: "#1F2E47" }}
                  >
                    Claim Your Free, Sharable Skill Tag.
                  </p>
                  <p
                    className="text-center text-sm sm:text-lg font-poppins font-light"
                    style={{ color: "#1F2E47" }}
                  >
                    Start In Seconds, Start Looking For Gigs At Your Own Pace.
                  </p>
                  <div className="p-2 sm:p-6 flex justify-center">
                    <div
                      className="relative flex justify-center items-center"
                      style={{ minHeight: 200 }}
                    >
                      <div
                        className="absolute"
                        style={{
                          left: "50%",
                          top: "50%",
                          width: 320,
                          height: 220,
                          transform: "translate(-50%, -50%)",
                          zIndex: 0,
                          pointerEvents: "none",
                          background:
                            "radial-gradient(ellipse at center, #ADFF0066 0%, #ADFF0011 80%)",
                          filter: "blur(16px)",
                        }}
                      />
                      <div className="relative z-10">
                        <Stack
                          randomRotation={false}
                          sensitivity={180}
                          sendToBackOnClick={false}
                          cardDimensions={{ width: 280, height: 180 }}
                          cardsData={images}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-16 mt-8 sm:mt-16 w-full max-w-[1100px] mx-auto">
                    <div className="text-center sm:text-left max-w-full sm:max-w-[30vw] text-lg sm:text-5xl font-poppins font-bold text-[#1F2E47] leading-tight">
                      100+ Verified Skilled Talent!
                    </div>
                    <div className="flex flex-col items-center sm:items-start gap-2 sm:gap-6 w-full sm:w-[28vw] min-w-[180px] sm:min-w-[320px]">
                      <div className="text-[#1F2E47] text-sm sm:text-lg font-poppins font-normal text-center sm:text-left">
                        A dynamic group of innovators who ignite ideas and transform them into impactful work!
                      </div>
                      <div className="flex items-center justify-center">
                        <div
                          className="rounded-full p-[2px] bg-white/30 backdrop-blur-md"
                          style={{
                            boxShadow: "0 0 0 4px rgba(173,255,0,0.15)",
                          }}
                        >
                          <button
                            className="px-4 py-1 rounded-full border-2 flex items-center gap-2"
                            style={{
                              background: "#ADFF00",
                              borderColor: "#ADFF00",
                              color: "#1F2E47",
                              fontWeight: 600,
                              fontFamily: "Poppins, sans-serif",
                              fontSize: "1rem",
                              boxShadow: "0 2px 16px #ADFF0033", 
                              zIndex: 20,
                            }}
                          >
                            View All Jobs
                            <svg
                              width="16"
                              height="16"
                              fill="none"
                              stroke="#1F2E47"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              viewBox="0 0 24 24"
                            >
                              <path d="M5 12h14M13 6l6 6-6 6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Circular gallery */}
            <div className="bg-[#F6F9FF]">
              <div style={{ height: "600px", position: "relative" }}>
                <CircularGallery items={galleryItems} bend={3} scrollEase={0.02} />
              </div>
            </div>
          </div>

          {/* ——— GOT A GIG BANNER ——— */}
          <div className="w-full flex justify-center py-6 sm:py-12 bg-transparent">
            <div className="w-full max-w-[340px] sm:max-w-[900px] rounded-2xl sm:rounded-3xl bg-black shadow-xl border border-[#222] flex flex-col md:flex-row items-center justify-between px-4 py-4 sm:px-10 sm:py-8 gap-4 sm:gap-6">
              <h3 className="text-base sm:text-xl md:text-2xl font-bold text-[#ADFF00] text-center md:text-left">
                Got a Gig to be completed?
              </h3>
              <button className="px-4 py-2 sm:px-7 sm:py-3 bg-[#181F13] text-[#ADFF00] rounded-full border-2 border-[#ADFF00] font-semibold flex items-center gap-2 shadow-md hover:scale-105 transition-transform duration-150 text-sm sm:text-base">
                Post a Gig <FaArrowRight className="text-[#ADFF00]" />
              </button>
            </div>
          </div>

          {/* ——— FULL-WIDTH FOOTER ——— */}
          <div className="w-full bg-[#F6F9FF] pt-8 sm:pt-12 pb-4 sm:pb-6 px-2 md:px-8 font-poppins text-[#1F2E47] text-xs md:text-sm">
            <div className="max-w-full sm:max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12 items-start">
              {/* Left: Catalog + Logo */}
              <div className="flex flex-col gap-3 sm:gap-6 items-center sm:items-start">
                <div>
                  <div className="uppercase text-[10px] sm:text-xs tracking-[0.2em] text-[#1F2E47]/50 mb-1 sm:mb-2 font-medium text-center sm:text-left">
                    CATALOG
                  </div>
                  <div className="flex flex-col gap-1 sm:gap-2 text-base sm:text-lg font-semibold">
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4">
                      <span className="hover:text-[#ADFF00] transition-colors cursor-pointer">Features</span>
                      <span className="text-[#E6EAF1]">/</span>
                      <span className="hover:text-[#ADFF00] transition-colors cursor-pointer">Pricing</span>
                      <span className="text-[#E6EAF1]">/</span>
                      <span className="hover:text-[#ADFF00] transition-colors cursor-pointer">Product</span>
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4">
                      <span className="hover:text-[#ADFF00] transition-colors cursor-pointer">Contact</span>
                      <span className="text-[#E6EAF1]">/</span>
                      <span className="hover:text-[#ADFF00] transition-colors cursor-pointer">Document</span>
                    </div>
                  </div>
                </div>
                <div className="text-lg sm:text-2xl font-extrabold tracking-tight mt-2 sm:mt-4 text-[#1F2E47] opacity-80 text-center sm:text-left">SOCIALFLARE</div>
              </div>

              {/* Center: Contact & Location */}
              <div className="flex flex-col gap-4 sm:gap-10 border-l-0 sm:border-l border-r-0 sm:border-r border-[#E6EAF1] px-0 sm:px-8 items-center sm:items-start">
                <div>
                  <div className="text-xs sm:text-base font-bold mb-1 sm:mb-2 tracking-wide text-[#1F2E47] text-center sm:text-left">Contact Us</div>
                  <div className="text-xs sm:text-base font-normal mb-1 text-[#1F2E47]/80 text-center sm:text-left">+1 (999) 888-77-66</div>
                  <div className="text-xs sm:text-base font-normal text-[#1F2E47]/80 text-center sm:text-left">hello@nskalastd.com</div>
                </div>
                <div>
                  <div className="text-xs sm:text-base font-bold mb-1 sm:mb-2 tracking-wide text-[#1F2E47] text-center sm:text-left">Location</div>
                  <div className="text-xs sm:text-base font-normal text-[#1F2E47]/80 text-center sm:text-left">
                    483920, Indonesia,<br />Lampung 22/2/5, Office 4
                  </div>
                </div>
              </div>

              {/* Right: Languages */}
              <div className="flex flex-col items-center sm:items-end gap-2 sm:gap-4">
                <div className="text-[10px] sm:text-xs font-medium text-[#1F2E47]/60">Languages</div>
                <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap justify-center sm:justify-end">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className={`$ {
                        lang.code === "EN" ? "text-[#2563eb] font-bold underline" : "hover:text-[#ADFF00] transition-colors" 
                      } px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-[#ADFF00]`}
                    >
                      {lang.code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      } />
      <Route path="/waitlist" element={<WaitlistForm />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
};

export default App;
