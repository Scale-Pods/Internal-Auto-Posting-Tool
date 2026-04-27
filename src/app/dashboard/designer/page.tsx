"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  Palette, Upload, Check, AlertCircle, Loader2, ChevronRight,
  Image as ImageIcon, X, FileImage, RotateCcw, Eye, MessageSquare,
  Link as LinkIcon, PenTool
} from "lucide-react";

type Client = {
  id: string;
  business_name: string;
  status: string;
  content_json: any;
  design_urls: string[] | null;
  design_feedback: string | null;
  revision_history: any[] | null;
  figma_url: string | null;
  canva_url: string | null;
  export_source: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  "Content Approved": "text-emerald-600 bg-emerald-50 border-emerald-200",
  "Design In Progress": "text-blue-600 bg-blue-50 border-blue-200",
  "Design Ready for Review": "text-purple-600 bg-purple-50 border-purple-200",
  "Design Revision Requested": "text-rose-600 bg-rose-50 border-rose-200",
};

export default function DesignerModulePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  const [uploadMode, setUploadMode] = useState<"file" | "figma" | "canva">("file");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [designerName, setDesignerName] = useState("Senior Designer");
  const [activeTab, setActiveTab] = useState<"instagram" | "linkedin">("instagram");

  // Figma state
  const [figmaUrl, setFigmaUrl] = useState("");
  const [fetchingFigma, setFetchingFigma] = useState(false);

  // Canva state
  const [canvaUrl, setCanvaUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchClients();
    const id = setInterval(() => fetchClients(true), 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Generate previews when files change
    const urls = uploadFiles.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [uploadFiles]);

  const fetchClients = async (silent = false) => {
    if (!silent) setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("id, business_name, status, content_json, design_urls, design_feedback, revision_history, figma_url, canva_url, export_source")
      .in("status", ["Content Approved", "Design In Progress", "Design Ready for Review", "Design Revision Requested"]);
    
    if (error) {
      console.error("Error fetching clients:", error);
    }
    
    if (data) setClients(data);
    if (!silent) setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadFiles(prev => [...prev, ...Array.from(e.target.files!)]);
      setUploadError(null);
    }
  };

  const removeFile = (idx: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Convert external URLs to files to upload them to Supabase Storage
  async function urlsToFiles(urls: string[]): Promise<File[]> {
    const files: File[] = [];
    for (let i = 0; i < urls.length; i++) {
      const res = await fetch(urls[i]);
      const blob = await res.blob();
      files.push(new File([blob], `figma-export-${Date.now()}-${i}.png`, { type: blob.type }));
    }
    return files;
  }

  const handleUpload = async () => {
    if (!selectedClient) return;
    setUploading(true);
    setUploadError(null);

    try {
      let finalFiles = uploadFiles;
      let finalDesignUrls: string[] = [];
      let finalExportSource = "upload";
      let finalFigmaUrl = selectedClient.figma_url;
      let finalCanvaUrl = selectedClient.canva_url;

      if (uploadMode === "figma") {
        if (!figmaUrl.trim()) throw new Error("Please enter a Figma URL");
        setFetchingFigma(true);
        const res = await fetch("/api/figma-export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ figmaUrl }),
        });
        const data = await res.json();
        setFetchingFigma(false);
        if (!res.ok) throw new Error(data.error || "Failed to fetch from Figma API");
        
        // Exported successfully, now convert to files for upload
        finalFiles = await urlsToFiles(data.exportedUrls);
        finalExportSource = "figma";
        finalFigmaUrl = figmaUrl;
        finalCanvaUrl = null;
      } else if (uploadMode === "canva") {
        if (!canvaUrl.trim()) throw new Error("Please enter a Canva URL");
        // For Canva, we save the URL in canva_url but leave design_urls empty so the approval page shows a link button instead of an image.
        finalDesignUrls = []; 
        finalExportSource = "canva";
        finalCanvaUrl = canvaUrl;
        finalFigmaUrl = null;
        finalFiles = []; 
      } else {
        if (uploadFiles.length === 0) throw new Error("Please select files to upload");
        finalExportSource = "upload";
        finalFigmaUrl = null;
        finalCanvaUrl = null;
      }

      // Upload files to Supabase if any
      const storageUrls: string[] = [];
      if (finalFiles.length > 0) {
        for (let i = 0; i < finalFiles.length; i++) {
          const file = finalFiles[i];
          const ext = file.name.split(".").pop() || "png";
          const path = `${selectedClient.id}/${Date.now()}-${i}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from("designs")
            .upload(path, file, { upsert: true, contentType: file.type });
          if (upErr) throw new Error(upErr.message);
          const { data: urlData } = supabase.storage.from("designs").getPublicUrl(path);
          if (urlData?.publicUrl) storageUrls.push(urlData.publicUrl);
        }
      }

      if (storageUrls.length > 0) {
        finalDesignUrls = storageUrls;
      }

      // We need to update content_deliverables too for this client
      const { data: dData } = await supabase
        .from("content_deliverables")
        .select("id")
        .eq("client_id", selectedClient.id)
        .in("status", ["Pending Design", "Awaiting Review", "Rework Needed"]);

      if (dData && dData.length > 0) {
        for (const d of dData) {
          await supabase.from("content_deliverables").update({
            media_url: finalDesignUrls.join(","),
            status: "Awaiting Review",
            figma_url: finalFigmaUrl,
            canva_url: finalCanvaUrl,
            export_source: finalExportSource
          }).eq("id", d.id);
        }
      }

      // Update clients table
      await supabase.from("clients").update({
        design_urls: finalDesignUrls,
        status: "Design Ready for Review",
        design_submitted_by: designerName,
        figma_url: finalFigmaUrl,
        canva_url: finalCanvaUrl,
        export_source: finalExportSource
      }).eq("id", selectedClient.id);

      setClients(prev => prev.map(c =>
        c.id === selectedClient.id ? { 
          ...c, 
          design_urls: finalDesignUrls, 
          status: "Design Ready for Review",
          figma_url: finalFigmaUrl,
          canva_url: finalCanvaUrl,
          export_source: finalExportSource
        } : c
      ));

      setUploadFiles([]);
      setPreviews([]);
      setFigmaUrl("");
      setCanvaUrl("");
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setFetchingFigma(false);
    }
  };

  const parsedContent = (() => {
    if (!selectedClient?.content_json) return null;
    try {
      return typeof selectedClient.content_json === "string"
        ? JSON.parse(selectedClient.content_json)
        : selectedClient.content_json;
    } catch { return null; }
  })();

  const platformData = parsedContent?.[activeTab];

  const statCounts = {
    pending: clients.filter(c => c.status === "Content Approved").length,
    inProgress: clients.filter(c => c.status === "Design In Progress").length,
    reviewing: clients.filter(c => c.status === "Design Ready for Review").length,
    revision: clients.filter(c => c.status === "Design Revision Requested").length,
  };

  return (
    <div className="min-h-screen bg-[#F8F7F5] p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-h2 text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shadow-sm">
              <Palette className="w-5 h-5" />
            </div>
            Designer Module
          </h1>
          <p className="text-slate-500 mt-1">Review AI content specs and submit designs via File Upload, Figma, or Canva.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Name:</label>
          <input
            value={designerName}
            onChange={e => setDesignerName(e.target.value)}
            className="text-sm font-bold text-slate-900 w-32 focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "New Jobs", value: statCounts.pending, color: "text-emerald-600" },
          { label: "In Progress", value: statCounts.inProgress, color: "text-blue-600" },
          { label: "Under Review", value: statCounts.reviewing, color: "text-purple-600" },
          { label: "Revisions", value: statCounts.revision, color: "text-rose-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-3xl font-metric-lg ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Job Queue */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-sm h-[calc(100vh-250px)]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-sm">Job Queue</h2>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{clients.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 text-slate-300 animate-spin" /></div>
            ) : clients.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No approved content in queue.</div>
            ) : (
              clients.map(client => (
                <button
                  key={client.id}
                  onClick={() => { setSelectedClientId(client.id); setUploadFiles([]); setUploadError(null); setFigmaUrl(client.figma_url || ""); setCanvaUrl(client.canva_url || ""); setUploadMode(client.export_source as any || "file"); }}
                  className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between group ${selectedClient?.id === client.id ? "bg-primary/5 border-primary/20 shadow-sm border-l-4 border-l-primary" : "border border-transparent border-l-4 border-l-transparent hover:bg-slate-50"}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${selectedClient?.id === client.id ? "text-primary" : "text-slate-800"}`}>{client.business_name}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border mt-1.5 ${STATUS_COLORS[client.status] || "text-slate-500 bg-slate-50 border-slate-200"}`}>
                      {client.status === "Design Revision Requested" && <RotateCcw className="w-2.5 h-2.5" />}
                      {client.status}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ml-2 ${selectedClient?.id === client.id ? "text-primary" : "text-slate-300"}`} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Content Spec + Upload */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-[calc(100vh-250px)] overflow-y-auto">
          {!selectedClient ? (
            <div className="bg-white border border-slate-200 rounded-xl flex items-center justify-center p-16 shadow-sm text-center h-full">
              <div>
                <Palette className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="font-semibold text-slate-600 text-lg">Select a job from the queue</p>
                <p className="text-sm text-slate-400 mt-1">View the AI brief and upload your completed design</p>
              </div>
            </div>
          ) : (
            <>
              {/* Revision feedback banner */}
              {selectedClient.status === "Design Revision Requested" && selectedClient.design_feedback && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3 shadow-sm">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-rose-800 text-sm">Revision Requested</p>
                    <p className="text-sm text-rose-700 mt-1">{selectedClient.design_feedback}</p>
                  </div>
                </div>
              )}

              {/* Content Reference Panel */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm shrink-0">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <h3 className="font-bold text-slate-800 text-sm">Content Brief — {selectedClient.business_name}</h3>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    {["instagram", "linkedin"].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-1.5 text-xs font-bold capitalize transition-all rounded-md ${activeTab === tab ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        {tab === "instagram" ? "📸 IG" : "💼 LI"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-5 space-y-6">
                  {!parsedContent ? (
                    <p className="text-slate-400 italic text-sm text-center py-8">No content spec available.</p>
                  ) : !platformData ? (
                    <p className="text-slate-400 italic text-sm text-center py-8">No {activeTab} content found.</p>
                  ) : (
                    platformData.map((post: any, idx: number) => (
                      <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                          <span className="font-bold text-base text-slate-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary" /> {post.format}
                          </span>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Post #{idx + 1}</span>
                        </div>
                        <div className="p-5 space-y-5">
                          {post.slides?.map((slide: any, sIdx: number) => (
                            <div key={sIdx} className="bg-slate-50/50 rounded-xl p-5 border border-slate-200">
                              <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">SLIDE {slide.slide_number || sIdx + 1}</p>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Visual</p>
                                  <p className="text-base text-slate-800 leading-relaxed">{slide.visual_description}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Text on Image</p>
                                  <p className="text-lg font-bold text-slate-900 bg-white px-4 py-3 rounded-lg border border-slate-200 leading-relaxed">{slide.text_on_image}</p>
                                </div>
                                {slide.designer_notes && (
                                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1.5">Designer Notes</p>
                                    <p className="text-sm text-amber-900 font-medium leading-relaxed">{slide.designer_notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          <div className="pt-4 border-t border-slate-200">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> Caption</p>
                            <p className="text-base text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">{post.caption}</p>
                          </div>
                          {post.hashtags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {post.hashtags.map((tag: string, ti: number) => (
                                <span key={ti} className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Upload Panel */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm shrink-0">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <h3 className="font-bold text-slate-800 text-sm">Submit Completed Design</h3>
                  </div>
                </div>
                <div className="p-5 space-y-5">

                  {/* Upload Mode Tabs */}
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    {[
                      { id: "file", label: "File Upload", icon: FileImage },
                      { id: "figma", label: "Figma Link", icon: PenTool },
                      { id: "canva", label: "Canva Link", icon: LinkIcon }
                    ].map(mode => {
                      const Icon = mode.icon;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => { setUploadMode(mode.id as any); setUploadError(null); }}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold transition-all rounded-md ${uploadMode === mode.id ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                          <Icon className="w-4 h-4" /> {mode.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Mode Content */}
                  <div className="min-h-[160px]">
                    {uploadMode === "file" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center gap-3 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                        >
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileImage className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 text-sm">Click to select files</p>
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP — up to 50MB each</p>
                          </div>
                        </div>
                        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />

                        {uploadFiles.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Files ({uploadFiles.length})</p>
                            <div className="flex gap-3 flex-wrap">
                              {previews.map((src, i) => (
                                <div key={i} className="relative group">
                                  <img src={src} alt="" className="w-20 h-20 object-cover rounded-xl border border-slate-200 group-hover:border-primary/50 transition-colors" />
                                  <button onClick={() => removeFile(i)} className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-md flex items-center justify-center hover:bg-rose-600 transition-colors shadow-sm">
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {uploadMode === "figma" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                          <PenTool className="w-5 h-5 text-blue-500 shrink-0" />
                          <div>
                            <p className="font-bold text-blue-800 text-sm">Auto-Export via Figma API</p>
                            <p className="text-xs text-blue-700 mt-1 mb-3">Paste a Figma file or frame link. We will automatically fetch the design and save it as PNGs for review.</p>
                            <button 
                              onClick={() => {
                                const token = prompt("Please enter your Figma Personal Access Token:\n\n(You can get one in Figma -> Settings -> Personal Access Tokens)");
                                if (token) {
                                  document.cookie = `figma_access_token=${token}; path=/; max-age=31536000; SameSite=Lax`;
                                  alert("Figma token saved successfully! You can now auto-export designs.");
                                }
                              }}
                              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors shadow-sm"
                            >
                              <PenTool className="w-3.5 h-3.5" /> Connect Figma Token
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Figma URL</label>
                          <input
                            type="text"
                            value={figmaUrl}
                            onChange={(e) => setFigmaUrl(e.target.value)}
                            placeholder="https://www.figma.com/design/..."
                            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {uploadMode === "canva" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex gap-3">
                          <LinkIcon className="w-5 h-5 text-purple-500 shrink-0" />
                          <div>
                            <p className="font-bold text-purple-800 text-sm">Canva Link Sharing</p>
                            <p className="text-xs text-purple-700 mt-1">Paste your Canva View-Only link. The client will be able to review the design via the Canva link.</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Canva View Link</label>
                          <input
                            type="text"
                            value={canvaUrl}
                            onChange={(e) => setCanvaUrl(e.target.value)}
                            placeholder="https://www.canva.com/design/..."
                            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {uploadError}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400">Status will change to <strong className="text-slate-600">Review</strong></p>
                    <button
                      onClick={handleUpload}
                      disabled={uploading || fetchingFigma}
                      className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-orange-600 disabled:bg-slate-300 text-white font-bold text-sm rounded-lg transition-all shadow-sm"
                    >
                      {uploading || fetchingFigma ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> {fetchingFigma ? "Fetching from Figma..." : "Submitting..."}</>
                      ) : (
                        <><Check className="w-4 h-4" /> Submit for Review</>
                      )}
                    </button>
                  </div>

                  {/* Show previous uploads/links if any */}
                  {(selectedClient.design_urls || selectedClient.figma_url || selectedClient.canva_url) && (
                    <div className="pt-4 mt-4 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Previously Submitted</p>
                      <div className="flex gap-3 flex-wrap items-center">
                        {selectedClient.design_urls?.map((url, i) => {
                          const isImg = url.includes(".png") || url.includes(".jpg") || url.includes(".webp") || !url.startsWith("http");
                          return isImg ? (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 hover:border-primary/50 transition-all shadow-sm block">
                              <img src={url} alt={`Design ${i + 1}`} className="w-full h-full object-cover" />
                            </a>
                          ) : null;
                        })}
                        {selectedClient.figma_url && (
                          <a href={selectedClient.figma_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                            <PenTool className="w-4 h-4" /> Figma Link
                          </a>
                        )}
                        {selectedClient.canva_url && (
                          <a href={selectedClient.canva_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors">
                            <LinkIcon className="w-4 h-4" /> Canva Link
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
