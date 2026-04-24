"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AnalyzingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Analyzing website content",
    "Scanning LinkedIn presence",
    "Reviewing Instagram profile",
    "Identifying content gaps",
    "Generating strategic recommendations",
  ];

  useEffect(() => {
    // We expect the URL to have ?id=CLIENT_ID
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get("id");

    if (!clientId) {
      console.error("No client ID found in URL");
      return;
    }

    const triggerN8nWorkflow = async () => {
      try {
        const webhookUrl = process.env.NEXT_PUBLIC_N8N_STRATEGY_WEBHOOK;
        if (!webhookUrl) {
          console.warn("No webhook URL configured. Simulating delay...");
          setTimeout(() => router.push(`/onboarding/report?id=${clientId}`), 10000);
          return;
        }

        // Trigger workflow without blocking
        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: clientId })
        }).catch(err => console.error("Webhook trigger failed:", err));

        // Redirect immediately to report page
        router.push(`/onboarding/report?id=${clientId}`);
      } catch (err) {
        console.error("Setup error:", err);
        router.push(`/onboarding/report?id=${clientId}`);
      }
    };

    triggerN8nWorkflow();

    // Visual progress bar animation
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95; // Wait at 95% until API responds
        const newProgress = prev + 1;
        setCurrentStep(Math.floor((newProgress / 100) * steps.length));
        return newProgress;
      });
    }, 400); // Slower progress to account for API latency

    return () => clearInterval(timer);
  }, [router, steps.length]);

  return (
    <div className="bg-surface min-h-screen flex items-center justify-center font-body-base text-on-background overflow-hidden relative">
      {/* Decorative Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary-container/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-primary-container/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "-2s" }}></div>
      <div className="absolute top-1/2 right-1/4 w-12 h-12 border border-primary/10 rounded-xl rotate-12 animate-pulse" style={{ animationDelay: "-4s" }}></div>

      <main className="relative z-10 w-full max-w-2xl px-6 py-12 flex flex-col items-center">
        {/* Logo Section */}
        <div className="relative w-32 h-32 mb-12">
          {/* Rotating Outer Ring */}
          <div className="absolute inset-0 border-4 border-dashed border-primary-container/30 rounded-full animate-spin" style={{ animationDuration: "8s" }}></div>
          {/* Pulsing Center Circle */}
          <div className="absolute inset-4 bg-white shadow-xl rounded-full flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-primary-container text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              rocket_launch
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="font-h2 text-h2 text-on-secondary-fixed mb-3">Analyzing your business...</h1>
          <p className="font-body-base text-secondary text-lg">Our AI agents are crawling your digital footprint.</p>
        </div>

        {/* Progress List Card */}
        <div className="w-full bg-white rounded-xl shadow-lg border border-outline-variant/30 p-8 mb-8 space-y-6">
          {steps.map((stepName, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <div key={index} className={`flex items-center gap-4 ${!isCompleted && !isActive ? 'opacity-40' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-100 text-green-600' :
                  isActive ? 'border-2 border-primary-container border-t-transparent animate-spin' :
                  'border-2 border-outline'
                }`}>
                  {isCompleted && <span className="material-symbols-outlined text-xl font-bold">check</span>}
                </div>
                <span className={`font-body-base ${isActive ? 'font-semibold text-primary' : 'text-on-surface'}`}>
                  {stepName}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar Section */}
        <div className="w-full mb-12">
          <div className="flex justify-between items-end mb-3">
            <span className="font-label-caps text-secondary uppercase tracking-wider">Overall Progress</span>
            <span className="font-metric-lg text-primary text-xl">{progress}% Complete</span>
          </div>
          <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-in-out relative bg-gradient-to-r from-primary to-primary-container"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute top-0 right-0 h-full w-4 bg-white/20 skew-x-12 animate-pulse"></div>
            </div>
          </div>
          <p className="text-center mt-4 font-body-sm text-secondary italic">This usually takes 2-3 minutes</p>
        </div>

        {/* Tip Box */}
        <div className="w-full bg-primary-fixed/30 border border-primary-fixed-dim rounded-lg p-5 flex gap-4 items-start">
          <span className="text-xl">💡</span>
          <div>
            <span className="font-label-caps text-on-primary-fixed-variant block mb-1">PRO TIP</span>
            <p className="font-body-sm text-on-primary-fixed">We're comparing your brand against 1,000+ marketing strategies to ensure peak performance.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
