"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import RadialPulseLoader from "@/components/RadialPulseLoader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const N8N_STRATEGY_URL = "https://n8n.srv1010832.hstgr.cloud/webhook/generate-strategy";

interface Client {
  "Business Name"?: string;
  "Business Type"?: string;
  "Description"?: string;
  "Target Audience"?: string;
  "Platforms"?: string;
  "Goal"?: string;
  "Goals"?: string;
  "Tone"?: string;
  "Strategy JSON"?: string;
  "status"?: string;
  "client_feedback"?: string;
  [key: string]: string | undefined;
}

interface Strategy {
  content_pillars?: { name: string; percentage: number; description: string }[];
  posting_schedule?: Record<string, string>;
  content_mix?: Record<string, number>;
  caption_framework?: { hooks?: string[]; ctas?: string[]; hashtags?: string[] };
  weekly_posts?: { topic: string; variants: Record<string, Record<string, string>> }[];
  [key: string]: any;
}

function getGoal(c: Client): string {
  return c.Goal || c.Goals || "";
}

const GOAL_COLORS: Record<string, string> = {
  Sales: "bg-sp-primary/10 text-sp-primary border-sp-primary/20",
  "Brand Awareness": "bg-sp-tertiary/10 text-sp-tertiary border-sp-tertiary/20",
  "Lead Generation": "bg-sp-secondary/10 text-sp-secondary border-sp-secondary/20",
  "Customer Education": "bg-primary-container/10 text-primary-container border-primary-container/20",
};

const TONE_COLORS: Record<string, string> = {
  Premium: "bg-sp-tertiary/10 text-sp-tertiary border-sp-tertiary/20",
  Casual: "bg-sp-secondary/10 text-sp-secondary border-sp-secondary/20",
  Bold: "bg-sp-error/10 text-sp-error border-sp-error/20",
  Innovative: "bg-sp-primary/10 text-sp-primary border-sp-primary/20",
};

const AVATAR_COLORS = [
  "bg-sp-primary/10 text-sp-primary border-sp-primary/20",
  "bg-sp-secondary/10 text-sp-secondary border-sp-secondary/20",
  "bg-sp-tertiary/10 text-sp-tertiary border-sp-tertiary/20",
];

const DAY_ICONS: Record<string, string> = {
  monday: "🟢", tuesday: "🔵", wednesday: "🟣", thursday: "🟡", friday: "🔴", saturday: "⚪", sunday: "🟠",
};

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Strategy state
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [strategyClient, setStrategyClient] = useState<Client | null>(null);
  const [strategyError, setStrategyError] = useState<string | null>(null);

  // View client detail
  const [viewClient, setViewClient] = useState<Client | null>(null);

  // Deletion state
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Strategy approval state
  const [isEditingStrategy, setIsEditingStrategy] = useState(false);
  const [editedStrategy, setEditedStrategy] = useState<string>("");

  // Dropdown menu
  const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
      
      if (dbError) throw new Error(dbError.message);
      
      if (!data) {
        setClients([]);
        return;
      }
      
      const rows: Client[] = data.map((row: any) => ({
        "Business Name": row.business_name,
        "Business Type": row.industry_type,
        "Description": row.business_description,
        "Target Audience": row.target_audience,
        "Platforms": row.platforms,
        "Goal": row.primary_goal,
        "Tone": row.brand_tone,
        "Strategy JSON": row.strategy_json ? JSON.stringify(row.strategy_json) : undefined,
        "status": row.status || 'Awaiting Strategy',
        "client_feedback": row.client_feedback || '',
        "created_at": row.created_at,
        "id": row.id
      }));

      setClients(rows);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown");
    } finally {
      setLoading(false);
    }
  }

  async function generateStrategy(client: Client) {
    const name = client["Business Name"] || "Unknown";
    setGeneratingFor(name);
    setStrategy(null);
    setStrategyClient(client);
    setStrategyError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

    try {
      const res = await fetch(N8N_STRATEGY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: client["Business Name"] || "Client",
          industry_type: client["Business Type"] || "Marketing",
          business_description: client["Description"] || "",
          primary_goal: getGoal(client),
          target_audience: client["Target Audience"] || "",
          brand_tone: client["Tone"] || "Professional",
          platforms: client["Platforms"] || "General",
          posting_frequency: "Daily",
          client_feedback: client["client_feedback"] || "" // PASSING FEEDBACK BACK TO AI
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`n8n Error (HTTP ${res.status}): ${errText.slice(0, 100)}`);
      }

      const raw = await res.text();
      console.log("[Strategy Raw Response]", raw);

      if (!raw || raw.trim() === "") {
        throw new Error("n8n returned an empty response. This often happens if the connection times out.");
      }

      let parsed: any;
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        if (raw.includes("<!DOCTYPE html>") || raw.includes("<html>")) {
          throw new Error("n8n returned an HTML error page instead of JSON.");
        }
        throw new Error(`Invalid response from n8n: ${raw.slice(0, 150)}...`);
      }

      // n8n can wrap in array or send direct
      let unwrapped: Record<string, unknown> = parsed as Record<string, unknown>;
      if (Array.isArray(parsed)) {
        const first = parsed[0];
        unwrapped = first?.json || first || {};
      }

      let foundStrategy: any = null;

      if (unwrapped.strategy && typeof unwrapped.strategy === "object") {
        foundStrategy = unwrapped.strategy;
      } else if (unwrapped.output && typeof unwrapped.output === "string") {
        try {
          const cleaned = unwrapped.output.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();
          foundStrategy = JSON.parse(cleaned);
        } catch { /* skip */ }
      } else if (unwrapped.content_pillars || unwrapped.posting_schedule) {
        foundStrategy = unwrapped;
      }
      
      // Additional fallback if n8n strictly returned raw text
      if (!foundStrategy && typeof raw === 'string') {
        try {
           const cleaned = raw.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();
           const rawJSON = JSON.parse(cleaned);
           if (rawJSON.content_pillars || rawJSON.posting_schedule) foundStrategy = rawJSON;
           else if (rawJSON.output) foundStrategy = JSON.parse(rawJSON.output.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim());
        } catch(e) {}
      }

      let hasRealData = false;
      if (foundStrategy) {
         if (Array.isArray(foundStrategy.content_pillars) && foundStrategy.content_pillars.length > 0) hasRealData = true;
         else if (foundStrategy.posting_schedule && Object.values(foundStrategy.posting_schedule).some((x: any) => typeof x === 'string' && x.length > 2)) hasRealData = true;
      }

      if (foundStrategy && hasRealData) {
        setStrategy(foundStrategy);
        
        // Save back to Supabase and reset status to Awaiting Review
        await supabase
          .from('clients')
          .update({ 
            strategy_json: foundStrategy,
            status: 'Awaiting Strategy Review' 
          })
          .eq('business_name', client["Business Name"] || client["business_name"]);

        // Update local client state so 'View Strategy' works
        setClients(prev => prev.map(c => {
          const cName = c["Business Name"] || c["business_name"];
          const tName = client["Business Name"] || client["business_name"];
          if (cName === tName) {
            return { ...c, "Strategy JSON": JSON.stringify(foundStrategy), status: 'Awaiting Strategy Review' };
          }
          return c;
        }));
      } else if (foundStrategy && !hasRealData) {
        throw new Error("n8n returned a perfectly formatted JSON schema, but all the fields (pillars, schedule, mix) were empty! Please check your n8n 'Format Prompt' node and ensure you are passing the Webhook variables into the AI Agent prompt.");
      } else if (unwrapped.error) {
        throw new Error(`n8n AI Execution Error: ${unwrapped.error}`);
      } else {
        throw new Error("Response format error: Could not find strategy data in the AI output. Received: " + JSON.stringify(unwrapped).slice(0, 100));
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setStrategyError("Strategy generation timed out. The AI is taking too long — please try again.");
      } else {
        setStrategyError(err instanceof Error ? err.message : "Strategy generation failed");
      }
    } finally {
      clearTimeout(timeoutId);
      setGeneratingFor(null);
    }
  }

  // Feedback modal state
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  function closeStrategy() {
    setStrategy(null);
    setStrategyClient(null);
    setStrategyError(null);
    setShowFeedbackBox(false);
    setFeedbackText("");
  }

  async function handleApproveStrategy() {
    if (!strategyClient) return;
    
    try {
      // 1. Update client status to Approved
      const { error: clientError } = await supabase
        .from('clients')
        .update({ status: 'Strategy Approved' })
        .eq('id', strategyClient.id);
        
      if (clientError) throw new Error(clientError.message);
      
      // 2. Parse strategy to extract deliverables
      let strat = strategy;
      if (typeof strat === 'string') {
        try { strat = JSON.parse(strat); } catch(e) {}
      }
      
      const specificPosts = strat?.weekly_posts || strat?.posts || strat?.content_calendar || [];
      const insertPayload: any[] = [];
      
      if (Array.isArray(specificPosts) && specificPosts.length > 0) {
        specificPosts.forEach((post: any) => {
          insertPayload.push({
            client_id: strategyClient.id,
            task_name: post.topic || post.theme || "Design Task",
            post_type: post.post_type || post.type || "Post",
            platform: post.platform || "Instagram",
            topic: post.topic || post.theme || "General",
            status: 'Pending Design'
          });
        });
      } else {
        // Fallback to pillars if no specific posts
        const pillars = strat?.content_pillars || [];
        if (Array.isArray(pillars)) {
          pillars.forEach((p: any) => {
            insertPayload.push({
               client_id: strategyClient.id,
               task_name: p.name || "Pillar Task",
               post_type: "Graphic",
               platform: "Multiple",
               topic: p.description || p.name || "",
               status: 'Pending Design'
            });
          });
        }
      }
      
      // 3. Insert Deliverables
      if (insertPayload.length > 0) {
        const { error: insertError } = await supabase.from('content_deliverables').insert(insertPayload);
        if (insertError) console.error("Could not insert deliverables:", insertError.message);
      }
      
      // Update UI
      setClients(prev => prev.map(c => 
        c.id === strategyClient.id ? { ...c, status: 'Strategy Approved' } : c
      ));
      
      alert(`✅ Strategy Approved! ${insertPayload.length} tasks were immediately passed to the Designer Queue.`);
      closeStrategy();
    } catch (err: unknown) {
      alert("Failed to approve strategy: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  }

  async function handleSubmitFeedback() {
    if (!strategyClient || !feedbackText.trim()) return;
    
    try {
      // 1. Update Supabase with feedback and status
      const { error } = await supabase
        .from('clients')
        .update({ 
          status: 'Rework Required',
          client_feedback: feedbackText
        })
        .eq('id', strategyClient.id);
        
      if (error) throw new Error(error.message);
      
      // Update local state temporarily
      const updatedClient = { ...strategyClient, status: 'Rework Required', client_feedback: feedbackText };
      setClients(prev => prev.map(c => c.id === strategyClient.id ? updatedClient : c));
      
      // 2. Hide feedback box, and instantly trigger AI generation
      setShowFeedbackBox(false);
      setFeedbackText("");
      
      // Fire regeneration
      await generateStrategy(updatedClient);
      
    } catch (err: unknown) {
      alert("Failed to submit feedback: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  }

  // Strategy Editing Functions
  async function handleEditStrategy() {
    if (!strategyClient || !editedStrategy.trim()) return;
    
    try {
      // Parse the edited strategy to validate JSON
      const parsedStrategy = JSON.parse(editedStrategy);
      
      // Update the strategy in Supabase
      const { error } = await supabase
        .from('clients')
        .update({ 
          strategy_json: parsedStrategy,
          status: 'Strategy Edited' 
        })
        .eq('id', strategyClient.id);
        
      if (error) throw new Error(error.message);
      
      // Update local state
      setStrategy(parsedStrategy);
      setIsEditingStrategy(false);
      
      alert("✅ Strategy Updated Successfully!");
    } catch (err: unknown) {
      alert("Failed to update strategy: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  }

  function startEditingStrategy() {
    if (strategy) {
      setEditedStrategy(JSON.stringify(strategy, null, 2));
      setIsEditingStrategy(true);
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Strategy copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  }

  function exportStrategy() {
    if (!strategy || !strategyClient) return;
    
    const clientName = (strategyClient["Business Name"] || strategyClient["business_name"] || "Client").replace(/\s+/g, '_');
    const filename = `ScalePods_Strategy_${clientName}_${new Date().toISOString().split('T')[0]}.json`;
    
    // Ensure all strategy content is clean of placeholders for export
    const content = JSON.stringify(strategy, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function deleteClient(name: string) {
    const targetName = name?.trim();
    if (!targetName || targetName === "??") return;

    if (confirm(`Are you sure you want to delete ${targetName}?`)) {
      setIsDeleting(targetName);
      setMenuOpenFor(null);
      
      try {
        const { error: dbError } = await supabase
          .from('clients')
          .delete()
          .eq('business_name', targetName);

        if (dbError) throw new Error(dbError.message);

        setClients(prev => prev.filter(c => {
          const cName = (c["Business Name"] || c["business_name"] || "").trim();
          return cName.toLowerCase() !== targetName.toLowerCase();
        }));
      } catch (err) {
        console.error("[Delete] Error:", err);
        alert(err instanceof Error ? err.message : "Failed to delete client from database.");
      } finally {
        setIsDeleting(null);
      }
    }
  }

  function viewSavedStrategy(client: Client) {
    setMenuOpenFor(null);
    const saved = client["Strategy JSON"];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStrategyClient(client);
        setStrategy(parsed);
      } catch (err) {
        console.error("Failed to parse saved strategy", err);
        alert("Found saved strategy, but it's in an invalid format.");
      }
    } else {
      if (confirm("No strategy found for this client. Would you like to generate one now?")) {
        generateStrategy(client);
      }
    }
  }

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return !q || (c["Business Name"]?.toLowerCase().includes(q) || c["Business Type"]?.toLowerCase().includes(q));
  });

  const salesCount = clients.filter((c) => getGoal(c).toLowerCase().includes("sales")).length;
  const growthCount = clients.filter((c) => getGoal(c).toLowerCase().includes("awareness") || getGoal(c).toLowerCase().includes("growth")).length;

  return (
    <>
      {/* Global Processing Loader */}
      {generatingFor !== null && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <RadialPulseLoader 
             size={200} 
             color="#ff8a8a" 
             text={`GENERATING STRATEGY FOR ${generatingFor.toUpperCase()}`} 
           />
        </div>
      )}
      
      <div className="px-4 md:px-12 pb-12 space-y-10 max-w-[1400px] mx-auto">
        {/* Top Bar */}
      <header className="sticky top-0 z-40 h-16 bg-[#131313]/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 border-b border-white/5 -mx-4 md:-mx-12">
        <h2 className="text-lg md:text-xl font-[900] text-white ml-2 md:ml-4">Client Management</h2>
        <div className="flex items-center gap-4 md:gap-6 mr-2 md:mr-4">
          <span className="material-symbols-outlined cursor-pointer text-gray-400 hover:text-white transition-colors">notifications</span>
          <span className="material-symbols-outlined cursor-pointer text-gray-400 hover:text-white transition-colors">help_outline</span>
        </div>
      </header>

      {/* Header + Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 text-left">
        <div className="space-y-4 w-full">
          <h1 className="text-3xl md:text-4xl font-[900] text-white tracking-tight">Active Clients</h1>
          <div className="flex flex-wrap gap-4 md:gap-8 items-center bg-surface-container-low p-4 rounded-xl ghost-border px-6">
            <div className="flex flex-col">
              <span className="text-gray-500 text-[9px] md:text-[10px] uppercase font-bold tracking-widest">Total Clients</span>
              <span className="text-xl md:text-2xl font-[900] text-white">{clients.length}</span>
            </div>
            <div className="hidden sm:block h-8 w-px bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-[9px] md:text-[10px] uppercase font-bold tracking-widest">Growth Focused</span>
              <span className="text-xl md:text-2xl font-[900] text-sp-secondary">{growthCount}</span>
            </div>
            <div className="hidden sm:block h-8 w-px bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-[9px] md:text-[10px] uppercase font-bold tracking-widest">Sales Oriented</span>
              <span className="text-xl md:text-2xl font-[900] text-sp-tertiary">{salesCount}</span>
            </div>
          </div>
        </div>
        <Link href="/onboarding" className="w-full lg:w-auto bg-sp-primary text-on-primary px-8 py-4 rounded-xl font-[900] text-sm tracking-wide shadow-[0_0_30px_rgba(192,193,255,0.2)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-lg">person_add</span>
          ADD NEW CLIENT
        </Link>
      </div>

      {/* Search */}
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 group-focus-within:text-sp-primary transition-colors">search</span>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-surface-container-high border-0 rounded-xl py-4 pl-12 pr-6 text-white placeholder-gray-500 focus:ring-1 focus:ring-sp-primary/50 transition-all ghost-border" placeholder="Filter by name, platform, or business goal..." />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-sp-primary border-t-transparent animate-spin"></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-sp-error/10 border border-sp-error/20 rounded-xl p-4 text-sp-error text-sm flex items-center gap-2">
          <span className="material-symbols-outlined">warning</span>{error}
        </div>
      )}

      {/* Client Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((client, i) => {
            const name = client["Business Name"] || "??";
            const initials = name.slice(0, 2).toUpperCase();
            const colorClass = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const isGenerating = generatingFor === name;
            const isUserDeleting = isDeleting === name;

            return (
              <div 
                key={i} 
                className={`bg-surface-container-low rounded-xl p-6 ghost-border flex flex-col gap-4 hover:bg-surface-container transition-colors group relative ${isUserDeleting ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {isUserDeleting && (
                   <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 rounded-xl">
                      <div className="w-6 h-6 rounded-full border-2 border-sp-primary border-t-transparent animate-spin"></div>
                   </div>
                )}
                <div className="flex items-start gap-4 md:gap-6">
                  <div className={`h-12 w-12 md:h-16 md:w-16 shrink-0 rounded-xl flex items-center justify-center font-[900] text-lg md:text-xl border ${colorClass}`}>
                    {initials}
                  </div>
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-sp-primary transition-colors truncate">{name}</h3>
                        <p className="text-gray-500 text-xs md:text-sm truncate">{client["Business Type"]}</p>
                      </div>
                      <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); setMenuOpenFor(menuOpenFor === i ? null : i); }} className="text-gray-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                        {menuOpenFor === i && (
                          <div className="absolute right-0 top-10 z-30 w-48 bg-surface-container-high border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => { setViewClient(client); setMenuOpenFor(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-white/5 transition-colors">
                              <span className="material-symbols-outlined text-lg text-sp-primary">person</span> View Profile
                            </button>
                            <button onClick={() => { router.push(`/clients/${client.id}/strategy`); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-white/5 transition-colors">
                               <span className="material-symbols-outlined text-lg text-sp-tertiary">visibility</span> View Strategy
                            </button>
                            <button onClick={() => { generateStrategy(client); setMenuOpenFor(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-white/5 transition-colors">
                              <span className="material-symbols-outlined text-lg text-sp-secondary">auto_awesome</span> Generate Strategy
                            </button>
                            <div className="border-t border-white/5"></div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteClient(name); }} 
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-sp-error hover:bg-sp-error/5 transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span> Delete Client
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {client.Platforms && (
                      <div className="flex flex-wrap gap-2">
                        {client.Platforms.split(",").map((p) => (
                          <span key={p.trim()} className="px-3 py-1 bg-surface-container-highest text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded-lg">
                            {p.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-3">
                      {getGoal(client) && (
                        <span className={`px-3 py-1.5 text-[11px] font-[900] uppercase rounded-full border ${GOAL_COLORS[getGoal(client)] || "bg-white/5 text-gray-400 border-white/10"}`}>
                          {getGoal(client)}
                        </span>
                      )}
                      {client.Tone && (
                        <span className={`px-3 py-1.5 text-[11px] font-[900] uppercase rounded-full border ${TONE_COLORS[client.Tone] || "bg-white/5 text-gray-400 border-white/10"}`}>
                          {client.Tone} Tone
                        </span>
                      )}
                      {client.status && (
                        <span className={`px-3 py-1.5 text-[11px] font-[900] uppercase rounded-full border ${
                          client.status === 'Strategy Approved' ? 'bg-sp-secondary/10 text-sp-secondary border-sp-secondary/30' :
                          client.status === 'Rework Required' ? 'bg-sp-error/10 text-sp-error border-sp-error/30' :
                          client.status === 'Awaiting Strategy Review' ? 'bg-sp-tertiary/10 text-sp-tertiary border-sp-tertiary/30' :
                          'bg-white/5 text-gray-400 border-white/10'
                        }`}>
                          {client.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Strategy Button */}
                <div className="border-t border-white/5 pt-4 flex gap-3">
                  <button
                    onClick={() => generateStrategy(client)}
                    disabled={isGenerating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sp-primary/10 text-sp-primary border border-sp-primary/20 text-xs font-bold uppercase tracking-widest hover:bg-sp-primary/20 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-sp-primary border-t-transparent animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        Generate Strategy
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setViewClient(client)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-container-high text-on-surface-variant border border-white/5 text-xs font-bold uppercase tracking-widest hover:bg-surface-bright transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="h-24 w-24 rounded-full bg-surface-container-high flex items-center justify-center ghost-border opacity-50">
            <span className="material-symbols-outlined text-4xl text-gray-400">search_off</span>
          </div>
          <p className="text-white font-bold">No clients found</p>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">Refine your search or add a new client to your list.</p>
        </div>
      )}

      {/* STRATEGY FULL SCREEN OVERLAY REMOVED (Migrated to dedicated Strategy Page) */}
      {/* CLIENT DETAIL MODAL                     */}
      {/* ═══════════════════════════════════════ */}
      {viewClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setViewClient(null)}></div>
          <div className="relative z-10 bg-surface-container-low border border-white/5 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#1c1b1b]">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-sp-primary/10 flex items-center justify-center border border-sp-primary/20 text-sp-primary font-[900] text-xl">
                  {viewClient["Business Name"]?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-[900] text-white tracking-tight">{viewClient["Business Name"]}</h3>
                  <p className="text-on-surface-variant">{viewClient["Business Type"] || "General Business"}</p>
                </div>
              </div>
              <button onClick={() => setViewClient(null)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined text-gray-400">close</span>
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Primary Goal</p>
                  <p className="text-white font-medium">{getGoal(viewClient) || "Not specified"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Brand Tone</p>
                  <p className="text-white font-medium">{viewClient["Tone"] || "Not specified"}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Platforms</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {viewClient["Platforms"]?.split(',').map(p => (
                      <span key={p} className="px-3 py-1 bg-surface-container-high rounded-lg text-xs text-on-surface-variant border border-white/5">
                        {p.trim()}
                      </span>
                    )) || <span className="text-on-surface-variant italic">No platforms specified</span>}
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</p>
                  <p className="text-on-surface-variant text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                    {viewClient["Description"] || "No description provided."}
                  </p>
                </div>
                <div className="col-span-2 space-y-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Audience</p>
                  <p className="text-on-surface-variant text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                    {viewClient["Target Audience"] || "No audience details provided."}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-surface-container-high/50 border-t border-white/5 flex gap-4">
              <button 
                onClick={() => { generateStrategy(viewClient); setViewClient(null); }}
                className="flex-1 bg-sp-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(192,193,255,0.3)] transition-all"
              >
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                Generate Strategy
              </button>
              <button 
                onClick={() => setViewClient(null)}
                className="px-8 py-3 bg-surface-container-high text-white rounded-xl font-bold border border-white/5 hover:bg-surface-bright transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
