"use client";

import React, { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface BlogGenerationLoaderProps {
  clientId: string;
  businessName: string;
}

export const BlogGenerationLoader: React.FC<BlogGenerationLoaderProps> = ({ 
  clientId,
  businessName
}) => {
  const router = useRouter();
  const [status, setStatus] = useState("AI is researching and brainstorming...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Subscribe to real-time updates for this client
    const channel = supabase
      .channel(`blog-gen-${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "clients",
          filter: `id=eq.${clientId}`,
        },
        (payload) => {
          const newStatus = payload.new.blog_status;
          if (newStatus === "Ready for Review") {
            setStatus("Success! Blog generated successfully.");
            setProgress(100);
            // Small delay to show success state before redirect
            setTimeout(() => {
              router.push(`/dashboard/website-blogs/${clientId}`);
            }, 1500);
          }
        }
      )
      .subscribe();

    // 2. Mock some progress steps for visual feedback
    const steps = [
      "Analyzing industry trends for " + businessName + "...",
      "Generating high-authority headlines...",
      "Drafting engaging introduction...",
      "Curating relevant images from Unsplash...",
      "Finalizing SEO metadata and tags...",
      "Performing final quality check..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setStatus(steps[currentStep]);
        setProgress((currentStep / steps.length) * 80); // Move up to 80% until real success
      }
    }, 8000); // Change step every 8 seconds (avg blog generation time 40-60s)

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [clientId, businessName, router]);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background soft gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] -mr-64 -mt-64 rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] -ml-64 -mb-64 rounded-full" />

      <div className="max-w-2xl w-full flex flex-col items-center text-center relative z-10">
        {/* Lottie Animation */}
        <div className="w-full max-w-[500px] h-[400px]">
          <DotLottieReact
            src="https://assets-v2.lottiefiles.com/a/43136e14-118a-11ee-afa9-e3a75585f1a0/3RVQ4eVjUH.lottie"
            loop
            autoplay
            className="w-full h-full object-contain"
          />
        </div>

        {/* Content */}
        <div className="mt-8 space-y-4 w-full">
          <div className="flex items-center justify-center gap-2">
            <div className="bg-primary/10 px-4 py-1.5 rounded-full flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-primary font-bold text-xs uppercase tracking-widest">Generating Your Blog</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-slate-900">
            Crafting the perfect article for <span className="text-primary">{businessName}</span>
          </h2>
          
          <p className="text-slate-500 text-lg font-medium min-h-[1.5em] transition-all">
            {status}
          </p>

          {/* Progress Bar */}
          <div className="mt-12 w-full max-w-md mx-auto">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(249,115,22,0.4)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 px-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                AI Pipeline Active
              </span>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                {Math.round(progress)}% Complete
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-20 flex items-center gap-6 text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">SEO Optimized</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Image Curation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Strategic Content</span>
          </div>
        </div>
      </div>
    </div>
  );
};
