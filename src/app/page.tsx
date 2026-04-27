"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { 
  Lock, 
  Database, 
  BrainCircuit, 
  PenTool, 
  UserCheck, 
  Palette, 
  ShieldCheck, 
  CalendarClock, 
  BarChart3,
  ArrowRight
} from "lucide-react";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const workflowSteps = [
  {
    id: "step-1",
    title: "1. Authentication Setup",
    description: "Secure, role-based access for Admin, Client, and Designer. Seamless Google Authentication gets your team in instantly.",
    icon: Lock,
    tags: ["Google Auth", "RBAC", "Admin/Client/Designer"],
    mockup: "Roles: Admin | Client | Designer"
  },
  {
    id: "step-2",
    title: "2. Business Information Capture",
    description: "We intake your business DNA: Industry, Target Audience, Brand Tone, Competitors, and Primary Goals (Sales, Awareness, etc.).",
    icon: Database,
    tags: ["Brand DNA", "Audience Profiling", "Goal Setting"],
    mockup: "Tone: Premium | Target: LinkedIn & IG"
  },
  {
    id: "step-3",
    title: "3. AI Web Analysis & Strategy",
    description: "The AI agent deep-scans your LinkedIn, Instagram, and Website. It identifies gaps, evaluates positioning, and builds a custom marketing strategy.",
    icon: BrainCircuit,
    tags: ["Deep Scan", "Gap Analysis", "Positioning"],
    mockup: "Scanning... 14 URLs analyzed. Strategy built."
  },
  {
    id: "step-4",
    title: "4. Content Creation",
    description: "Based on the AI strategy, our engine generates high-converting copy, captions, and blog drafts tailored precisely to your brand voice.",
    icon: PenTool,
    tags: ["AI Copywriting", "Brand Voice Match", "Drafting"],
    mockup: "Generated: 5 LinkedIn Posts, 3 IG Carousels"
  },
  {
    id: "step-5",
    title: "5. Maker-Checker Approval",
    description: "A robust internal review gate. Content must be approved or edited before moving to the design phase. Zero errors slip through.",
    icon: UserCheck,
    tags: ["Review Gate", "Collaboration", "Quality Control"],
    mockup: "Status: Approved by Manager"
  },
  {
    id: "step-6",
    title: "6. Design Execution",
    description: "Approved copy flows into the Designer module. Seamlessly integrate with Figma and Canva, pulling context directly from the approved briefs.",
    icon: Palette,
    tags: ["Figma Sync", "Canva Export", "Contextual Briefs"],
    mockup: "Design Brief: Minimalist, Amber highlights"
  },
  {
    id: "step-7",
    title: "7. Design Approval",
    description: "The final sign-off loop. Clients and Admins review the visual assets alongside the copy. Revisions are tracked; approved assets are locked.",
    icon: ShieldCheck,
    tags: ["Client Sign-off", "Revision Tracking", "Asset Lock"],
    mockup: "Client Feedback: Approved for publishing."
  },
  {
    id: "step-8",
    title: "8. Scheduling & Publishing",
    description: "Automated distribution across LinkedIn, Instagram, and your Website. AI suggests optimal posting times with manual overrides available.",
    icon: CalendarClock,
    tags: ["Auto-Publish", "Optimal Timing", "Multi-Channel"],
    mockup: "Scheduled: Today at 2:00 PM EST"
  },
  {
    id: "step-9",
    title: "9. Analytics Dashboard",
    description: "Real-time performance tracking. Monitor impressions, engagement rates, and business growth insights from one unified command center.",
    icon: BarChart3,
    tags: ["Real-time Insights", "Engagement", "Growth Metrics"],
    mockup: "Engagement up 24% this week"
  }
];

export default function LandingPage() {
  const container = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    // Fade and slide in panels as they scroll
    panelsRef.current.forEach((panel) => {
      if (!panel) return;
      
      gsap.fromTo(panel, 
        { opacity: 0, y: 50 },
        {
          opacity: 1, 
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: panel,
            start: "top 75%", // triggers when top of panel hits 75% down viewport
            end: "top 25%",
            toggleActions: "play reverse play reverse",
          }
        }
      );
    });
  }, { scope: container });

  return (
    <div ref={container} suppressHydrationWarning className="relative bg-background text-foreground selection:bg-primary/20 selection:text-foreground overflow-x-hidden min-h-screen">
      
      {/* Top Background Animation */}
      <div className="absolute top-0 left-0 w-full h-screen pointer-events-none z-0">
        {/* Dark overlay to make text pop over the animation */}
        <div className="absolute inset-0 bg-background/80 lg:bg-gradient-to-r lg:from-background lg:via-background/90 lg:to-transparent z-10" />
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full z-20 flex items-center justify-center p-12">
          <DotLottieReact
            src="https://assets-v2.lottiefiles.com/a/20d7737c-118a-11ee-823e-077777312ecc/DkWplDfCus.lottie"
            loop
            autoplay
            className="w-full h-full max-w-[800px] object-contain"
          />
        </div>
      </div>

      {/* Navbar (Kept minimal for the story mode) */}
      <nav className="fixed top-0 w-full z-50 bg-background/50 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg flex items-center justify-center shadow-md">
              <img src="/logo-light.png" alt="ScalePods" className="h-5 object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors hidden sm:block pointer-events-auto">Log In</Link>
            <Link href="/signup" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:opacity-90 transition-opacity pointer-events-auto">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Overlay */}
      <main className="relative z-20 pt-32 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Hero Intro */}
          <div className="min-h-[70vh] flex flex-col justify-center max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6 border border-primary/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              The ScalePods Process
            </div>
            <h1 className="text-5xl md:text-7xl font-h1 font-black leading-[1.1] mb-6">
              Marketing Automation,<br/>
              <span className="text-primary">Fully Orchestrated.</span>
            </h1>
            <p className="text-xl text-muted-foreground font-medium mb-10 max-w-xl">
              From business analysis to strategy generation, content creation, design approval, and publishing—experience a seamless, AI-powered pipeline.
            </p>
            <p className="text-sm font-bold text-foreground flex items-center gap-2 animate-bounce">
              Scroll to explore the workflow <ArrowRight className="w-4 h-4 rotate-90" />
            </p>
          </div>

          {/* Workflow Steps Sequence */}
          <div className="mt-32 space-y-[40vh] pb-[20vh]">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.id} 
                  ref={(el) => {
                    if (el) panelsRef.current[index] = el;
                  }}
                  className="flex flex-col lg:flex-row gap-12 items-center lg:items-stretch min-h-[40vh]"
                >
                  {/* Text Content */}
                  <div className="flex-1 max-w-xl flex flex-col justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm border border-primary/20">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black font-h2 mb-4 text-foreground">{step.title}</h2>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                      {step.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* UI Mockup / Visualizer */}
                  <div className="flex-1 w-full max-w-md flex items-center justify-center">
                    <div className="w-full bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl relative overflow-hidden group hover:border-primary/50 transition-colors">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                      
                      <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                          <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{step.id}</span>
                      </div>

                      <div className="space-y-4">
                        <div className="h-4 w-1/3 bg-muted rounded-full"></div>
                        <div className="p-4 rounded-xl bg-secondary/50 border border-border font-mono text-sm text-foreground">
                          <span className="text-primary">&gt; </span>{step.mockup}
                          <span className="animate-pulse">_</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-6">
                          <div className="h-full bg-primary w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="min-h-[50vh] flex flex-col justify-center items-center text-center relative z-20 mt-[20vh] bg-card/50 backdrop-blur-xl border border-border rounded-[3rem] p-12 md:p-24 shadow-2xl">
            <h2 className="text-4xl md:text-6xl font-black font-h1 mb-6 text-foreground">Ready to automate?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
              Join the future of marketing ops. Orchestrate your entire funnel through a single, powerful platform.
            </p>
            <div className="flex gap-4 pointer-events-auto">
              <Link href="/signup" className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-2xl transition-all">
                Start Your Trial
              </Link>
              <Link href="/login" className="bg-secondary text-secondary-foreground border border-border px-8 py-4 rounded-xl font-bold hover:bg-secondary/80 transition-colors">
                Sign In
              </Link>
            </div>
          </div>

        </div>
      </main>
      
    </div>
  );
}
