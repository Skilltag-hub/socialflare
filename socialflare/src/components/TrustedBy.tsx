import React from "react";

const companyLogos = [
  "/companies/company1.png",
  "/companies/company2.png",
  "/companies/company3.png",
  "/companies/company4.png",
];

const TrustedBy = () => (
  <div className="flex bg-[#F6F9FF] justify-between items-center w-full">
    {/* Left side: label + logos */}
    <div className="flex items-center gap-6">
      <span className="font-semibold text-black/80 text-sm">Trusted by.</span>
      {companyLogos.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Company ${i + 1}`}
          className="w-16 h-8 object-contain grayscale opacity-70"
        />
      ))}
    </div>

    {/* Right side: count */}
    <div className="flex flex-col items-end">
      <span className="font-bold text-black text-xl">125k<sup>+</sup></span>
      <span className="text-xs text-black/60">Companies</span>
    </div>
  </div>
);

export default TrustedBy;
