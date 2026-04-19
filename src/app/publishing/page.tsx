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
          platform: activePlatform === "website" ? "website blog post" : reviewTask.platform,
          client_name: reviewTask.clients?.business_name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || "AI failed");
      
      if (activePlatform === "instagram") {
        if (data.caption) setCaption(data.caption);
        if (data.hashtags) setHashtags(data.hashtags);
      } else if (activePlatform === "website") {
        if (data.caption) setWebExcerpt(data.caption.slice(0, 200));
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
    try {
      const res = await fetch("/api/publish-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: webTitle, excerpt: webExcerpt, body: webBody,
          hero_image: reviewTask.media_url, category: webCategory,
          tags: webTags.split(",").map(t => t.trim()), cta_label: webCtaLabel,
          cta_url: webCtaUrl, deliverable_id: taskId
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await supabase.from("content_deliverables").update({ status: "Published" }).eq("id", taskId);
      setDeliverables(prev => prev.filter(d => d.id !== taskId));
      setPublishedItems(prev => [{ ...reviewTask, status: "Published" }, ...prev]);
      handleCloseReview();
      alert("🌐 Live on Scalepods!");
    } catch (err: any) {
      alert("❌ " + err.message);
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
    <div className="bg-surface antialiased min-h-screen flex flex-col pt-24 pb-32 selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden">
      
      {/* ── TopAppBar ── */}
      <header className="fixed top-0 w-full z-[100] flex justify-between items-center px-8 py-4 bg-[#1c1b1b] backdrop-blur-[40px] shadow-[0_4px_60px_rgba(229,226,225,0.06)]">
        <button className="text-sp-primary hover:bg-surface-container-highest/50 transition-all p-2 rounded-full flex items-center justify-center active:scale-95">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="text-xl font-black text-sp-primary uppercase tracking-tighter">Ready to Post</h1>
        <div className="h-10 w-10 rounded-full bg-surface-container-highest overflow-hidden border-2 border-primary-container/20 hover:scale-105 transition-transform active:scale-95 cursor-pointer">
          <img src="https://lh3.googleusercontent.com/a/ACg8ocL8_Q3H0_6Uu_x-rWJ9p8p9o3p9o3p9o3=s96-c" alt="Profile" className="w-full h-full object-cover" />
        </div>
      </header>

      <main className="flex-grow px-4 md:px-8 max-w-4xl mx-auto w-full">
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
                      <span className="ml-1 opacity-60 text-xs text-on-primary-container">({counts[tab.id as keyof typeof counts]})</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Grid */}
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
                      className="bg-surface-container-low rounded-lg p-4 flex flex-col md:flex-row gap-6 shadow-[0_10px_40px_rgba(229,226,225,0.03)] relative overflow-hidden group border border-outline-variant/15"
                    >
                      <div className="w-full md:w-1/2 aspect-square rounded-md overflow-hidden relative">
                        <img 
                          src={item.media_url?.split(",")[0]} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          alt="Preview" 
                        />
                        <div className="absolute top-4 right-4 bg-secondary text-on-secondary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg z-10">
                          {item.clients?.business_name || "CLIENT"}
                        </div>
                      </div>
                      <div className="w-full md:w-1/2 flex flex-col justify-between py-2">
                        <div>
                          <h2 className="text-lg font-bold tracking-tight text-on-surface mb-2">{item.task_name}</h2>
                          <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-4">
                            {item.topic || "Review this content artifact for your brand consistency and engagement."}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-outline">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">calendar_today</span>
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">bolt</span>
                              Ready
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleOpenReview(item)}
                          className="mt-6 w-full bg-gradient-to-br from-primary-container to-sp-primary text-black font-black text-sm py-4 rounded-full shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined">send</span>
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
                <p className="text-sm font-medium text-on-surface-variant max-w-xl leading-relaxed">
                  Your recently published artifacts. Review or curate your digital gallery.
                </p>
              </div>

              <div className="flex overflow-x-auto gap-4 pb-4 mb-8 hide-scrollbar">
                {HISTORY_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setHistoryPlatform(tab.id)}
                    className={`px-6 py-2 rounded-full text-sm font-bold shrink-0 transition-all ${
                      historyPlatform === tab.id
                        ? "bg-primary-container text-on-primary-container shadow-lg"
                        : "bg-surface-container-highest text-on-surface hover:bg-surface-variant"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredHistory.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-surface-container-low rounded-lg p-4 group relative overflow-hidden transition-all duration-300 hover:shadow-2xl border border-white/5"
                  >
                    <div className="absolute top-6 right-6 z-10 flex gap-2">
                      <div className="bg-surface-dim/80 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-bold text-secondary flex items-center gap-1 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                        Live
                      </div>
                    </div>
                    <div className="rounded-md overflow-hidden aspect-square mb-6 relative group-hover:scale-[1.02] transition-transform duration-500 bg-surface-container-highest">
                      {item.media_url ? (
                        <img src={item.media_url.split(",")[0]} className="w-full h-full object-cover" alt="History" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-8 text-center italic text-sm text-on-surface-variant">
                          "Published content artifact"
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                       <h3 className="text-lg font-bold text-on-surface tracking-tight truncate">{item.task_name}</h3>
                       <p className="text-[10px] text-outline mb-4">
                         Published {new Date(item.updated_at || item.created_at).toLocaleDateString()}
                       </p>
                       <div className="flex gap-3 mt-auto pt-4 border-t border-white/5">
                        <a
                          href={(() => {
                            try {
                              const meta = JSON.parse(item.rework_comments || "{}");
                              return meta.ig_post_url || meta.website_url || "#";
                            } catch(e) { return "#"; }
                          })()}
                          target="_blank"
                          className="flex-1 bg-surface-container-highest hover:bg-surface-variant text-sp-primary text-xs font-bold py-3 rounded-full transition-all flex justify-center items-center gap-2 border border-outline-variant/20"
                        >
                          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                          View
                        </a>
                        <button 
                          onClick={async () => {
                            if (!confirm("Remove from Agency OS history?")) return;
                            await supabase.from("content_deliverables").delete().eq("id", item.id);
                            setPublishedItems(prev => prev.filter(p => p.id !== item.id));
                          }}
                          className="w-12 h-12 bg-surface-container-highest hover:bg-error-container/20 text-outline hover:text-error rounded-full flex justify-center items-center transition-all border border-outline-variant/20"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── BottomNavBar ── */}
      <nav className="fixed bottom-0 left-0 w-full z-[101] flex justify-around items-center px-6 pb-10 pt-4 bg-[#131313]/60 backdrop-blur-[32px] rounded-t-[32px] shadow-[0_-10px_60px_rgba(0,0,0,0.5)]">
        <button 
          onClick={() => setCurrentView("feed")}
          className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
            currentView === "feed" ? "text-sp-primary" : "text-on-surface/40 hover:text-on-surface"
          }`}
        >
          <span className={`material-symbols-outlined text-2xl ${currentView === "feed" ? "fill-1" : ""}`}>grid_view</span>
          <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Feed</span>
        </button>

        <Link href="/" className="flex flex-col items-center justify-center bg-gradient-to-br from-sp-primary to-primary text-black rounded-full px-6 py-2 shadow-2xl active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-2xl">add_circle</span>
          <span className="text-[10px] uppercase font-black tracking-widest mt-1">Publish</span>
        </Link>

        <button 
          onClick={() => setCurrentView("history")}
          className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
            currentView === "history" ? "text-sp-primary" : "text-on-surface/40 hover:text-on-surface"
          }`}
        >
          <span className={`material-symbols-outlined text-2xl ${currentView === "history" ? "fill-1" : ""}`}>history</span>
          <span className="text-[10px] uppercase font-bold tracking-widest mt-1">History</span>
        </button>

        <button className="flex flex-col items-center justify-center text-on-surface/40 hover:text-on-surface active:scale-90 transition-all">
          <span className="material-symbols-outlined text-2xl">settings</span>
          <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Settings</span>
        </button>
      </nav>

      {/* ── Review Modal ── */}
      <AnimatePresence>
        {reviewTask && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md overflow-y-auto no-scrollbar"
          >
            <div className="max-w-xl mx-auto min-h-screen pb-24">
              <header className="sticky top-0 w-full z-50 flex justify-between items-center px-8 py-6">
                <button onClick={handleCloseReview} className="text-sp-primary p-2 bg-surface-container-highest/40 backdrop-blur-xl rounded-full">
                  <span className="material-symbols-outlined">close</span>
                </button>
                <h2 className="font-bold text-sp-primary uppercase tracking-tighter">Review & Publish</h2>
                <div className="w-10" />
              </header>

              <main className="px-6 flex flex-col gap-8">
                <section className="bg-surface-container-low rounded-lg p-6 shadow-2xl relative glass-edge">
                   <div className="absolute top-10 right-10 z-20 bg-secondary text-on-secondary px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest">
                      Ready
                   </div>
                   
                   <div className="aspect-square w-full relative overflow-hidden rounded-md bg-surface-container-lowest">
                      {reviewTask.media_url?.split(",")[carouselIndex].endsWith(".mp4") ? (
                        <video 
                          src={reviewTask.media_url.split(",")[carouselIndex]} 
                          className="w-full h-full object-cover" 
                          controls autoPlay muted loop 
                        />
                      ) : (
                        <img 
                          src={reviewTask.media_url?.split(",")[carouselIndex]} 
                          className="w-full h-full object-cover" 
                          alt="Review" 
                        />
                      )}
                      
                      {reviewTask.media_url?.includes(",") && (
                        <>
                          <button 
                            onClick={() => setCarouselIndex(p => Math.max(0, p - 1))}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-surface/40 backdrop-blur-xl p-3 rounded-full text-on-surface"
                          >
                            <span className="material-symbols-outlined">chevron_left</span>
                          </button>
                          <button 
                            onClick={() => setCarouselIndex(p => Math.min(reviewTask.media_url.split(",").length - 1, p + 1))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-surface/40 backdrop-blur-xl p-3 rounded-full text-on-surface"
                          >
                            <span className="material-symbols-outlined">chevron_right</span>
                          </button>
                        </>
                      )}
                   </div>

                   <div className="flex justify-center gap-3 pt-4">
                      {reviewTask.media_url?.split(",").map((_: any, idx: number) => (
                        <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === carouselIndex ? 'bg-sp-primary shadow-[0_0_8px_#c0c1ff]' : 'bg-surface-container-highest'}`} />
                      ))}
                   </div>
                </section>

                <section className="flex flex-col gap-6">
                   <button 
                    onClick={generateAIContent}
                    disabled={isGenerating}
                    className="w-full relative group overflow-hidden rounded-full p-[1px] shadow-2xl transition-all active:scale-[0.98]"
                   >
                     <div className="absolute inset-0 bg-gradient-to-r from-primary-container to-sp-primary opacity-80 group-hover:opacity-100 transition-opacity"></div>
                     <div className="relative bg-gradient-to-br from-[#c0c1ff] to-[#e1dfff] rounded-full px-6 py-4 flex items-center justify-center gap-3">
                        {isGenerating ? (
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          <span className="material-symbols-outlined text-black fill-1">auto_awesome</span>
                        )}
                        <span className="font-headline font-black text-black">Generate AI Caption</span>
                     </div>
                   </button>

                   <div className="flex flex-col gap-2">
                     <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-black ml-4">Caption</label>
                     <textarea 
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="w-full bg-surface-container-lowest text-on-surface p-6 rounded-md min-h-[160px] resize-none focus:outline-none placeholder:text-outline-variant font-body text-sm border-none shadow-xl"
                        placeholder="Engage your audience..."
                      />
                   </div>

                   <div className="flex flex-col gap-2">
                     <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-black ml-4">Hashtags</label>
                     <div className="relative">
                        <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-outline-variant">tag</span>
                        <input 
                          value={hashtags}
                          onChange={(e) => setHashtags(e.target.value)}
                          className="w-full bg-surface-container-lowest text-on-surface py-4 pl-14 pr-6 rounded-full focus:outline-none text-sm border-none shadow-xl"
                          placeholder="automation, design..."
                        />
                     </div>
                   </div>

                   {/* Publishing Loader */}
                   {isPublishing === reviewTask.id && (
                     <div className="p-4 bg-primary-container/10 rounded-2xl border border-primary-container/20 animate-in">
                        <p className="text-xs font-bold text-sp-primary mb-2 flex items-center gap-2">
                           <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                           {publishMessage}
                        </p>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-sp-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${publishProgress}%` }}
                          />
                        </div>
                     </div>
                   )}

                   <div className="flex gap-4 mt-4 pb-12">
                      <button className="flex-1 rounded-full border border-outline-variant/20 bg-transparent text-sp-primary font-bold text-sm py-4 active:scale-95">
                        Schedule
                      </button>
                      <button 
                        onClick={activePlatform === "instagram" ? handleInstagramPublish : handleWebsitePublish}
                        disabled={!!isPublishing}
                        className="flex-[2] rounded-full bg-gradient-to-br from-primary-container to-sp-primary text-black font-black text-sm py-4 shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined fill-1">send</span>
                        {isPublishing ? "Publishing..." : "Publish Now"}
                      </button>
                   </div>
                </section>
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
