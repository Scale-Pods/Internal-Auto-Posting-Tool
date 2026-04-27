"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import RadialPulseLoader from "@/components/RadialPulseLoader";

const DAY_ICONS: Record<string, string> = {
  monday: "🟢", tuesday: "🔵", wednesday: "🟣", thursday: "🟡", friday: "🔴", saturday: "⚪", sunday: "🟠",
};

const N8N_STRATEGY_URL = "https://n8n.srv1010832.hstgr.cloud/webhook/generate-strategy";

export default function StrategyReviewPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params?.id as string;

  const [client, setClient] = useState<any | null>(null);
  const [strategy, setStrategy] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Visual Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    async function fetchClientStrategy() {
      if (!clientId) return;
      try {
        const { data, error: dbError } = await supabase
          .from("clients")
          .select("*")
          .eq("id", clientId)
          .single();

        if (dbError) throw new Error(dbError.message);
        if (data) {
          setClient(data);
          let parsed = data.strategy_json;
          if (typeof parsed === "string") {
            try { parsed = JSON.parse(parsed); } catch (e) { }
          }
          setStrategy(parsed);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchClientStrategy();
  }, [clientId]);

  async function handleApprove() {
    if (!client) return;
    setIsProcessing(true);
    try {
      const { error: clientError } = await supabase
        .from('clients')
        .update({ status: 'Strategy Approved' })
        .eq('id', client.id);
        
      if (clientError) throw new Error(clientError.message);
      
      const specificPosts = strategy?.weekly_posts || strategy?.posts || strategy?.content_calendar || [];
      const insertPayload: any[] = [];
      
      if (Array.isArray(specificPosts) && specificPosts.length > 0) {
        specificPosts.forEach((post: any) => {
          insertPayload.push({
            client_id: client.id,
            task_name: post.topic || post.theme || "Design Task",
            post_type: post.post_type || post.type || "Post",
            platform: post.platform || "Instagram",
            topic: post.topic || post.theme || "General",
            status: 'Pending Content Approval'
          });
        });
      }

      if (insertPayload.length > 0) {
        const { error: insertError } = await supabase.from('content_deliverables').insert(insertPayload);
        if (insertError) console.error("Could not insert deliverables:", insertError.message);
      }

      alert("✅ Strategy Approved! Passed to Designers.");
      router.push("/clients");
    } catch (e: any) {
      alert("Error approving: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  }

  function getGoal(c: any) {
    return c["Goal"] || c["Goals"] || c["primary_goal"] || "";
  }

  async function submitFeedback() {
    if (!client || !feedbackText.trim()) return;
    setIsProcessing(true);
    console.log("[Reject] Starting strategy rework for", client["Business Name"]);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

    try {
      // 1. Update status in Supabase
      const { error: sbError } = await supabase
        .from('clients')
        .update({ client_feedback: feedbackText, status: 'Rework Required' })
        .eq('id', client.id);

      if (sbError) throw new Error("Supabase Error: " + sbError.message);

      // 2. Call n8n Webhook
      const res = await fetch(N8N_STRATEGY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: client["Business Name"] || "Client",
          industry_type: client["Business Type"] || "Marketing",
          business_description: client["Description"] || "",
          primary_goal: getGoal(client),
          target_audience: client["Target Audience"] || "",
          brand_tone: client["Tone"] || "",
          platforms: client["Platforms"] || "",
          posting_frequency: "Daily",
          client_feedback: feedbackText 
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`n8n Error (HTTP ${res.status})`);
      
      const raw = await res.text();
      console.log("[Reject] n8n Raw Response Received");

      let newStrategy;
      try {
        newStrategy = JSON.parse(raw);
        if (newStrategy && newStrategy.output && typeof newStrategy.output === 'string') {
           let cleanStr = newStrategy.output.replace(/```json/gi, '').replace(/```/gi, '').trim();
           try { newStrategy = JSON.parse(cleanStr); } catch (e) { }
        } else if (typeof newStrategy === 'string') {
           let cleanStr = newStrategy.replace(/```json/gi, '').replace(/```/gi, '').trim();
           try { newStrategy = JSON.parse(cleanStr); } catch (e) { }
        }
      } catch (e) {
         let cleanStr = raw.replace(/```json/gi, '').replace(/```/gi, '').trim();
         try { newStrategy = JSON.parse(cleanStr); } catch (e2) { newStrategy = { error: "Failed to parse", raw }; }
      }

      const hasRealData = newStrategy?.content_pillars || newStrategy?.pillars || newStrategy?.posting_schedule || newStrategy?.schedule;

      if (hasRealData && !newStrategy.error) {
          const { error: finalError } = await supabase
              .from('clients')
              .update({ strategy_json: newStrategy, status: 'Awaiting Strategy Review' })
              .eq('id', client.id);

          if (finalError) throw new Error("Supabase Update Error: " + finalError.message);

          setStrategy(newStrategy);
          setShowFeedbackBox(false);
          setFeedbackText("");
          alert("AI Successfully Updated Strategy Based on Your Feedback!");
      } else {
          alert("The AI Agent successfully returned, but it didn't use the structured format. Please check n8n Execution Logs to see what text it output.");
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        alert("The AI Agent is taking too long (over 2 minutes). It might still be working in the background—try refreshing the page in a moment.");
      } else {
        alert("Error during rework: " + err.message);
      }
    } finally {
      setIsProcessing(false);
      clearTimeout(timeoutId);
    }
  }

  function startEditing() {
    const normalized = {
      pillars: strategy?.content_pillars || strategy?.contentPillars || strategy?.pillars || [],
      schedule: strategy?.posting_schedule || strategy?.postingSchedule || strategy?.schedule || {},
      mix: strategy?.content_mix || strategy?.contentMix || strategy?.mix || {},
      framework: strategy?.caption_framework || strategy?.captionFramework || strategy?.framework || { hooks: [], ctas: [], hashtags: [] },
      posts: strategy?.weekly_posts || strategy?.weeklyPosts || strategy?.posts || strategy?.weeklyQueue || []
    };
    setEditData(JSON.parse(JSON.stringify(normalized))); // Deep clone it
    setShowFeedbackBox(false);
    setIsEditing(true);
  }

  async function saveManualEdit() {
    try {
      setIsProcessing(true);
      // Construct standardized strategy output so rendering handles it clean
      const finalStrategy = {
        content_pillars: editData.pillars,
        posting_schedule: editData.schedule,
        content_mix: editData.mix,
        caption_framework: {
            hooks: typeof editData.framework.hooks === 'string' ? editData.framework.hooks.split('\n').filter((x:any)=>x) : editData.framework.hooks,
            ctas: typeof editData.framework.ctas === 'string' ? editData.framework.ctas.split('\n').filter((x:any)=>x) : editData.framework.ctas,
            hashtags: typeof editData.framework.hashtags === 'string' ? editData.framework.hashtags.split('\n').filter((x:any)=>x) : editData.framework.hashtags,
        },
        weekly_posts: editData.posts
      };

      await supabase
        .from('clients')
        .update({ strategy_json: finalStrategy })
        .eq('id', client.id);
      
      setStrategy(finalStrategy);
      setIsEditing(false);
    } catch (e: any) {
      alert("Error saving your edits!");
    } finally {
      setIsProcessing(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0a0a0a]">
         <RadialPulseLoader size={180} color="#b19cd9" text="INITIALIZING BOARD" />
      </div>
    </div>
  );
  if (error || !client) return <div className="p-8 text-red-500">Error: {error || "Client not found"}</div>;

  const pillars = strategy?.content_pillars || strategy?.contentPillars || strategy?.pillars;
  const schedule = strategy?.posting_schedule || strategy?.postingSchedule || strategy?.schedule;
  const mix = strategy?.content_mix || strategy?.contentMix || strategy?.mix;
  const framework = strategy?.caption_framework || strategy?.captionFramework || strategy?.framework;
  const posts = strategy?.weekly_posts || strategy?.weeklyPosts || strategy?.posts || strategy?.weeklyQueue;
  const hasStandardFields = pillars || schedule || mix || framework || posts;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans selection:bg-sp-primary/30 antialiased overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col max-h-screen overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between p-6 bg-surface-container-low/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
            <div>
              <h1 className="text-2xl font-[900] text-white tracking-tight flex items-center gap-3">
                <button onClick={() => router.push('/clients')} className="hover:bg-white/10 p-2 rounded-full transition-all">
                  <span className="material-symbols-outlined text-white">arrow_back</span>
                </button>
                Strategy Board
              </h1>
              <p className="text-on-surface-variant text-sm mt-1 ml-12">Reviewing marketing strategy for <span className="text-sp-primary font-bold">{client.business_name}</span></p>
            </div>
            
            {/* Master Action Bar */}
            <div className="flex items-center gap-3">
              {isEditing ? (
                 <>
                   <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 rounded-full bg-white/5 text-gray-400 font-bold hover:bg-white/10 hover:text-white transition-all">Cancel Edits</button>
                   <button disabled={isProcessing} onClick={saveManualEdit} className="px-8 py-2.5 rounded-full bg-sp-primary text-black font-[900] hover:shadow-[0_0_20px_rgba(192,193,255,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50">
                     <span className="material-symbols-outlined text-sm">save</span>
                     {isProcessing ? "Saving..." : "Save Strategy"}
                   </button>
                 </>
              ) : (
                <>
                  <button 
                    onClick={() => setShowFeedbackBox(!showFeedbackBox)}
                    className="px-6 py-2.5 rounded-full bg-sp-error/10 text-sp-error font-bold border border-sp-error/20 hover:bg-sp-error/20 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">cancel</span>
                    Reject
                  </button>
                  <button 
                    onClick={startEditing}
                    className="px-6 py-2.5 rounded-full bg-white/10 text-white font-bold border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2 shadow-lg"
                  >
                    <span className="material-symbols-outlined text-sm">view_quilt</span>
                    Edit Content
                  </button>
                  <button 
                    onClick={handleApprove}
                    className="px-8 py-2.5 rounded-full bg-sp-primary text-on-primary font-[900] hover:shadow-[0_0_20px_rgba(192,193,255,0.4)] hover:scale-[1.02] transition-all flex items-center gap-2 shadow-xl"
                  >
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Approve Strategy
                  </button>
                </>
              )}
            </div>
        </header>

        {isProcessing && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
             <RadialPulseLoader size={200} color="#ff8a8a" text="AI AGENT IS RUNNING..." />
          </div>
        )}

        <main className="relative p-8 pb-32 max-w-7xl mx-auto w-full space-y-8">
          
          {showFeedbackBox && !isEditing && (
             <div className="bg-surface-container-high border border-sp-error/20 rounded-2xl p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300 shadow-[0_0_50px_rgba(255,138,138,0.1)]">
                <h4 className="text-sp-error font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined">feedback</span>
                  Reject & Rework Strategy
                </h4>
                <p className="text-sm text-on-surface-variant mb-4">Add a comment explaining what improvements are needed. The AI Agent will completely rewrite the strategy based on your feedback.</p>
                <textarea
                  className="w-full bg-[#1a0a0a] border border-[#ff8a8a]/20 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-[#ff8a8a]/50 focus:border-transparent outline-none transition-all resize-none h-32"
                  placeholder="e.g., 'Make the brand tone more aggressive', 'Focus mostly on LinkedIn strategies', or 'The target audience needs to be older...'"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setShowFeedbackBox(false)} className="px-5 py-2 rounded-lg text-white font-bold hover:bg-white/5 transition-all">Cancel</button>
                  <button disabled={isProcessing} onClick={submitFeedback} className="px-6 py-2 rounded-lg bg-sp-error text-on-primary font-[900] hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50">
                    {isProcessing ? "Processing Webhook..." : "Regenerate Strategy"}
                  </button>
                </div>
             </div>
          )}

          {!hasStandardFields && !isEditing && (
             <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-center mt-20">
               <span className="material-symbols-outlined justify-center text-4xl text-sp-primary mb-4 opacity-50 block">data_object</span>
               <h3 className="text-xl font-bold text-white mb-2">Non-standard AI Format</h3>
               <p className="text-gray-400 max-w-lg mx-auto mb-6">The AI returned a custom response. Click "Edit Content" above to convert it into the structured format, or "AI Rework" to ask it to generate standard output.</p>
             </div>
          )}

          {isEditing ? (
            /* --- THE NEW VISUAL FORM EDITOR --- */
            <div className="space-y-12 animate-in fade-in zoom-in-95 duration-300">
               <div className="bg-sp-primary/10 border border-sp-primary/20 rounded-2xl p-8 text-center text-sp-primary">
                  <span className="material-symbols-outlined text-4xl mb-2">design_services</span>
                  <h2 className="text-2xl font-[900]">Visual Strategy Editor</h2>
                  <p className="text-sp-primary/70">Modify the blocks below and hit Save Strategy when you're done.</p>
               </div>

               {/* Pillars Editor */}
               <section>
                 <h2 className="text-xl font-bold text-white mb-4">Content Pillars</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {editData?.pillars?.map((p: any, i: number) => (
                      <div key={i} className="bg-[#111] border border-white/10 p-5 rounded-2xl group flex flex-col gap-3 relative">
                        <button 
                          onClick={() => { const nd = {...editData}; nd.pillars.splice(i, 1); setEditData(nd); }}
                          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold shadow-lg"
                        >✕</button>
                        <div className="flex gap-4">
                           <input type="text" placeholder="Pillar Name" className="flex-1 bg-black border border-white/10 rounded-lg p-3 text-white font-bold focus:ring-2 focus:ring-sp-primary/50 outline-none" value={p.name} onChange={e => { const nd = {...editData}; nd.pillars[i].name = e.target.value; setEditData(nd); }} />
                           <div className="flex items-center gap-2 bg-black border border-white/10 rounded-lg pr-3">
                             <input type="number" min="0" max="100" className="w-16 bg-transparent p-3 text-sp-primary font-bold text-center outline-none" value={p.percentage || 0} onChange={e => { const nd = {...editData}; nd.pillars[i].percentage = e.target.value; setEditData(nd); }} />
                             <span className="text-gray-500 font-bold">%</span>
                           </div>
                        </div>
                        <textarea placeholder="Pillar Description" className="w-full bg-black border border-white/10 rounded-lg p-3 text-gray-300 text-sm h-24 resize-none focus:ring-2 focus:ring-sp-primary/50 outline-none" value={p.description} onChange={e => { const nd = {...editData}; nd.pillars[i].description = e.target.value; setEditData(nd); }} />
                      </div>
                    ))}
                 </div>
                 <button onClick={() => { const nd = {...editData}; nd.pillars.push({ name: '', description: '', percentage: 10 }); setEditData(nd); }} className="mt-4 px-5 py-2.5 border border-dashed border-white/20 rounded-xl text-gray-400 font-bold hover:bg-white/5 hover:text-white transition-all w-full md:w-auto">+ Add New Pillar</button>
               </section>

               {/* Schedule Editor */}
               <section>
                 <h2 className="text-xl font-bold text-white mb-4">Weekly Schedule</h2>
                 <div className="bg-[#111] border border-white/10 rounded-2xl p-5 overflow-hidden">
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                      {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                        <div key={day} className="flex flex-col bg-black rounded-xl border border-white/5 p-3">
                           <span className="text-xs font-[900] text-gray-500 uppercase tracking-widest block mb-2 text-center">{day.slice(0,3)}</span>
                           <input type="text" placeholder="e.g. Reel" className="w-full bg-transparent text-white text-center font-bold outline-none border-b border-white/10 focus:border-sp-primary focus:text-sp-primary transition-all pb-1" value={editData?.schedule[day] || ''} onChange={e => { const nd = {...editData}; nd.schedule[day] = e.target.value; setEditData(nd); }} />
                        </div>
                      ))}
                    </div>
                 </div>
               </section>

               {/* Copywriting Framework Editor */}
               <section>
                 <h2 className="text-xl font-bold text-white mb-4">Frameworks</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#111] p-5 rounded-2xl border-t-2 border-t-sp-primary">
                       <h4 className="text-sp-primary font-[900] text-xs uppercase mb-3 tracking-widest">Hooks (One per line)</h4>
                       <textarea className="w-full h-48 bg-black border border-white/10 rounded-xl p-3 text-sm text-gray-300 font-mono outline-none focus:ring-1 focus:ring-sp-primary resize-none" value={Array.isArray(editData.framework?.hooks) ? editData.framework.hooks.join('\n') : (editData.framework?.hooks || '')} onChange={e => { const nd = {...editData}; nd.framework.hooks = e.target.value; setEditData(nd); }} />
                    </div>
                    <div className="bg-[#111] p-5 rounded-2xl border-t-2 border-t-sp-secondary">
                       <h4 className="text-sp-secondary font-[900] text-xs uppercase mb-3 tracking-widest">CTAs (One per line)</h4>
                       <textarea className="w-full h-48 bg-black border border-white/10 rounded-xl p-3 text-sm text-gray-300 font-mono outline-none focus:ring-1 focus:ring-sp-secondary resize-none" value={Array.isArray(editData.framework?.ctas) ? editData.framework.ctas.join('\n') : (editData.framework?.ctas || '')} onChange={e => { const nd = {...editData}; nd.framework.ctas = e.target.value; setEditData(nd); }} />
                    </div>
                    <div className="bg-[#111] p-5 rounded-2xl border-t-2 border-t-sp-tertiary">
                       <h4 className="text-sp-tertiary font-[900] text-xs uppercase mb-3 tracking-widest">Hashtags (One per line)</h4>
                       <textarea className="w-full h-48 bg-black border border-white/10 rounded-xl p-3 text-sm text-gray-300 font-mono outline-none focus:ring-1 focus:ring-sp-tertiary resize-none" value={Array.isArray(editData.framework?.hashtags) ? editData.framework.hashtags.join('\n') : (editData.framework?.hashtags || '')} onChange={e => { const nd = {...editData}; nd.framework.hashtags = e.target.value; setEditData(nd); }} />
                    </div>
                 </div>
               </section>

               {/* Specific Posts Editor */}
               <section>
                 <h2 className="text-xl font-bold text-white mb-4">Specific Deliverables (Posts)</h2>
                 <div className="space-y-4">
                    {editData?.posts?.map((post: any, i: number) => (
                      <div key={i} className="bg-[#111] border border-white/10 p-5 rounded-2xl group flex flex-col gap-4 relative">
                        <button 
                          onClick={() => { const nd = {...editData}; nd.posts.splice(i, 1); setEditData(nd); }}
                          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black border border-white/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center font-bold"
                        >✕</button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mr-10">
                           <div className="col-span-1 md:col-span-3">
                             <label className="text-xs font-bold text-gray-500 mb-1 block">Topic / Theme</label>
                             <input type="text" className="w-full bg-black border border-white/10 rounded-lg p-3 text-white font-bold focus:ring-2 focus:ring-sp-primary/50 outline-none" value={post.topic || post.theme || ''} onChange={e => { const nd = {...editData}; nd.posts[i].topic = e.target.value; setEditData(nd); }} />
                           </div>
                           <div>
                             <label className="text-xs font-bold text-gray-500 mb-1 block">Platform</label>
                             <input type="text" className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-sp-primary/50 outline-none" value={post.platform || ''} onChange={e => { const nd = {...editData}; nd.posts[i].platform = e.target.value; setEditData(nd); }} />
                           </div>
                           <div>
                             <label className="text-xs font-bold text-gray-500 mb-1 block">Post Type</label>
                             <input type="text" className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-sp-primary/50 outline-none" value={post.post_type || post.type || ''} onChange={e => { const nd = {...editData}; nd.posts[i].post_type = e.target.value; setEditData(nd); }} />
                           </div>
                        </div>
                      </div>
                    ))}
                 </div>
                 <button onClick={() => { const nd = {...editData}; nd.posts.push({ topic: '', platform: '', post_type: '' }); setEditData(nd); }} className="mt-4 px-5 py-2.5 border border-dashed border-white/20 rounded-xl text-gray-400 font-bold hover:bg-white/5 hover:text-white transition-all w-full md:w-auto">+ Add New Deliverable</button>
               </section>
            </div>
          ) : (
            /* --- ORIGINAL BEAUTIFUL READ-ONLY VIEW --- */
            <div className={`space-y-12 transition-all duration-500 ${showFeedbackBox ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
                 {/* Pillars */}
                 {pillars && pillars.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-xl bg-sp-primary/10 flex items-center justify-center border border-sp-primary/20">
                        <span className="material-symbols-outlined text-sp-primary">category</span>
                      </div>
                      <h2 className="text-2xl font-[900] text-white">Content Pillars</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                      {pillars.map((pillar: any, i: number) => (
                        <div key={i} className="bg-surface-container-low p-6 rounded-2xl border border-white/5 flex flex-col h-full hover:-translate-y-1 transition-all duration-300">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-white font-[800] text-lg">{pillar.name}</h3>
                            <span className="px-3 py-1 rounded-full bg-sp-primary/10 text-sp-primary font-[900] text-sm border border-sp-primary/20">{pillar.percentage}%</span>
                          </div>
                          <p className="text-on-surface-variant text-sm leading-relaxed flex-1">{pillar.description}</p>
                          <div className="mt-6 h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-sp-primary rounded-full" style={{ width: `${pillar.percentage}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                 )}

                 {/* Schedule & Mix Row */}
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Schedule */}
                    {schedule && Object.keys(schedule).length > 0 && (
                      <section className="col-span-2">
                         <div className="flex items-center gap-3 mb-6">
                          <div className="h-10 w-10 rounded-xl bg-sp-secondary/10 flex items-center justify-center border border-sp-secondary/20">
                            <span className="material-symbols-outlined text-sp-secondary">calendar_view_week</span>
                          </div>
                          <h2 className="text-2xl font-[900] text-white">Publishing Schedule</h2>
                        </div>
                        <div className="bg-surface-container-low p-4 rounded-2xl border border-white/5">
                           <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                             {Object.entries(schedule).map(([day, type]) => (
                               <div key={day} className="bg-surface-container-high flex flex-col items-start p-4 transition-all hover:bg-white/5 rounded-xl border border-white/5 shadow-sm">
                                 <div className="flex items-center gap-2 mb-3">
                                   <span className="text-xl">{DAY_ICONS[day.toLowerCase()] || "📅"}</span>
                                   <span className="text-[#a5a5a5] text-[11px] font-[900] uppercase tracking-widest">{day.slice(0, 3)}</span>
                                 </div>
                                 <span className="text-white text-sm font-bold leading-relaxed">{String(type)}</span>
                               </div>
                             ))}
                           </div>
                        </div>
                      </section>
                    )}

                    {/* Mix */}
                    {mix && Object.keys(mix).length > 0 && (
                      <section className="col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-10 w-10 rounded-xl bg-sp-tertiary/10 flex items-center justify-center border border-sp-tertiary/20">
                            <span className="material-symbols-outlined text-sp-tertiary">pie_chart</span>
                          </div>
                          <h2 className="text-2xl font-[900] text-white">Format Mix</h2>
                        </div>
                        <div className="flex flex-col gap-3">
                           {Object.entries(mix).map(([type, pct], i) => (
                             <div key={type} className="bg-surface-container-low p-4 rounded-xl border border-white/5 flex items-center justify-between">
                               <span className="text-white font-bold capitalize">{type}</span>
                               <div className="flex items-center gap-4 w-1/2">
                                 <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                                    <div className="h-full bg-sp-tertiary rounded-full" style={{ width: `${pct}%`}}></div>
                                 </div>
                                 <span className="text-sp-tertiary font-[900] text-sm w-8">{String(pct)}%</span>
                               </div>
                             </div>
                           ))}
                        </div>
                      </section>
                    )}
                 </div>

                 {/* Caption Framework */}
                 {framework && (
                  <section>
                     <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-xl bg-sp-primary/10 flex items-center justify-center border border-sp-primary/20">
                        <span className="material-symbols-outlined text-sp-primary">auto_fix_high</span>
                      </div>
                      <h2 className="text-2xl font-[900] text-white">Copywriting Framework</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="bg-[#1c1b22] border-t-2 border-t-sp-primary rounded-xl p-6 shadow-lg">
                         <h4 className="text-sp-primary font-[900] tracking-widest text-xs uppercase mb-4">Magnetic Hooks</h4>
                         <ul className="space-y-4">
                           {(framework.hooks||[]).map((t: string, i: number) => (
                             <li key={i} className="text-gray-300 text-sm leading-relaxed border-l-2 border-sp-primary/30 pl-3">{t}</li>
                           ))}
                         </ul>
                       </div>
                       <div className="bg-[#1b1c22] border-t-2 border-t-sp-secondary rounded-xl p-6 shadow-lg">
                         <h4 className="text-sp-secondary font-[900] tracking-widest text-xs uppercase mb-4">Action Calls (CTA)</h4>
                         <ul className="space-y-4">
                           {(framework.ctas||[]).map((t: string, i: number) => (
                             <li key={i} className="text-gray-300 text-sm leading-relaxed border-l-2 border-sp-secondary/30 pl-3">{t}</li>
                           ))}
                         </ul>
                       </div>
                       <div className="bg-[#221c22] border-t-2 border-t-sp-tertiary rounded-xl p-6 shadow-lg">
                         <h4 className="text-sp-tertiary font-[900] tracking-widest text-xs uppercase mb-4">Growth Hashtags</h4>
                         <div className="flex flex-wrap gap-2">
                           {(framework.hashtags||[]).map((t: string, i: number) => (
                             <span key={i} className="px-3 py-1.5 bg-sp-tertiary/10 text-sp-tertiary text-xs font-bold rounded-lg border border-sp-tertiary/20">{t}</span>
                           ))}
                         </div>
                       </div>
                    </div>
                  </section>
                 )}

                 {/* Specific Posts */}
                 {posts && posts.length > 0 && (
                   <section className="pt-8 border-t border-white/5">
                     <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <span className="material-symbols-outlined text-orange-500">list_alt</span>
                          </div>
                          <h2 className="text-2xl font-[900] text-white">Specific Deliverables</h2>
                       </div>
                       <span className="px-4 py-1.5 bg-surface-container-high text-white font-bold rounded-full text-sm">{posts.length} Items</span>
                     </div>

                     <div className="space-y-4">
                       {posts.map((post: any, i: number) => (
                         <div key={i} className="bg-surface-container-low border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row gap-6 hover:bg-surface-container-high transition-all group">
                            <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#111] flex hidden md:flex items-center justify-center border border-white/5 text-2xl font-[900] text-gray-500 group-hover:text-sp-primary group-hover:bg-sp-primary/10 transition-all">
                              {i + 1}
                            </div>
                            <div className="flex-1">
                               <h4 className="text-lg font-bold text-white mb-2">{post.topic || post.theme || "Marketing Deliverable"}</h4>
                               <div className="flex gap-2 mb-4 text-xs font-bold">
                                 <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-gray-300">{(post.post_type || post.type || "Post")}</span>
                                 <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-gray-300">{post.platform}</span>
                               </div>
                               
                               {/* Variants */}
                               {post.variants && typeof post.variants === 'object' && (
                                 <div className="space-y-3 mt-4">
                                    {Object.entries(post.variants).map(([plat, dat]: [string, any]) => (
                                      <div key={plat} className="bg-surface-container-highest p-4 rounded-xl border border-white/5">
                                        <span className="text-[10px] font-[900] text-gray-500 uppercase tracking-widest block mb-2">{plat}</span>
                                        {dat?.caption && <p className="text-sm text-gray-300 mb-2"><strong className="text-sp-primary">Caption:</strong> {dat.caption}</p>}
                                        {dat?.visual && <p className="text-sm text-gray-300"><strong className="text-sp-secondary">Asset Needs:</strong> {dat.visual}</p>}
                                        {dat?.article_snippet && <p className="text-sm text-gray-300"><strong className="text-sp-tertiary">Article:</strong> {dat.article_snippet}</p>}
                                      </div>
                                    ))}
                                 </div>
                               )}
                            </div>
                         </div>
                       ))}
                     </div>
                   </section>
                 )}

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
