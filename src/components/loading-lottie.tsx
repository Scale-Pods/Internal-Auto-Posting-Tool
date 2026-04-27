"use client";

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface LoadingLottieProps {
  message?: string;
  size?: number;
}

export const LoadingLottie: React.FC<LoadingLottieProps> = ({ 
  message = "Loading...", 
  size = 300 
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div style={{ width: size, height: size * 0.75 }}>
        <DotLottieReact
          src="https://assets-v2.lottiefiles.com/a/9fd4599a-1178-11ee-be53-7bb47e998f8c/JtQM62SaWC.lottie"
          loop
          autoplay
          className="w-full h-full object-contain"
        />
      </div>
      {message && (
        <p className="text-slate-500 font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};
