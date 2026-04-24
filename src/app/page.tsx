"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F0] to-white font-body-base text-on-surface selection:bg-primary-container selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-primary-container material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
            <span className="font-h1 font-black text-xl text-slate-900 tracking-tight">FlowPilot AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="#features" className="hover:text-primary-container transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-primary-container transition-colors">Solutions</Link>
            <Link href="#pricing" className="hover:text-primary-container transition-colors">Pricing</Link>
            <Link href="#resources" className="hover:text-primary-container transition-colors">Resources</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors hidden sm:block">Log In</Link>
            <Link href="/signup" className="bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <div className="bg-primary-container/10 text-primary-container border border-primary-container/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            Powered by AI
          </div>
          
          <h1 className="text-5xl md:text-7xl font-h1 font-black text-slate-900 tracking-tight leading-[1.1] mb-6 max-w-4xl">
            Automate your marketing, <span className="text-primary-container">Grow faster.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            FlowPilot AI helps you run campaigns, build workflows, generate content and make smarter decisions with real-time insights.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/signup" className="w-full sm:w-auto bg-primary-container text-white px-8 py-4 rounded-xl text-base font-bold shadow-xl shadow-primary-container/20 hover:shadow-2xl hover:shadow-primary-container/30 hover:-translate-y-1 transition-all">
              Get Started
            </Link>
            <button className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl text-base font-bold shadow-sm hover:bg-slate-50 transition-colors">
              Book a Call
            </button>
          </div>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 relative mx-auto max-w-5xl"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary-container/20 to-transparent blur-3xl -z-10 rounded-[3rem]"></div>
          <div className="bg-[#1C2331] rounded-[2rem] p-4 shadow-2xl border border-white/10 relative overflow-hidden">
            {/* Top Bar of Mockup */}
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-3 h-3 rounded-full bg-slate-600/50"></div>
              <div className="w-3 h-3 rounded-full bg-slate-600/50"></div>
              <div className="w-3 h-3 rounded-full bg-slate-600/50"></div>
            </div>
            
            {/* Inner App Mockup */}
            <div className="bg-[#151B26] rounded-xl border border-white/5 p-6 md:p-10 flex flex-col items-center">
               <div className="w-full max-w-2xl bg-[#1E2532] rounded-xl border border-white/10 p-6 shadow-lg">
                 <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                   <h3 className="text-white font-bold text-xl">FlowPilot AI</h3>
                   <span className="material-symbols-outlined text-white/50">more_horiz</span>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex justify-between text-white/40 text-xs font-bold uppercase tracking-wider mb-2">
                      <span>Campaign Performance</span>
                      <span className="material-symbols-outlined text-[14px]">search</span>
                    </div>
                    
                    {/* Mock Graph Lines */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <span className="text-white/60 text-xs w-20">Click Rate</span>
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="w-[65%] h-full bg-blue-500 rounded-full"></div>
                        </div>
                        <span className="text-white font-mono text-xs">65%</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-white/60 text-xs w-20">Conversions</span>
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="w-[42%] h-full bg-green-400 rounded-full"></div>
                        </div>
                        <span className="text-white font-mono text-xs">42%</span>
                      </div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trusted By */}
      <section className="py-10 border-y border-slate-200/50 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Trusted by 10,000+ forward-thinking teams</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale">
            {['STRIPE', 'NOTION', 'VERCEL', 'LINEAR', 'FIGMA'].map((brand) => (
              <span key={brand} className="text-xl md:text-2xl font-black tracking-tighter font-h1">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 font-h2 mb-4">Powerful tools for high-velocity teams</h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">Everything you need to orchestrate complex marketing funnels without a single line of code.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Create campaigns instantly",
              desc: "AI suggests ready-to-launch email and SMS campaigns tailored to your audience's unique behavior patterns.",
              icon: "magic_button",
              color: "text-primary-container",
              bg: "bg-primary-container/10"
            },
            {
              title: "Automate your workflow",
              desc: "Build smart flows with behavioral triggers. Connect your stack and let FlowPilot handle the repetitive heavy lifting.",
              icon: "account_tree",
              color: "text-blue-600",
              bg: "bg-blue-50"
            },
            {
              title: "Track performance",
              desc: "Real-time insights and deep-funnel reports. Know exactly where your revenue is coming from at any second.",
              icon: "monitoring",
              color: "text-green-600",
              bg: "bg-green-50"
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-6`}>
                <span className={`material-symbols-outlined ${feature.color}`}>{feature.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Unified Data Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 font-h2 mb-6 leading-tight">Unified data,<br/>smarter actions.</h2>
            <p className="text-slate-600 text-lg mb-10 leading-relaxed">Stop jumping between tabs. FlowPilot aggregates data from your entire ecosystem to provide one single source of truth for your growth team.</p>
            
            {/* Testimonial Card */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
              <div className="flex gap-1 mb-4 text-orange-400">
                {[1,2,3,4,5].map(star => <span key={star} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>)}
              </div>
              <p className="text-slate-700 italic font-medium mb-6">"FlowPilot completely transformed our marketing ops. We went from manual spreadsheets to 100% automated growth loops in just 2 weeks."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-300"></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Sarah Jenkins</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Director of Growth at TechFlow</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"></div>
            <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-2 md:p-6 rounded-3xl shadow-2xl relative overflow-hidden">
               <div className="bg-[#0f172a]/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                 <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                   <span className="material-symbols-outlined text-teal-300">analytics</span>
                   Advanced Analytics Mockup
                 </h4>
                 <div className="h-40 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                   <div className="flex items-end gap-2 h-24">
                     {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                       <div key={i} className="w-8 bg-teal-400/80 rounded-t-sm" style={{ height: `${h}%` }}></div>
                     ))}
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-[#FFF5F0] -z-10"></div>
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-orange-50 to-orange-100 rounded-[2rem] p-12 md:p-20 text-center border border-orange-200/50 shadow-xl">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 font-h1 mb-6">Ready to automate your marketing?</h2>
          <p className="text-slate-600 font-medium text-lg mb-10 max-w-2xl mx-auto">Join 10,000+ teams growing faster with AI. Start your 14-day free trial today. No credit card required.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto bg-primary-container text-white px-8 py-4 rounded-xl text-base font-bold shadow-xl shadow-primary-container/20 hover:shadow-2xl hover:-translate-y-1 transition-all">
              Get Started for Free
            </Link>
            <button className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl text-base font-bold shadow-sm hover:bg-slate-50 transition-colors">
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-primary-container material-symbols-outlined">rocket_launch</span>
                <span className="font-h1 font-black text-lg text-slate-900">FlowPilot AI</span>
              </div>
              <p className="text-slate-500 text-sm mb-6 max-w-xs">Precision-engineered automation for the modern marketing professional.</p>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"><span className="material-symbols-outlined text-[16px]">language</span></div>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"><span className="material-symbols-outlined text-[16px]">group</span></div>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"><span className="material-symbols-outlined text-[16px]">mail</span></div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-primary-container transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-primary-container transition-colors">Integrations</Link></li>
                <li><Link href="#" className="hover:text-primary-container transition-colors">Solutions</Link></li>
                <li><Link href="#" className="hover:text-primary-container transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-primary-container transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary-container transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary-container transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary-container transition-colors">News</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-primary-container transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-primary-container transition-colors">API Docs</Link></li>
                <li><Link href="#" className="hover:text-primary-container transition-colors">Community</Link></li>
                <li><Link href="#" className="hover:text-primary-container transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-400">
            <p>© 2026 FlowPilot AI, Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-slate-600">Privacy Policy</Link>
              <Link href="#" className="hover:text-slate-600">Terms of Service</Link>
              <Link href="#" className="hover:text-slate-600">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
