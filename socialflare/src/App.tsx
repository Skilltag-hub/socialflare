// src/App.tsx
import React, { useState } from "react";
import { FaChevronDown, FaPlay, FaArrowRight } from "react-icons/fa";
// @ts-expect-error: FlyingBanner is a JS component without a type declaration
import FlyingBanner from "./components/FlyingBanner";
import Lanyard from "./components/Lanyard";
import TrustedBy from "./components/TrustedBy";
import Stack from './components/Stack';
import CircularGallery from './components/CircularGallery.jsx';

const languages = [
  { code: "EN", label: "English" },
  { code: "FR", label: "French" },
  { code: "ES", label: "Spanish" },
  { code: "DE", label: "German" },
  { code: "RU", label: "Russian" },
];

function LanguageDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(languages[0]);

  return (
    <div className="relative">
      <button
        className="rounded-4xl px-4 bg-inherit text-[#ADFF00] p-1 font-poppins border border-[#ADFF00] shadow transition-colors duration-200 hover:bg-[#ADFF0038] hover:border-[#ADFF00] flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#ADFF00]"
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
  return (
    <>
      <div className="relative h-screen w-screen bg-black overflow-x-hidden">
        {/* Background gradient */}
        <div className="grid-fade-bg" />

        {/* Top nav */}
        <div className="absolute top-[15vh] left-[10vw] flex gap-2 z-10">
          <button className="rounded-4xl px-6 text-[#ADFF00] p-1 font-poppins border border-[#ADFF00] bg-transparent transition-colors duration-200 hover:bg-[#ADFF0038] hover:border-[#ADFF00] focus:outline-none focus:ring-2 focus:ring-[#ADFF00]">
            For Talent
          </button>
          <button className="rounded-4xl px-6 text-[#ADFF00] p-1 font-poppins border border-[#ADFF00] bg-transparent transition-colors duration-200 hover:bg-[#ADFF0038] hover:border-[#ADFF00] flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#ADFF00]">
            For Companies
            <img src="/forcompaniessvg.svg" alt="icon" className="w-4 h-4" />
          </button>
        </div>
        <div className="absolute top-[15vh] right-[10vw] z-10">
          <LanguageDropdown />
        </div>

        {/* Join & Video */}
        <div className="absolute left-[20vh] top-[70vh] flex items-center gap-8 z-20">
          <div className="bg-[#ADFF0038] rounded-full p-2">
            <div className="bg-[#ADFF00] rounded-full px-6 py-2 font-poppins font-semibold text-black flex items-center gap-2 shadow">
              Join the waitlist
              <FaArrowRight className="rotate-315" />
            </div>
          </div>
          <button className="rounded-full bg-[#1A2B0A] w-14 h-14 flex items-center justify-center border-2 border-[#4B8000] shadow-lg">
            <FaPlay className="text-[#ADFF00] text-xl" />
          </button>
          <span className="text-white font-poppins text-lg">Watch Video</span>
        </div>

        {/* Lanyard & Headline */}
        <Lanyard position={[0, 0, 15]} gravity={[0, -40, 0]} />
        <div className="absolute top-[35vh] left-[20vh] max-w-[40vw] text-white text-6xl font-black font-poppins">
          100+ GIG-JOB<br />
          DROPS EVERY<br />
          FRIDAY, 5 PM
        </div>

        {/* Flying banners */}
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

        {/* Trusted by + Gallery intro */}
        <div className="relative z-10 -mt-2">
          <div className="mx-auto w-[80vw] max-w-[60vw] bg-[#F6F9FF] rounded-t-4xl px-8 py-6 relative z-20">
            <TrustedBy />
          </div>
          <div className="w-full bg-[#F6F9FF] rounded-t-4xl">
            <div className="mx-auto max-w-[1100px] px-8 py-12">
              <div className="h-[15vh]"></div>
              <h2
                className="text-4xl font-poppins text-center font-bold mb-4"
                style={{ color: "#1F2E47" }}
              >
                Browse All Skill Gigs
              </h2>
              <p
                className="text-center text-lg font-poppins font-light"
                style={{ color: "#1F2E47" }}
              >
                Claim Your Free, Sharable Skill Tag.
              </p>
              <p
                className="text-center text-lg font-poppins font-light"
                style={{ color: "#1F2E47" }}
              >
                Start In Seconds, Start Looking For Gigs At Your Own Pace.
              </p>
              <div className="p-6 flex justify-center">
                <div
                  className="relative flex justify-center items-center"
                  style={{ minHeight: 340 }}
                >
                  <div
                    className="absolute"
                    style={{
                      left: "50%",
                      top: "50%",
                      width: 600,
                      height: 420,
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
                      cardDimensions={{ width: 400, height: 300 }}
                      cardsData={images}
                    />
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 flex items-center justify-center">
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
              <div className="flex flex-row items-center justify-center gap-16 mt-16 w-full max-w-[1100px] mx-auto">
                <div className="text-left max-w-[30vw] text-5xl font-poppins font-bold text-[#1F2E47] leading-tight">
                  100+ Verified
                  <br />
                  Skilled Talent!
                </div>
                <div className="flex flex-col items-start gap-6 w-[28vw] min-w-[320px]">
                  <div className="text-[#1F2E47] text-lg font-poppins font-normal">
                    A dynamic group of innovators who ignite ideas and
                    transform them into impactful work!
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
      <div className="bg-black py-8">
        <div className="max-w-[1100px] mx-auto px-12 flex items-center justify-between">
          <h3 className="text-3xl font-bold text-[#ADFF00]">
            Got a Gig to be completed?
          </h3>
          <button className="px-6 py-2 bg-[#ADFF00] text-black rounded-full border border-black font-semibold flex items-center gap-2">
            Post a Gig <FaArrowRight />
          </button>
        </div>
      </div>

      {/* ——— FULL-WIDTH FOOTER ——— */}
      <div className="w-full bg-[#F6F9FF] pt-24 pb-16 px-12 font-poppins text-[#1F2E47] text-lg">
        <div className="max-w-[1100px] mx-auto grid grid-cols-3 gap-8">
          {/* Left: Catalog + Logo */}
          <div className="flex flex-col gap-8">
            <div>
              <div className="uppercase text-sm tracking-[0.2em] text-[#1F2E47]/60 mb-4 font-medium">
                CATALOG
              </div>
              <div className="flex flex-col gap-2 text-2xl font-semibold">
                <div className="flex items-center gap-6">
                  <span className="hover:text-[#1F2E47] transition-colors">Features</span>
                  <span className="text-[#E6EAF1]">/</span>
                  <span className="hover:text-[#1F2E47] transition-colors">Pricing</span>
                  <span className="text-[#E6EAF1]">/</span>
                  <span className="hover:text-[#1F2E47] transition-colors">Product</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="hover:text-[#1F2E47] transition-colors">Contact</span>
                  <span className="text-[#E6EAF1]">/</span>
                  <span className="hover:text-[#1F2E47] transition-colors">Document</span>
                </div>
              </div>
            </div>
            <div className="text-3xl font-extrabold">SOCIALFLARE</div>
          </div>

          {/* Center: Contact & Location */}
          <div className="flex flex-col gap-16">
            <div>
              <div className="text-2xl font-bold mb-4">Contact Us</div>
              <div className="text-2xl font-normal mb-2">+1 (999) 888-77-66</div>
              <div className="text-2xl font-normal">hello@nskalastd.com</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-4">Location</div>
              <div className="text-2xl font-normal">
                483920, Indonesia,
                <br />
                Lampung 22/2/5, Office 4
              </div>
            </div>
          </div>

          {/* Right: Languages */}
          <div className="flex flex-col items-end gap-2">
            <div className="text-sm font-medium">Languages</div>
            <div className="flex gap-4 text-base">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`${
                    lang.code === "EN" ? "text-[#2563eb] font-bold underline" : "hover:text-[#1F2E47]"
                  }`}
                >
                  {lang.code}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
