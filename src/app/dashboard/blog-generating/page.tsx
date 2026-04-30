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

    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    dotsRef.current = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 500);

    const channel = supabase
      .channel(`blog-gen-${clientId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "clients", filter: `id=eq.${clientId}` },
        (payload) => {
          if (payload.new?.blog_status === "Ready for Review") {
            cleanup();
            router.push(`/dashboard/website-blogs/${clientId}`);
          }
        }
      )
      .subscribe();

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
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  };

  const steps = [
    { label: "Analysing client profile & brand voice",   done: elapsed > 5  },
    { label: "Running AI Content Strategist agent",       done: elapsed > 15 },
    { label: "Drafting blog sections & headings",         done: elapsed > 30 },
    { label: "Polishing copy with AI Writer agent",       done: elapsed > 50 },
    { label: "Saving to database & finalising",           done: elapsed > 70 },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F5] flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(249,115,22,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(249,115,22,0.04),transparent_60%)] pointer-events-none" />

      {/* Card container */}
      <div className="relative z-10 bg-white rounded-3xl shadow-xl border border-slate-100 px-10 py-12 w-full max-w-lg flex flex-col items-center">

        {/* Logo */}
        <div className="mb-6">
          <div className="bg-primary px-5 py-2 rounded-xl inline-flex items-center justify-center shadow-md">
            <img src="/logo-light.png" alt="ScalePods" className="h-7 object-contain" />
          </div>
        </div>

        {/* Lottie Animation — man & robot in workplace */}
        <div className="w-72 h-56 mb-4">
          <DotLottieReact
            src="https://assets-v2.lottiefiles.com/a/43136e14-118a-11ee-afa9-e3a75585f1a0/3RVQ4eVjUH.lottie"
            loop
            autoplay
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Headline */}
        <h1 className="text-2xl font-black text-slate-900 text-center mb-2 tracking-tight">
          Crafting your blog{dots}
        </h1>
        <p className="text-slate-500 text-center text-sm mb-1 max-w-sm leading-relaxed">
          Our AI agents are writing a high-quality blog post
          {businessName ? (
            <> for <span className="text-primary font-bold">{businessName}</span></>
          ) : ""}.
          This usually takes <strong>1–2 minutes</strong>.
        </p>
        <p className="text-slate-400 text-xs mb-8">
          Time elapsed: <span className="text-primary font-semibold">{formatTime(elapsed)}</span>
        </p>

        {/* Progress steps */}
        <div className="w-full space-y-3 mb-8">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-700 ${
                  step.done
                    ? "bg-primary shadow-[0_0_10px_rgba(249,115,22,0.4)]"
                    : "border-2 border-slate-200 bg-white"
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
                  step.done ? "text-slate-800 font-semibold" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-primary to-orange-300 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min((elapsed / 90) * 100, 95)}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest text-center">
          You&apos;ll be redirected automatically when ready
        </p>
      </div>
    </div>
  );
}

export default function BlogGeneratingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BlogGeneratingContent />
    </Suspense>
  );
}
