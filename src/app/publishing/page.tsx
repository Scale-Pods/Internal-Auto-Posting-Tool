"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
  ItemGroup
} from "@/components/ui/item"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"

type Platform = "instagram" | "website" | "linkedin";

const PLATFORM_TABS: { id: Platform; label: string; icon: string }[] = [
  { id: "instagram", label: "Instagram", icon: "photo_camera" },
  { id: "website", label: "Website", icon: "language" },
  { id: "linkedin", label: "LinkedIn", icon: "work" },
];

export default function PublishingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Client");
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [publishedItems, setPublishedItems] = useState<any[]>([]);
  const [activePlatform, setActivePlatform] = useState<Platform>("instagram");

  // Publishing States
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [reviewTask, setReviewTask] = useState<any | null>(null);

  // ── Instagram Modal State ──
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
  const [publishMessage, setPublishMessage] = useState("Uploading media content and posting...");

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

    if (error) { console.error("Fetch error:", error); return; }
    const items = data || [];
    setDeliverables(items.filter((d) => d.status === "Ready for Publishing"));
    setPublishedItems(items.filter((d) => d.status === "Published"));
  }

  // Filter ready items by active platform
  const filteredDeliverables = deliverables.filter((d) => {
    const target = d.platform_target || "instagram";
    if (activePlatform === "instagram") return target === "instagram" || target === "Instagram";
    if (activePlatform === "website") return target === "website";
    if (activePlatform === "linkedin") return target === "linkedin";
    return false;
  });

  function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function handleOpenReview(task: any) {
    setReviewTask(task);
    if (activePlatform === "instagram") {
      setCaption(task.topic || "");
      setHashtags("");
      if (task.media_url && task.media_url.includes(",")) {
        setPostType("CAROUSEL");
      } else {
        setPostType("FEED");
      }
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
    setPostType("FEED");
    setCarouselIndex(0);
    setCaption(""); setHashtags("");
    setWebTitle(""); setWebSlug(""); setWebExcerpt(""); setWebCategory("insights");
    setWebTags(""); setWebBody(""); setWebCtaLabel("Learn More"); setWebCtaUrl("https://scalepods.co/contact");
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
      if (!res.ok) throw new Error((await res.json()).error || "AI request failed");
      const data = await res.json();
      if (activePlatform === "instagram") {
        if (data.caption) setCaption(data.caption);
        if (data.hashtags) setHashtags(data.hashtags);
      } else if (activePlatform === "website") {
        if (data.caption) setWebExcerpt(data.caption.slice(0, 200));
      }
    } catch (err: any) {
      alert("AI generation failed: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  }

  // ── Instagram Publish ──
  async function handleInstagramPublish() {
    if (!reviewTask) return;
    const taskId = reviewTask.id;
    setIsPublishing(taskId);
    setPublishProgress(0);
    setPublishMessage("Connecting to API...");
    const finalCaption = hashtags ? `${caption}\n\n${hashtags}` : caption;
    
    const urls = reviewTask.media_url ? reviewTask.media_url.split(",") : [];
    const isVideo = urls.some((u: string) => u.toLowerCase().endsWith(".mp4"));
    const isCarousel = urls.length > 1;
    
    try {
      const res = await fetch("/api/publish-instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          media_url: reviewTask.media_url, 
          caption: postType === "STORY" ? "" : finalCaption,
          media_type: postType === "STORY" ? "STORIES" : (isCarousel ? "CAROUSEL" : (isVideo ? "REELS" : "IMAGE"))
        }),
      });

      if (!res.body) throw new Error("Streaming not supported or failed to connect to API.");
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let finalData: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const events = chunk.split("\n\n");
        
        for (const ev of events) {
          if (ev.startsWith("data: ")) {
            try {
              const data = JSON.parse(ev.slice(6));
              
              if (data.progress) setPublishProgress(data.progress);
              if (data.message) setPublishMessage(data.message);
              
              if (data.success) {
                  finalData = data;
              }
              if (data.error) {
                  throw new Error(data.details?.message || "Publish failed");
              }
            } catch(e) {
               // Ignore partial json chunks if any
            }
          }
        }
      }

      if (!finalData) throw new Error("API stream closed unexpectedly.");

      // Success! 
      setPublishProgress(100);
      setPublishMessage("Success!");
      await new Promise((resolve) => setTimeout(resolve, 800));

      await supabase.from("content_deliverables").update({ 
        status: "Published", 
        topic: finalCaption,
        rework_comments: JSON.stringify({ ig_post_id: finalData.ig_post_id, ig_post_url: finalData.ig_post_url })
      }).eq("id", taskId);
      alert(`🚀 Posted to Instagram!\n${finalData.ig_post_url}`);
      setDeliverables((prev) => prev.filter((d) => d.id !== taskId));
      setPublishedItems((prev) => [{ ...reviewTask, status: "Published" }, ...prev]);
      handleCloseReview();
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setPublishProgress(0);
      setIsPublishing(null);
    }
  }

  // ── Website Publish ──
  async function handleWebsitePublish() {
    if (!reviewTask) return;
    const taskId = reviewTask.id;
    setIsPublishing(taskId);
    try {
      const res = await fetch("/api/publish-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: webTitle,
          excerpt: webExcerpt,
          body: webBody,
          hero_image: reviewTask.media_url,
          category: webCategory,
          tags: webTags.split(",").map((t) => t.trim()).filter(Boolean),
          cta_label: webCtaLabel,
          cta_url: webCtaUrl,
          deliverable_id: taskId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.details || data.error || "Website publish failed");

      await supabase.from("content_deliverables").update({ 
        status: "Published",
        rework_comments: JSON.stringify({ website_url: data.url, website_slug: data.slug })
      }).eq("id", taskId);
      
      setDeliverables((prev) => prev.filter((d) => d.id !== taskId));
      setPublishedItems((prev) => [{ ...reviewTask, status: "Published", rework_comments: JSON.stringify({ website_url: data.url, website_slug: data.slug }) }, ...prev]);
      handleCloseReview();
      alert(`🌐 Live on Scalepods!\nURL: ${data.url}`);
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setIsPublishing(null);
    }
  }

  // Count per platform
  const counts = {
    instagram: deliverables.filter((d) => !d.platform_target || d.platform_target === "instagram" || d.platform_target === "Instagram").length,
    website: deliverables.filter((d) => d.platform_target === "website").length,
    linkedin: deliverables.filter((d) => d.platform_target === "linkedin").length,
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sp-secondary/10 border border-sp-secondary/20 text-sp-secondary text-[10px] font-bold uppercase tracking-widest mb-3">
              Publishing Engine
            </div>
            <h1 className="text-3xl font-[900] text-white tracking-tight">Ready to Post</h1>
            <p className="text-sm text-on-surface-variant mt-1 max-w-xl">
              Design, review and publish content platform by platform.
            </p>
          </div>
          <Link href="/" className="text-sm font-bold text-sp-primary hover:underline flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Dashboard
          </Link>
        </div>

        {/* Platform Tabs */}
        <div className="flex items-center gap-1 mt-6 border-b border-white/5">
          {PLATFORM_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePlatform(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all relative ${
                activePlatform === tab.id
                  ? "text-white"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
              {counts[tab.id] > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activePlatform === tab.id
                    ? "bg-sp-primary text-black"
                    : "bg-white/10 text-gray-400"
                }`}>
                  {counts[tab.id]}
                </span>
              )}
              {activePlatform === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sp-primary rounded-t-full" />
              )}
              {tab.id === "linkedin" && (
                <span className="text-[9px] font-bold bg-white/5 text-gray-500 px-1.5 py-0.5 rounded uppercase">Soon</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="px-8 pt-6 pb-12 w-full max-w-6xl">
        {activePlatform === "linkedin" ? (
          <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center">
            <span className="material-symbols-outlined text-6xl text-gray-700 mb-4">work</span>
            <h3 className="text-xl font-bold text-white">LinkedIn Publishing</h3>
            <p className="text-on-surface-variant max-w-sm mt-2">LinkedIn integration is coming in the next phase. Stay tuned!</p>
          </div>
        ) : filteredDeliverables.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center">
            <span className="material-symbols-outlined text-6xl text-gray-700 mb-4">
              {activePlatform === "instagram" ? "photo_camera" : "language"}
            </span>
            <h3 className="text-xl font-bold text-white">No {activePlatform === "instagram" ? "Instagram" : "Website"} Posts Ready</h3>
            <p className="text-on-surface-variant max-w-sm mt-2">
              {activePlatform === "instagram"
                ? "Upload designs in the Designer portal and set the platform to Instagram."
                : "Upload designs in the Designer portal and set the platform to Website Social Feed."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeliverables.map((item) => (
              <div key={item.id} className="bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden group flex flex-col relative">
                {/* Media Preview */}
                <div className="w-full aspect-[4/3] bg-surface-container-highest relative flex items-center justify-center border-b border-white/5 overflow-hidden">
                  {item.media_url ? (
                    (() => {
                      const firstUrl = item.media_url.split(",")[0];
                      const isMulti = item.media_url.includes(",");
                      return (
                        <>
                          {firstUrl.toLowerCase().endsWith(".mp4") ? (
                            <div className="w-full h-full relative cursor-pointer" onClick={(e) => { e.currentTarget.querySelector('video')?.play() }}>
                              <video src={firstUrl} className="w-full h-full object-cover" muted loop playsInline />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                                 <span className="material-symbols-outlined text-4xl text-white drop-shadow-md">play_circle</span>
                              </div>
                            </div>
                          ) : (
                            <img src={firstUrl} alt={item.task_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          )}
                          {isMulti && (
                             <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 flex items-center gap-1 z-10 shadow-lg">
                               <span className="material-symbols-outlined text-[14px] text-white">view_carousel</span>
                               <span className="text-[10px] font-bold text-white leading-none">{item.media_url.split(",").length}</span>
                             </div>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <span className="material-symbols-outlined text-6xl text-white/10">image</span>
                  )}
                  {/* Platform Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg border flex items-center gap-1.5 backdrop-blur-md ${
                    activePlatform === "instagram"
                      ? "bg-gradient-to-r from-purple-900/80 to-pink-900/80 border-purple-500/30"
                      : "bg-blue-900/80 border-blue-500/30"
                  }`}>
                    <span className="material-symbols-outlined text-[14px] text-white">
                      {activePlatform === "instagram" ? "photo_camera" : "language"}
                    </span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                      {activePlatform === "instagram" ? "Instagram" : "Website"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs font-bold text-sp-primary mb-1 uppercase tracking-widest">{item.clients?.business_name || "Unknown Client"}</p>
                  <h3 className="text-lg font-bold text-white leading-tight mb-2">{item.task_name}</h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mb-4">{item.topic}</p>
                  <div className="mt-auto">
                    <button
                      onClick={() => handleOpenReview(item)}
                      className="w-full bg-white/10 text-white border border-white/20 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit_note</span>
                      Review & Publish
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Publishing History */}
      <div className="px-8 pb-16 w-full max-w-6xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-sp-tertiary">history</span>
          Publishing History
        </h2>
        <div className="bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#1c1b1b] text-xs text-on-surface-variant uppercase tracking-widest font-bold border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Content</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Platform</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 flex-1 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {publishedItems.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant">No publishing history yet.</td></tr>
                ) : (
                  publishedItems.map((row) => (
                    <tr key={row.id} className="hover:bg-surface-container-high transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-black/40 overflow-hidden shrink-0 flex items-center justify-center border border-white/5 relative">
                          {row.media_url ? (
                            row.media_url.includes(",") ? (
                              <>
                                <img src={row.media_url.split(",")[0]} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-x-0 bottom-0 py-0.5 bg-black/60 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[10px] text-white">view_carousel</span>
                                </div>
                              </>
                            ) : (
                              row.media_url.endsWith(".mp4") ? (
                                <video src={row.media_url} className="w-full h-full object-cover" muted />
                              ) : (
                                <img src={row.media_url} alt="" className="w-full h-full object-cover" />
                              )
                            )
                          ) : (
                            <span className="material-symbols-outlined text-gray-500 text-sm">description</span>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{row.task_name}</span>
                          <span className="text-[10px] text-on-surface-variant line-clamp-1 max-w-[250px]">{row.topic}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">{row.clients?.business_name || "Unknown"}</td>
                      <td className="px-6 py-4">
                        <span className="bg-white/5 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider text-gray-300">
                          {row.platform_target || row.platform || "Instagram"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2 text-sp-secondary font-bold text-xs uppercase tracking-wider mb-2">
                          <span className="material-symbols-outlined text-sm">check_circle</span>Published
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {(() => {
                            let url = ""; let id = "";
                            try {
                              const meta = JSON.parse(row.rework_comments || "{}");
                              url = meta.ig_post_url || meta.website_url || "";
                              id = meta.ig_post_id || meta.website_slug || "";
                            } catch (e) {}

                            const isWebsite = row.platform_target === "website";

                            return (
                              <>
                                {url && (
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 bg-sp-primary/10 text-sp-primary hover:bg-sp-primary hover:text-black rounded-lg transition-colors flex items-center" title="View Post">
                                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                  </a>
                                )}
                                <button 
                                  onClick={async () => {
                                    const platform = row.platform_target || row.platform || "instagram";
                                    const isIG = platform.toLowerCase().includes("instagram") || (!isWebsite);
                                    
                                    const confirmMsg = isIG
                                      ? "This will remove the post from Agency OS database.\n\n⚠️ Note: Instagram does NOT allow deleting posts via API. After removing from the database, you'll be redirected to the post on Instagram where you can delete it manually (tap ⋯ → Delete).\n\nContinue?"
                                      : "Are you sure? This will delete the post from the database and the live website.";
                                    
                                    if (!confirm(confirmMsg)) return;
                                    
                                    try {
                                      setIsPublishing(row.id);
                                      
                                      // For website posts, delete from website_content table too
                                      if (isWebsite && id) {
                                        await supabase.from("website_content").delete().eq("slug", id);
                                      }
                                      
                                      // Delete from Agency OS database
                                      await supabase.from("content_deliverables").delete().eq("id", row.id);
                                      setPublishedItems(prev => prev.filter(p => p.id !== row.id));
                                      
                                      if (isIG && url) {
                                        // Open Instagram post so user can manually delete
                                        alert("✅ Removed from Agency OS!\n\nOpening Instagram now — tap the ⋯ menu on the post and select 'Delete' to remove it from Instagram too.");
                                        window.open(url, "_blank");
                                      } else if (isIG) {
                                        alert("✅ Removed from Agency OS!\n\n⚠️ To also delete from Instagram, open the Instagram app, find the post, tap ⋯ → Delete.");
                                      } else {
                                        alert("🗑️ Post deleted from database and live website!");
                                      }
                                    } catch (err: any) {
                                      alert("Error deleting: " + err.message);
                                    } finally {
                                      setIsPublishing(null);
                                    }
                                  }}
                                  className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors flex items-center" title="Delete Post"
                                >
                                  {isPublishing === row.id ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  ) : (
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                  )}
                                </button>
                              </>
                            );
                          })()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* REVIEW MODAL                                    */}
      {/* ═══════════════════════════════════════════════ */}
      {reviewTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-surface border border-white/10 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
            
            <button onClick={handleCloseReview} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>

            {/* Left — Media Preview */}
            <div className="w-full md:w-1/2 bg-surface-container-highest border-r border-white/5 flex items-center justify-center p-6 relative">
              {(() => {
                if (!reviewTask.media_url) return (
                  <div className="text-on-surface-variant flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-6xl text-white/10">image_not_supported</span>
                    <p className="text-sm">No media available</p>
                  </div>
                );
                
                const urls = reviewTask.media_url.split(",");
                const currentUrl = urls[carouselIndex];
                const isMulti = urls.length > 1;

                return (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {currentUrl.toLowerCase().endsWith(".mp4") ? (
                      <video src={currentUrl} controls className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-lg border border-white/10" />
                    ) : (
                      <img src={currentUrl} alt="Preview" className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-lg border border-white/10" />
                    )}
                    
                    {isMulti && (
                      <>
                        <button 
                          onClick={() => setCarouselIndex(prev => prev > 0 ? prev - 1 : urls.length - 1)}
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 rounded-full text-white flex items-center justify-center hover:bg-black/90 transition-all border border-white/20 shadow-xl z-20 backdrop-blur-md"
                        >
                          <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button 
                          onClick={() => setCarouselIndex(prev => prev < urls.length - 1 ? prev + 1 : 0)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 rounded-full text-white flex items-center justify-center hover:bg-black/90 transition-all border border-white/20 shadow-xl z-20 backdrop-blur-md"
                        >
                          <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                        
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                           {urls.map((_: any, idx: number) => (
                             <div key={idx} className={`h-2 rounded-full transition-all ${idx === carouselIndex ? 'w-6 bg-sp-primary' : 'w-2 bg-white/50'}`} />
                           ))}
                        </div>
                        <div className="absolute top-4 left-4 z-20 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 shadow-lg">
                           <span className="material-symbols-outlined text-[14px] text-sp-primary">view_carousel</span>
                           <span className="text-[10px] font-bold text-white uppercase tracking-wider">{carouselIndex + 1} / {urls.length}</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Right — Form */}
            <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-[#161616]">
              {/* Modal Header */}
              <div className="mb-6">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-widest mb-2 ${
                  activePlatform === "instagram"
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-blue-500/20 text-blue-300"
                }`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {activePlatform === "instagram" ? "photo_camera" : "language"}
                  </span>
                  {activePlatform === "instagram" ? "Instagram Post" : "Website Social Feed"}
                </span>
                <h2 className="text-2xl font-[900] text-white tracking-tight">{reviewTask.task_name}</h2>
                <p className="text-sm font-medium text-sp-tertiary mt-1">Client: {reviewTask.clients?.business_name}</p>
              </div>

              {/* ── INSTAGRAM FIELDS ── */}
              {activePlatform === "instagram" && (
                <>
                  {/* Post Type Selector */}
                  <div className="mb-6 flex gap-2 p-1 bg-surface-container-high border border-white/10 rounded-lg">
                    {reviewTask.media_url?.includes(",") ? (
                       <button 
                         onClick={() => setPostType("CAROUSEL")} 
                         className={`flex-1 py-2 text-xs uppercase tracking-wider font-bold rounded flex items-center justify-center gap-2 transition-all bg-sp-primary text-black shadow-md`}
                       >
                         <span className="material-symbols-outlined text-[18px]">view_carousel</span>
                         Carousel ({reviewTask.media_url.split(",").length} Items)
                       </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => setPostType("FEED")} 
                          className={`flex-1 py-1.5 text-xs uppercase tracking-wider font-bold rounded flex items-center justify-center gap-1.5 transition-all ${postType === "FEED" ? "bg-sp-primary text-black shadow-md" : "text-gray-400 hover:text-white"}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">grid_on</span>
                          Feed / Reel
                        </button>
                        <button 
                          onClick={() => setPostType("STORY")} 
                          className={`flex-1 py-1.5 text-xs uppercase tracking-wider font-bold rounded flex items-center justify-center gap-1.5 transition-all ${postType === "STORY" ? "bg-[#9b51e0] text-white shadow-md" : "text-gray-400 hover:text-white"}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">amp_stories</span>
                          Story (24hr)
                        </button>
                      </>
                    )}
                  </div>

                  {(postType === "FEED" || postType === "CAROUSEL") && (
                    <>
                      {/* AI Generate Button */}
                      <button
                        onClick={generateAIContent}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-[#9b51e0] to-[#6a11cb] hover:from-[#a76ced] hover:to-[#7824d6] text-white font-bold text-sm shadow-xl transition-all disabled:opacity-50 mb-6"
                      >
                        {isGenerating ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                        )}
                        {isGenerating ? "Generating..." : "✨ AI Generate Caption"}
                      </button>

                      <div className="flex-1 mb-4">
                        <label className="text-xs uppercase font-bold text-on-surface-variant tracking-widest mb-2 block">Post Caption</label>
                        <textarea
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          placeholder="Write an engaging caption..."
                          rows={6}
                          className="w-full bg-surface-container-high border border-white/10 rounded-xl p-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-sp-primary/50 resize-none"
                        />
                      </div>
                      <div className="mb-6">
                        <label className="text-xs uppercase font-bold text-on-surface-variant tracking-widest mb-2 block">Hashtags</label>
                        <input
                          type="text"
                          value={hashtags}
                          onChange={(e) => setHashtags(e.target.value)}
                          placeholder="#Automation #AIWorkflows #ScalePods"
                          className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-sm text-sp-tertiary focus:outline-none focus:border-sp-primary/50"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ── WEBSITE FIELDS ── */}
              {activePlatform === "website" && (
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-xs uppercase font-bold text-on-surface-variant tracking-widest mb-1.5 block">Title *</label>
                    <input
                      type="text"
                      value={webTitle}
                      onChange={(e) => { setWebTitle(e.target.value); setWebSlug(slugify(e.target.value)); }}
                      className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sp-primary/50"
                      placeholder="e.g. 5 Ways to Automate Your Sales Funnel"
                    />
                  </div>
                  {/* Slug */}
                  <div>
                    <label className="text-xs uppercase font-bold text-on-surface-variant tracking-widest mb-1.5 block">URL Slug</label>
                    <div className="flex items-center bg-surface-container-high border border-white/10 rounded-lg overflow-hidden">
                      <span className="text-xs text-gray-500 px-3 border-r border-white/10 whitespace-nowrap">/social-feed/</span>
                      <input
                        type="text"
                        value={webSlug}
                        onChange={(e) => setWebSlug(e.target.value)}
                        className="flex-1 bg-transparent p-3 text-sm text-sp-tertiary focus:outline-none"
                      />
                    </div>
                  </div>
                  {/* Excerpt */}
                  <div>
                    <label className="text-xs uppercase font-bold text-on-surface-variant tracking-widest mb-1.5 block">
                      Excerpt <span className="text-gray-500 font-normal normal-case">({webExcerpt.length}/200 chars)</span>
                    </label>
                    <textarea
                      value={webExcerpt}
                      onChange={(e) => setWebExcerpt(e.target.value.slice(0, 200))}
                      rows={3}
                      placeholder="A short teaser shown on the Social Feed card..."
                      className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-sm text-white resize-none focus:outline-none focus:border-sp-primary/50"
                    />
                  </div>
                  {/* Category + Tags */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs uppercase font-bold text-on-surface-variant tracking-widest mb-1.5 block">Category</label>
                      <select
                        value={webCategory}
                        onChange={(e) => setWebCategory(e.target.value)}
                        className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none"
                      >
                        <option value="insights">💡 Insights</option>
                        <option value="case-study">📊 Case Study</option>
                        <option value="product-update">🚀 Product Update</option>
                        <option value="social">📸 Social</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase font-bold text-on-surface-variant tracking-widest mb-1.5 block">Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={webTags}
                        onChange={(e) => setWebTags(e.target.value)}
                        placeholder="AI, automation, n8n"
                        className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  {/* Body */}
                  <div>
                    <label className="text-xs uppercase font-bold text-on-surface-variant tracking-widest mb-1.5 block">
                      Body Content <span className="text-gray-500 font-normal normal-case">(optional long-form)</span>
                    </label>
                    <textarea
                      value={webBody}
                      onChange={(e) => setWebBody(e.target.value)}
                      rows={4}
                      placeholder="Full article text, markdown supported..."
                      className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-sm text-white resize-none focus:outline-none focus:border-sp-primary/50"
                    />
                  </div>
                  {/* CTA */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs uppercase font-bold text-on-surface-variant tracking-widest mb-1.5 block">CTA Label</label>
                      <input
                        type="text"
                        value={webCtaLabel}
                        onChange={(e) => setWebCtaLabel(e.target.value)}
                        placeholder="Book a Call"
                        className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-bold text-on-surface-variant tracking-widest mb-1.5 block">CTA URL</label>
                      <input
                        type="text"
                        value={webCtaUrl}
                        onChange={(e) => setWebCtaUrl(e.target.value)}
                        placeholder="https://scalepods.co/contact"
                        className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isPublishing === reviewTask.id ? (
                <div className="mt-6 flex w-full flex-col gap-4 [--radius:1rem]">
                  <Item variant="outline" className="bg-surface-container-high border-white/10">
                    <ItemMedia variant="icon" className="bg-[#9b51e0]/20 text-[#a76ced] border-white/5 h-10 w-10">
                      <Spinner />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="text-white">Publishing to {activePlatform}...</ItemTitle>
                      <ItemDescription className="text-gray-400">
                        {publishMessage}
                      </ItemDescription>
                    </ItemContent>
                    <ItemFooter className="mt-2">
                      <Progress value={publishProgress} className="h-2 bg-black/40" />
                    </ItemFooter>
                  </Item>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button onClick={handleCloseReview} className="py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors text-sm">
                    Cancel
                  </button>
                  <button
                    onClick={activePlatform === "instagram" ? handleInstagramPublish : handleWebsitePublish}
                    className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transition-colors text-sm ${
                      activePlatform === "instagram"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-[0_0_20px_rgba(167,114,237,0.3)]"
                        : "bg-sp-secondary text-black hover:bg-[#20bda9] shadow-[0_0_20px_rgba(45,212,191,0.2)]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {activePlatform === "instagram" ? "photo_camera" : "language"}
                    </span>
                    {activePlatform === "instagram" ? "Post to Instagram" : "Publish to Website"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
