"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import RadialPulseLoader from "@/components/RadialPulseLoader";

type Platform = "instagram" | "website" | "linkedin" | "all" | "twitter";
type ViewState = "feed" | "history" | "settings";

const PLATFORM_TABS: { id: Platform; label: string; icon: string }[] = [
  { id: "instagram", label: "Instagram", icon: "photo_camera" },
  { id: "website", label: "Website", icon: "language" },
  { id: "linkedin", label: "LinkedIn", icon: "work" },
];

const HISTORY_TABS: { id: Platform; label: string }[] = [
  { id: "all", label: "All Posts" },
  { id: "instagram", label: "Instagram" },
  { id: "twitter", label: "Twitter" },
  { id: "linkedin", label: "LinkedIn" },
];

export default function PublishingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Client");
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [publishedItems, setPublishedItems] = useState<any[]>([]);
  const [activePlatform, setActivePlatform] = useState<Platform>("instagram");
  const [historyPlatform, setHistoryPlatform] = useState<Platform>("all");
  const [currentView, setCurrentView] = useState<ViewState>("feed");

  // Publishing States
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [reviewTask, setReviewTask] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Modal / Form State ──
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [postType, setPostType] = useState<"FEED" | "STORY" | "CAROUSEL">("FEED");
  const [carouselIndex, setCarouselIndex] = useState(0);

  // ── Website Modal State ──
  const [webTitle, setWebTitle] = useState("");
  const [webSlug, setWebSlug] = useState("");
  const [webExcerpt, setWebExcerpt] = useState("");
  const [webCategory, setWebCategory] = useState("insights");
  const [webTags, setWebTags] = useState("");
  const [webBody, setWebBody] = useState("");
  const [webSections, setWebSections] = useState<{heading: string, body: string}[]>([]);
  const [webCtaLabel, setWebCtaLabel] = useState("Learn More");
  const [webCtaUrl, setWebCtaUrl] = useState("https://scalepods.co/contact");

  const [isGenerating, setIsGenerating] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishMessage, setPublishMessage] = useState("Uploading...");

  useEffect(() => {
    const user = getUser();
    if (user) setUserName(user.name);
    fetchReadyQueue();
  }, [router]);

  async function fetchReadyQueue() {
    const { data, error } = await supabase
      .from("content_deliverables")
      .select(`*, clients(business_name)`)
      .in("status", ["Ready for Publishing", "Published"])
      .order("created_at", { ascending: false });

    if (error) { console.error("Fetch error:", error); setIsLoading(false); return; }
    const items = data || [];
    setDeliverables(items.filter((d) => d.status === "Ready for Publishing"));
    setPublishedItems(items.filter((d) => d.status === "Published"));
    setIsLoading(false);
  }

  const filteredDeliverables = deliverables.filter((d) => {
    const target = (d.platform_target || "instagram").toLowerCase();
    return target === activePlatform.toLowerCase();
  });

  const filteredHistory = publishedItems.filter((item) => {
    if (historyPlatform === "all") return true;
    const target = (item.platform_target || item.platform || "instagram").toLowerCase();
    return target === historyPlatform.toLowerCase();
  });

  function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function handleOpenReview(task: any) {
    setReviewTask(task);
    if (activePlatform === "instagram") {
      setCaption(task.topic || "");
      setHashtags("");
      setPostType(task.media_url?.includes(",") ? "CAROUSEL" : "FEED");
    } else if (activePlatform === "website") {
      setWebTitle(task.task_name || "");
      setWebSlug(slugify(task.task_name || ""));
      setWebExcerpt(task.topic || "");
      setWebCategory("insights");
      setWebTags("");
      setWebBody("");
      setWebSections([]);
      setWebCtaLabel("Learn More");
      setWebCtaUrl("https://scalepods.co/contact");
    }
  }

  function handleCloseReview() {
    setReviewTask(null);
    setCarouselIndex(0);
    setCaption("");
    setHashtags("");
  }

  async function generateAIContent() {
    if (!reviewTask) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: reviewTask.topic || reviewTask.task_name,
          platform: activePlatform === "website" ? "A premium blog post. IMPORTANT: Return ONLY a raw JSON object with this exact structure: { \"title\": \"...\", \"excerpt\": \"...\", \"slug\": \"...\", \"sections\": [ { \"heading\": \"...\", \"body\": \"...\" }, ... ] }. Use clear headings and detailed body text for each section." : reviewTask.platform,
          client_name: reviewTask.clients?.business_name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || "AI failed");
      
      if (activePlatform === "instagram") {
        if (data.caption) setCaption(data.caption);
        if (data.hashtags) setHashtags(data.hashtags);
      } else if (activePlatform === "website") {
        if (data.caption) {
          try {
            // Content might be wrapped in markdown code blocks
            const jsonStr = data.caption.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(jsonStr);
            if (parsed.sections) setWebSections(parsed.sections);
            if (parsed.excerpt) setWebExcerpt(parsed.excerpt);
            if (parsed.title) {
              setWebTitle(parsed.title);
              setWebSlug(parsed.slug || parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
            }
          } catch {
            // Fallback: treat as plain text if JSON parsing fails
            setWebSections([{ heading: "Article Content", body: data.caption }]);
            setWebExcerpt(data.caption.slice(0, 160) + "...");
          }
        }
      }
    } catch (err: any) {
      alert("AI Issue: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleInstagramPublish() {
    if (!reviewTask) return;
    const taskId = reviewTask.id;
    setIsPublishing(taskId);
    setPublishProgress(0);
    setPublishMessage("Connecting to API...");
    const finalCaption = hashtags ? `${caption}\n\n${hashtags}` : caption;
    
    try {
      const res = await fetch("/api/publish-instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          media_url: reviewTask.media_url, 
          caption: postType === "STORY" ? "" : finalCaption,
          media_type: postType === "STORY" ? "STORIES" : (postType === "CAROUSEL" ? "CAROUSEL" : (reviewTask.media_url.endsWith(".mp4") ? "REELS" : "IMAGE"))
        }),
      });

      if (!res.body) throw new Error("Stream failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let finalData: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const events = decoder.decode(value).split("\n\n");
        for (const ev of events) {
          if (ev.startsWith("data: ")) {
            const data = JSON.parse(ev.slice(6));
            if (data.progress) setPublishProgress(data.progress);
            if (data.message) setPublishMessage(data.message);
            if (data.success) finalData = data;
            if (data.error) throw new Error(data.error);
          }
        }
      }

      await supabase.from("content_deliverables").update({ 
        status: "Published", topic: finalCaption,
        rework_comments: JSON.stringify({ ig_post_id: finalData?.ig_post_id, ig_post_url: finalData?.ig_post_url })
      }).eq("id", taskId);

      setDeliverables(prev => prev.filter(d => d.id !== taskId));
      setPublishedItems(prev => [{ ...reviewTask, status: "Published", rework_comments: JSON.stringify({ ig_post_id: finalData?.ig_post_id, ig_post_url: finalData?.ig_post_url }) }, ...prev]);
      handleCloseReview();
      alert(`🚀 Posted!\n${finalData.ig_post_url}`);
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setIsPublishing(null);
    }
  }

  async function handleWebsitePublish() {
    if (!reviewTask) return;
    const taskId = reviewTask.id;
    setIsPublishing(taskId);
    setPublishProgress(20);
    setPublishMessage("Syncing with website...");

    try {
      const res = await fetch("/api/publish-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: webTitle,
          excerpt: webExcerpt,
          body: JSON.stringify(webSections),
          hero_image: reviewTask.media_url?.split(",")[0],
          category: webCategory,
          tags: webTags.split(",").map(t => t.trim()),
          cta_label: webCtaLabel,
          cta_url: webCtaUrl,
          deliverable_id: taskId
        }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw { 
          message: data.error || "Failed to publish", 
          details: data.details 
        };
      }

      setPublishProgress(100);
      setPublishMessage("Published!");
      
      setDeliverables(prev => prev.filter(d => d.id !== taskId));
      const metadata = { slug: data.slug, website_post_id: data.id };
      setPublishedItems(prev => [{ ...reviewTask, status: "Published", rework_comments: JSON.stringify(metadata) }, ...prev]);
      
      // Update the record in Supabase with the slug metadata
      await supabase.from("content_deliverables").update({ 
        rework_comments: JSON.stringify(metadata) 
      }).eq("id", taskId);

      handleCloseReview();
      
      // Open the live blog post
      if (data.slug) {
        const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "https://scalepods-replication.vercel.app";
        window.open(`${websiteUrl}/blog/${data.slug}`, "_blank");
      }
    } catch (err: any) {
      const errorMsg = err.details ? `❌ ${err.message}\nDetails: ${err.details}` : `❌ ${err.message || err}`;
      alert(errorMsg);
    } finally {
      setIsPublishing(null);
    }
  }

  const counts = {
    instagram: deliverables.filter(d => (d.platform_target || "instagram").toLowerCase() === "instagram").length,
    website: deliverables.filter(d => (d.platform_target || "").toLowerCase() === "website").length,
    linkedin: deliverables.filter(d => (d.platform_target || "").toLowerCase() === "linkedin").length,
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-surface z-[200]">
        <RadialPulseLoader size={160} color="#c0c1ff" text="Syncing Engine..." />
      </div>
    );
  }

  return (
    <div className="bg-surface antialiased min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden">
      
      {/* ── MOBILE VIEW (STITCH DESIGN) ── */}
      <div className="block md:hidden pt-24 pb-32">
        {/* TopAppBar */}
        <header className="fixed top-0 w-full z-[100] flex justify-between items-center px-8 py-4 bg-[#1c1b1b] backdrop-blur-[40px] shadow-[0_4px_60px_rgba(229,226,225,0.06)]">
          <button className="text-sp-primary hover:bg-surface-container-highest/50 transition-all p-2 rounded-full flex items-center justify-center active:scale-95">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="text-xl font-black text-sp-primary uppercase tracking-tighter">Ready to Post</h1>
          <div className="h-10 w-10 rounded-full bg-surface-container-highest overflow-hidden border-2 border-primary-container/20 hover:scale-105 transition-transform active:scale-95 cursor-pointer">
            <img src="https://lh3.googleusercontent.com/a/ACg8ocL8_Q3H0_6Uu_x-rWJ9p8p9o3p9o3p9o3=s96-c" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </header>

        <main className="flex-grow px-4 max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {currentView === "feed" ? (
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Filter Pills */}
                <div className="flex space-x-3 overflow-x-auto pb-6 hide-scrollbar relative w-full mb-8 pt-4">
                  {PLATFORM_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActivePlatform(tab.id)}
                      className={`px-6 py-3 rounded-full whitespace-nowrap text-sm font-bold tracking-tight transition-all flex items-center gap-2 ${
                        activePlatform === tab.id
                          ? "bg-primary-container text-on-primary-container shadow-[0_4px_20px_rgba(192,193,255,0.15)]"
                          : "bg-surface-container-highest text-on-surface hover:bg-surface-variant"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                      {tab.label}
                      {counts[tab.id as keyof typeof counts] > 0 && (
                        <span className="ml-1 opacity-60 text-xs">({counts[tab.id as keyof typeof counts]})</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-8">
                  {filteredDeliverables.length === 0 ? (
                    <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center">
                      <span className="material-symbols-outlined text-6xl text-gray-700 mb-4">inbox</span>
                      <h3 className="text-lg font-bold">No tasks ready</h3>
                    </div>
                  ) : (
                    filteredDeliverables.map((item, idx) => (
                      <motion.article
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-6 shadow-xl border border-outline-variant/15"
                      >
                        <div className="w-full aspect-square rounded-md overflow-hidden relative">
                          <img src={item.media_url?.split(",")[0]} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                        <div className="w-full flex flex-col justify-between">
                          <h2 className="text-lg font-bold tracking-tight text-on-surface mb-2">{item.task_name}</h2>
                          <p className="text-sm text-on-surface-variant line-clamp-3 mb-4">{item.topic}</p>
                          <button
                            onClick={() => handleOpenReview(item)}
                            className="w-full bg-gradient-to-br from-primary-container to-sp-primary text-black font-black text-sm py-4 rounded-full shadow-lg"
                          >
                            Review & Publish
                          </button>
                        </div>
                      </motion.article>
                    ))
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="pt-4"
              >
                <div className="mb-12">
                  <h2 className="text-6xl font-black leading-tight tracking-tight text-on-surface mb-2">History</h2>
                </div>
                {/* ...Mobile History... */}
                <div className="grid grid-cols-1 gap-8">
                  {filteredHistory.map((item) => (
                    <div key={item.id} className="bg-surface-container-low rounded-lg p-4 border border-white/5">
                       <img src={item.media_url?.split(",")[0]} className="w-full aspect-square object-cover rounded-md mb-4" alt="Hx" />
                       <h3 className="font-bold text-on-surface">{item.task_name}</h3>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* BottomNavBar */}
        <nav className="fixed bottom-0 left-0 w-full z-[101] flex justify-around items-center px-6 pb-10 pt-4 bg-[#131313]/60 backdrop-blur-[32px] rounded-t-[32px] shadow-[0_-10px_60px_rgba(0,0,0,0.5)]">
          <button onClick={() => setCurrentView("feed")} className={`flex flex-col items-center ${currentView === "feed" ? "text-sp-primary" : "text-on-surface/40"}`}>
            <span className="material-symbols-outlined text-2xl">grid_view</span>
            <span className="text-[10px] uppercase font-bold mt-1">Feed</span>
          </button>
          <Link href="/" className="flex flex-col items-center bg-sp-primary text-black rounded-full px-6 py-2">
            <span className="material-symbols-outlined text-2xl">add_circle</span>
            <span className="text-[10px] uppercase font-black mt-1">Publish</span>
          </Link>
          <button onClick={() => setCurrentView("history")} className={`flex flex-col items-center ${currentView === "history" ? "text-sp-primary" : "text-on-surface/40"}`}>
            <span className="material-symbols-outlined text-2xl">history</span>
            <span className="text-[10px] uppercase font-bold mt-1">History</span>
          </button>
           <button className="flex flex-col items-center text-on-surface/40">
            <span className="material-symbols-outlined text-2xl">settings</span>
            <span className="text-[10px] uppercase font-bold mt-1">Settings</span>
          </button>
        </nav>
      </div>

      {/* ── DESKTOP VIEW (RESTORED DASHBOARD) ── */}
      <div className="hidden md:block">
        <div className="px-8 pt-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sp-secondary/10 border border-sp-secondary/20 text-sp-secondary text-[11px] font-bold uppercase tracking-widest mb-3">
                Publishing Engine
              </div>
              <h1 className="text-4xl font-[900] text-white tracking-tighter truncate leading-none pt-1">Ready to Post</h1>
              <p className="text-sm text-on-surface-variant mt-1 max-w-xl">
                Design, review and publish content platform by platform.
              </p>
            </div>
            <Link href="/" className="text-sm font-bold text-sp-primary hover:underline flex items-center gap-2 shrink-0">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-2 mt-8 overflow-x-auto no-scrollbar pb-2">
            {PLATFORM_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePlatform(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-black transition-all border ${
                  activePlatform === tab.id
                    ? "bg-white text-black border-white shadow-lg"
                    : "bg-white/5 text-on-surface-variant border-white/5 hover:border-white/10"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                {tab.label}
                {counts[tab.id as keyof typeof counts] > 0 && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${activePlatform === tab.id ? "bg-black text-white" : "bg-white/10 text-gray-400"}`}>
                    {counts[tab.id as keyof typeof counts]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="px-8 pt-6 pb-12 w-full max-w-6xl">
          {filteredDeliverables.length === 0 ? (
             <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center">
               <span className="material-symbols-outlined text-6xl text-gray-700 mb-4">inbox</span>
               <h3 className="text-xl font-bold text-white">No {activePlatform} Posts Ready</h3>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDeliverables.map((item) => (
                <div key={item.id} className="bg-surface-container-low rounded-3xl border border-white/5 overflow-hidden group flex flex-col relative shadow-xl hover:border-white/20 transition-all duration-300">
                  <div className="w-full aspect-[4/3] bg-surface-container-highest relative flex items-center justify-center overflow-hidden">
                    {item.media_url ? (
                      <img src={item.media_url.split(",")[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    ) : (
                      <span className="material-symbols-outlined text-6xl text-white/10">image</span>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="bg-sp-primary/10 text-sp-primary px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-sp-primary/20 leading-none self-start mb-3">
                       {item.clients?.business_name}
                    </div>
                    <h3 className="text-xl font-black text-white leading-tight mb-2 tracking-tight">{item.task_name}</h3>
                    <p className="text-sm text-on-surface-variant line-clamp-2 mb-6 font-medium leading-relaxed opacity-80">{item.topic}</p>
                    <button
                      onClick={() => handleOpenReview(item)}
                      className="mt-auto w-full bg-white text-black py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 hover:bg-gray-200"
                    >
                      Review & Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-8 pb-16 w-full max-w-6xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-sp-tertiary">history</span>
            Publishing History
          </h2>
          <div className="bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#1c1b1b] text-xs text-on-surface-variant uppercase tracking-widest font-bold border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Content</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Posted On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {publishedItems.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-container-high transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-black/40 overflow-hidden shrink-0 border border-white/5">
                         {row.media_url && <img src={row.media_url.split(",")[0]} className="w-full h-full object-cover" />}
                      </div>
                      <span className="font-bold text-white">{row.task_name}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-sp-secondary font-bold text-xs uppercase">{row.platform_target || "POST"}</span>
                    </td>
                    <td className="px-6 py-4 text-white/50 text-[11px] font-medium uppercase font-mono">
                       {new Date(row.created_at).toLocaleDateString()} · {new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                       {row.platform_target === "website" && (
                          <button
                            onClick={async () => {
                              try {
                                const metadata = row.rework_comments ? JSON.parse(row.rework_comments) : null;
                                if (!metadata || !metadata.slug) return alert("❌ No slug metadata found");
                                const res = await fetch("/api/revalidate-website", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ slug: metadata.slug })
                                });
                                if (res.ok) alert("✅ Cache Refreshed!");
                                else alert("❌ Refresh Failed");
                              } catch {
                                alert("❌ Link refresh failed");
                              }
                            }}
                            className="p-2 text-white/40 hover:text-white rounded-lg"
                            title="Refresh Website Cache"
                          >
                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                          </button>
                       )}
                       <button onClick={async () => {
                          if (!confirm(`Are you sure? This will delete the post from the Dashboard AND the LIVE ${row.platform_target === "website" ? "Website" : "Record"}.`)) return;
                          
                          // If it's a website post, delete from website_content first
                          if (row.platform_target === "website") {
                            try {
                              const metadata = row.rework_comments ? JSON.parse(row.rework_comments) : null;
                              if (metadata && metadata.slug) {
                                await fetch("/api/unpublish-website", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ slug: metadata.slug })
                                });
                              }
                            } catch (e) {
                              console.error("Failed to unpublish from website", e);
                            }
                          }

                          await supabase.from("content_deliverables").delete().eq("id", row.id);
                          setPublishedItems(prev => prev.filter(p => p.id !== row.id));
                       }} className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg" title="Delete Everywhere">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── RESPONSIVE REVIEW MODAL ── */}
      <AnimatePresence>
        {reviewTask && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto no-scrollbar">
            
            {/* MOBILE MODAL */}
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="block md:hidden bg-surface max-w-xl w-full min-h-screen pb-24 relative"
            >
                <header className="sticky top-0 w-full z-50 flex justify-between items-center px-8 py-6 bg-surface/80 backdrop-blur-xl">
                  <button onClick={handleCloseReview} className="text-sp-primary p-2 bg-surface-container-highest/40 rounded-full">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                  <h2 className="font-bold text-sp-primary uppercase tracking-tighter">Review</h2>
                  <div className="w-10" />
                </header>
                <div className="px-6 flex flex-col gap-6">
                  <div className="aspect-square w-full rounded-md overflow-hidden bg-black">
                     <img src={reviewTask.media_url?.split(",")[carouselIndex]} className="w-full h-full object-contain" alt="" />
                  </div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-1 block">
                    {activePlatform === "website" ? "Blog Content (JSON or Markdown)" : "Caption"}
                  </label>
                  <textarea 
                    value={activePlatform === "website" ? webBody : caption} 
                    onChange={(e) => activePlatform === "website" ? setWebBody(e.target.value) : setCaption(e.target.value)} 
                    className="w-full bg-surface-container-high p-4 rounded-xl min-h-[150px] focus:outline-none text-white text-sm" 
                  />
                  <button onClick={activePlatform === "instagram" ? handleInstagramPublish : handleWebsitePublish} className="w-full bg-sp-primary text-black py-4 rounded-full font-black">
                    {isPublishing ? "Publishing..." : "Publish Now"}
                  </button>
                </div>
            </motion.div>

            {/* DESKTOP MODAL */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="hidden md:flex bg-surface border border-white/10 rounded-2xl max-w-5xl w-full h-[85vh] overflow-hidden shadow-2xl relative"
            >
               <button onClick={handleCloseReview} className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center bg-black/50 border border-white/20 text-white rounded-full hover:bg-red-500">
                <span className="material-symbols-outlined text-sm">close</span>
               </button>
               <div className="w-1/2 bg-black flex items-center justify-center p-6 border-r border-white/5">
                  <img src={reviewTask.media_url?.split(",")[carouselIndex]} className="max-w-full max-h-full object-contain shadow-2xl rounded-xl" />
               </div>
               <div className="w-1/2 p-10 flex flex-col bg-[#161616] overflow-y-auto">
                  <h2 className="text-2xl font-[900] text-white tracking-tight mb-2">{reviewTask.task_name}</h2>
                  <p className="text-sm font-medium text-sp-tertiary mb-8">Client: {reviewTask.clients?.business_name}</p>
                  
                  <button onClick={generateAIContent} disabled={isGenerating} className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm mb-6 flex items-center justify-center gap-2">
                    {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-sm">auto_awesome</span>}
                    {activePlatform === "website" ? "AI Generate Full Article" : "AI Generate Caption"}
                  </button>

                  {activePlatform === "website" ? (
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2 block">Article Title</label>
                        <input value={webTitle} onChange={(e)=>setWebTitle(e.target.value)} className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-sp-primary/50" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2 block">Slug</label>
                        <input value={webSlug} onChange={(e)=>setWebSlug(e.target.value)} className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-sp-primary/50" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2 block">Excerpt</label>
                        <textarea value={webExcerpt} onChange={(e)=>setWebExcerpt(e.target.value)} rows={2} className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-sp-primary/50 resize-none" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest block">Article Sections</label>
                          <button 
                            onClick={() => setWebSections([...webSections, { heading: "", body: "" }])}
                            className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded"
                          >
                            + Add Section
                          </button>
                        </div>
                        <div className="flex flex-col gap-4">
                          {webSections.map((sec, i) => (
                            <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 relative group">
                              <button 
                                onClick={() => setWebSections(webSections.filter((_, idx) => idx !== i))}
                                className="absolute top-2 right-2 text-white/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                              <input 
                                placeholder="Section Heading"
                                value={sec.heading} 
                                onChange={(e) => {
                                  const newSecs = [...webSections];
                                  newSecs[i].heading = e.target.value;
                                  setWebSections(newSecs);
                                }}
                                className="w-full bg-transparent border-b border-white/10 mb-2 py-1 text-sm text-white focus:outline-none focus:border-sp-primary"
                              />
                              <textarea 
                                placeholder="Section Body"
                                value={sec.body} 
                                onChange={(e) => {
                                  const newSecs = [...webSections];
                                  newSecs[i].body = e.target.value;
                                  setWebSections(newSecs);
                                }}
                                rows={4}
                                className="w-full bg-transparent py-1 text-sm text-white/70 focus:outline-none resize-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2 block">Caption</label>
                      <textarea value={caption} onChange={(e)=>setCaption(e.target.value)} rows={8} className="w-full bg-surface-container-high border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-sp-primary/50 resize-none mb-6" />
                    </>
                  )}
                  
                  <button onClick={activePlatform === "instagram" ? handleInstagramPublish : handleWebsitePublish} disabled={!!isPublishing} className="mt-6 w-full bg-sp-primary text-black py-4 rounded-xl font-black flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">{isPublishing ? "sync" : "send"}</span>
                    {isPublishing ? "Processing..." : "Publish Now"}
                  </button>
               </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
