import React from "react";

const logoCount = 6; // Adjust as needed for the number of logos
const logos = Array.from({ length: logoCount }, (_, i) => `/logos/logo${i + 1}.png`);

const floatClasses = [
  "float-animate-y float-delay-0",
  "float-animate-x float-delay-1",
  "float-animate-y float-delay-2",
  "float-animate-x float-delay-0",
  "float-animate-y float-delay-1",
  "float-animate-x float-delay-2",
];

const FloatingLogos = () => (
  <>
    {/* Left floating logos */}
    <div className="absolute left-[10%] top-[10%] flex flex-col gap-20 z-10">
      {logos.slice(0, Math.ceil(logoCount / 2)).map((src, i, arr) => (
        <img
          key={src}
          src={src}
          alt={`Logo ${i + 1}`}
          className={`w-10 h-10 sm:w-14 sm:h-14 object-contain ${floatClasses[i % floatClasses.length]}${i === Math.floor(arr.length / 2) ? ' ml-8 sm:ml-16' : ''}`}
          style={{ animationDelay: `${i * 0.7}s` }}
        />
      ))}
    </div>
    {/* Right floating logos */}
    <div className="absolute right-[10%] top-[10%] flex flex-col gap-24 z-10">
      {logos.slice(Math.ceil(logoCount / 2)).map((src, i, arr) => (
        <img
          key={src}
          src={src}
          alt={`Logo ${i + 1 + Math.ceil(logoCount / 2)}`}
          className={`w-10 h-10 sm:w-14 sm:h-14 object-contain ${floatClasses[(i + 3) % floatClasses.length]}${i === Math.floor(arr.length / 2) ? ' mr-8 sm:mr-16' : ''}`}
          style={{ animationDelay: `${i * 0.7 + 0.3}s` }}
        />
      ))}
    </div>
  </>
);

export default FloatingLogos; 