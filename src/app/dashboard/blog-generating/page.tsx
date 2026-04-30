"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

function BlogGeneratingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientId = searchParams.get("id");
  const [businessName, setBusinessName] = useState<string>("");
  const [elapsed, setElapsed] = useState(0);
  const [dots, setDots] = useState(".");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dotsRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!clientId) return;

    // Fetch initial business name and check if already done
    supabase
      .from("clients")
      .select("business_name, blog_status")
      .eq("id", clientId)
      .single()
      .then(({ data }) => {
        if (data) setBusinessName(data.business_name);
        if (data?.blog_status === "Ready for Review") {
          router.replace(`/dashboard/website-blogs/${clientId}`);
        }
      });

    // Elapsed counter
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);

    // Animated dots
    dotsRef.current = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);

    // Real-time Supabase subscription
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
          const newStatus = payload.new?.blog_status;
          if (newStatus === "Ready for Review") {
            cleanup();
            router.push(`/dashboard/website-blogs/${clientId}`);
          }
        }
      )
      .subscribe();

    // Fallback polling every 6 seconds
    pollingRef.current = setInterval(async () => {
      const { data } = await supabase
        .from("clients")
        .select("blog_status")
        .eq("id", clientId)
        .single();
      if (data?.blog_status === "Ready for Review") {
        cleanup();
        router.push(`/dashboard/website-blogs/${clientId}`);
      }
    }, 6000);

    const cleanup = () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (dotsRef.current) clearInterval(dotsRef.current);
      supabase.removeChannel(channel);
    };

    return cleanup;
  }, [clientId]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const steps = [
    { label: "Analysing client profile & brand voice", done: elapsed > 5 },
    { label: "Running AI Content Strategist agent", done: elapsed > 15 },
    { label: "Drafting blog sections & headings", done: elapsed > 30 },
    { label: "Polishing copy with AI Writer agent", done: elapsed > 50 },
    { label: "Saving to database & finalising", done: elapsed > 70 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1409] to-[#0f0f0f] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-orange-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-orange-400/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Logo */}
      <div className="mb-8">
        <img src="/logo-light.png" alt="ScalePods" className="h-9 object-contain" />
      </div>

      {/* Lottie Animation */}
      <div className="w-72 h-64 mb-6">
        <DotLottieReact
          src="https://lottie.host/f50dffbc-77a8-4f39-95bc-5e5ef9e60ed7/XEz6O9vmfL.lottie"
          loop
          autoplay
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Headline */}
      <h1 className="text-3xl md:text-4xl font-black text-white text-center mb-3 tracking-tight">
        Crafting your blog{dots}
      </h1>
      <p className="text-slate-400 text-center text-sm mb-1 max-w-sm">
        Our AI agents are writing a high-quality blog post
        {businessName ? (
          <> for <span className="text-primary font-bold">{businessName}</span></>
        ) : ""}
        . This usually takes 1–2 minutes.
      </p>
      <p className="text-slate-600 text-xs mb-10">
        Time elapsed:{" "}
        <span className="text-primary font-semibold">{formatTime(elapsed)}</span>
      </p>

      {/* Progress steps */}
      <div className="w-full max-w-xs space-y-3 mb-10">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-700 ${
                step.done
                  ? "bg-primary shadow-[0_0_14px_rgba(249,115,22,0.5)]"
                  : "border-2 border-slate-700"
              }`}
            >
              {step.done && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span
              className={`text-sm transition-colors duration-500 ${
                step.done ? "text-white font-semibold" : "text-slate-600"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-orange-300 rounded-full transition-all duration-1000"
          style={{ width: `${Math.min((elapsed / 90) * 100, 95)}%` }}
        />
      </div>
      <p className="text-[10px] text-slate-700 mt-3 uppercase tracking-widest">
        You&apos;ll be redirected automatically when ready
      </p>
    </div>
  );
}

export default function BlogGeneratingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BlogGeneratingContent />
    </Suspense>
  );
}
