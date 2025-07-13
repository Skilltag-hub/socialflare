import React from "react";

export default function FlyingBanner({ style, title, avatars, extra, className = "" }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg px-4 py-2 flex flex-col items-start min-w-[170px] max-w-xs ${className}`}
      style={style}
    >
      <span className="font-poppins font-medium text-sm text-black mb-2">{title}</span>
      <div className="flex items-center gap-1">
        {avatars.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="w-7 h-7 rounded-full border-2 border-white -ml-2 first:ml-0"
            style={{ zIndex: 10 - i }}
          />
        ))}
        {extra}
      </div>
    </div>
  );
} 