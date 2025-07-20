import React from "react";

const companyLogos = [
  "/companies/company1.png",
  "/companies/company2.png",
  "/companies/company3.png",
  "/companies/company4.png",
];

const TrustedBy = () => (
  <div className="mx-auto w-full max-w-[100vw] sm:max-w-[60vw] bg-[#F6F9FF] px-2 sm:px-4 py-3 flex justify-center items-center rounded-none sm:rounded-t-xl shadow-md">
    <div className="flex flex-wrap items-center gap-3 sm:gap-6 justify-center w-full">
      <span className="font-semibold text-black/80 text-xs sm:text-sm">Trusted by.</span>
      {companyLogos.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Company ${i + 1}`}
          className="w-12 h-6 sm:w-16 sm:h-8 object-contain grayscale opacity-70"
        />
      ))}
    </div>  
  </div>
);

export default TrustedBy;
