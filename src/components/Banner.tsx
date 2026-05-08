"use client";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";

export function Banner() {
  const { sysSettings } = useAuth();

  if (!sysSettings || !sysSettings.showBanner || !sysSettings.bannerMessage) return null;

  const message = sysSettings.bannerMessage;

  return (
    <div className="bg-red-600 text-white py-2 overflow-hidden whitespace-nowrap relative z-[100]">
      <div className="animate-marquee inline-block font-black text-sm uppercase tracking-widest px-4">
        {message} &nbsp; • &nbsp; {message} &nbsp; • &nbsp; {message} &nbsp; • &nbsp; {message} &nbsp; • &nbsp; {message} &nbsp; • &nbsp; {message} &nbsp; • &nbsp; {message} &nbsp; • &nbsp; {message}
      </div>
      <style jsx>{`
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
