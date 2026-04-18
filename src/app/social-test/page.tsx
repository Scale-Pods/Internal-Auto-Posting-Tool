"use client";

import ScalePodsSocialFeed from "../../components/ScalePodsSocialFeed";
import { useState } from "react";

export default function SocialTestPage() {
  const [currentView, setCurrentView] = useState("feed");

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8 text-white relative">
        
       <div className="absolute top-4 right-4 bg-sp-primary text-black font-bold px-3 py-1 rounded text-xs z-50">
           LOCALHOST TESTING MODE
       </div>

      {currentView === "feed" ? (
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Social Feed (Preview)</h1>
          <ScalePodsSocialFeed 
            supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL} 
            supabaseAnonKey={process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY} 
          />
        </div>
      ) : (
         <div className="max-w-3xl mx-auto">
           <button onClick={() => setCurrentView("feed")} className="text-sp-primary mb-4 block font-bold">← Back to Feed Preview</button>
           <h1 className="text-xl font-bold mb-8 text-gray-500">Detail Page Simulation (Requires setting a slug in the Code Component manually, skipped for now to focus on the grid)</h1>
         </div>
      )}
    </div>
  );
}
