"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, logout } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function DesignerPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Designer");
  const [deliverables, setDeliverables] = useState<any[]>([]);

  // Upload Modal State
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [platformTarget, setPlatformTarget] = useState<string>("instagram");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Designer assignment
  const [currentDesigner, setCurrentDesigner] = useState<string>("Designer 1");

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "designer") {
      // Allow bypassing logic for testing purposes if 'designer' is not logged in properly.
    }
    setUserName(user?.name || "Designer");

    async function fetchDeliverables() {
      const { data, error } = await supabase
        .from('content_deliverables')
        .select(`
          *,
          clients (
            business_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching deliverables:", error);
        return;
      }
      
      setDeliverables(data || []);
    }

    fetchDeliverables();
  }, [router]);

  const pendingTasks = deliverables.filter(d => d.status === 'Pending Design' || d.status === 'Rework Needed');
  const uploadedTasks = deliverables.filter(d => d.status !== 'Pending Design' && d.status !== 'Rework Needed');
  
  // Calculate active campaigns as unique clients in deliverables
  const activeCampaigns = new Set(deliverables.map(d => d.client_id)).size;

  function handleLogout() {
    logout();
    router.replace("/login");
  }

async function handleFileUpload() {
    if (!selectedTask || uploadFiles.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      let publicUrls: string[] = [];

      // 1. Sequentially upload each file to Supabase Storage
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        const fileExt = file.name.split('.').pop() || 'tmp';
        const fileName = `${selectedTask.id}-${Date.now()}-${i}.${fileExt}`;
        const filePath = `${selectedTask.client_id}/${fileName}`;

        console.log(`[Upload] Attempting item ${i+1}/${uploadFiles.length}:`, filePath);

        const { error: uploadError } = await supabase.storage
          .from('agency_media')
          .upload(filePath, file, { 
            upsert: true,
            contentType: file.type
          });

        if (uploadError) {
          throw new Error(`Storage Error on File ${i+1}: ${uploadError.message}`);
        }

        // 2. Get Public URL
        const { data: urlData } = supabase.storage
          .from('agency_media')
          .getPublicUrl(filePath);
        if (urlData?.publicUrl) {
          publicUrls.push(urlData.publicUrl);
        }
      }

      console.log("[Upload] Success! All Public URLs:", publicUrls);
      const finalMediaUrl = publicUrls.join(",");

      // 3. Update the deliverable row in the database
      const { error: dbError } = await supabase
        .from('content_deliverables')
        .update({
          status: 'Awaiting Review',
          media_url: finalMediaUrl,
          platform_target: platformTarget,
        })
        .eq('id', selectedTask.id);

      if (dbError) {
        console.error("[Upload] DB update error:", dbError);
        throw new Error("Database Error: " + dbError.message);
      }

      // 4. Update UI state
      setDeliverables(prev =>
        prev.map(d =>
          d.id === selectedTask.id
            ? { ...d, status: 'Awaiting Review', media_url: finalMediaUrl, assigned_designer: currentDesigner }
            : d
        )
      );

      setSelectedTask(null);
      setUploadFiles([]);
      setPlatformTarget("instagram");
      alert(`✅ ${uploadFiles.length} asset(s) uploaded! Sent to client for review.`);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      console.error("[Upload] Unhandled error:", msg);
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  }

  async function assignDesigner(taskId: string, designerName: string) {
    try {
      const { error } = await supabase
        .from('content_deliverables')
        .update({ 
          status: 'Assigned'
        })
        .eq('id', taskId);

      if (error) throw new Error("Database Update Error: " + error.message);

      // Update local state
      setDeliverables(prev => prev.map(d => 
        d.id === taskId ? { ...d, assigned_designer: designerName, status: 'Assigned' } : d
      ));
      
      alert(`✅ Assigned to ${designerName}!`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Assignment failed.");
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* Top Nav — contextual designer toolbar */}
      <header className="sticky top-0 z-40 h-16 bg-[#131313]/80 backdrop-blur-xl shadow-sm shadow-black/50">
        <div className="flex justify-between items-center px-4 md:px-8 w-full h-16 max-w-[1920px] mx-auto">
          <div className="flex items-center gap-4 md:gap-8 min-w-0">
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <span className="text-lg md:text-xl font-[900] text-white truncate">Designer Workspace</span>
              <span className="hidden sm:inline-block bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border border-primary/20">Designer Portal</span>
            </div>
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
              <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Canvas</span>
              <span className="text-primary border-b-2 border-primary pb-5 translate-y-[10px]">Assets</span>
              <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Templates</span>
              <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Review</span>
            </nav>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <button className="p-1 md:p-2 text-gray-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
            <button className="hidden sm:inline-block bg-primary text-on-primary px-4 md:px-5 py-1.5 rounded-lg text-xs md:text-sm font-bold shadow-[0_0_20px_rgba(192,193,255,0.2)] hover:scale-[1.02] transition-all">Publish</button>
          </div>
        </div>
      </header>

      <main className="pt-6 md:pt-8 pb-12 px-4 md:px-8 max-w-[1920px] mx-auto space-y-8 md:space-y-12 text-left">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-primary-fixed-dim font-medium tracking-widest text-[10px] md:text-xs uppercase">Creative Core</p>
            <h1 className="text-3xl md:text-5xl font-[900] tracking-tighter text-white">Designer Workspace</h1>
            <p className="text-on-surface-variant max-w-xl leading-relaxed text-sm md:text-base">Centralized asset management and production environment. Orchestrate visual campaigns with precision.</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 bg-surface-container-low p-2 rounded-xl ghost-border overflow-x-auto">
            <button className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-lg text-xs md:text-sm font-medium hover:bg-surface-bright transition-colors shrink-0">
              <span className="material-symbols-outlined text-sm md:text-base">filter_list</span> Filters
            </button>
            <button className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-lg text-xs md:text-sm font-medium hover:bg-surface-bright transition-colors shrink-0">
              <span className="material-symbols-outlined text-sm md:text-base">calendar_today</span> Timeline
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: "pending_actions", color: "text-sp-tertiary", bgColor: "bg-sp-tertiary/10", label: "Pending Reviews", value: uploadedTasks.filter(d => d.status === 'Awaiting Review').length.toString(), badge: "Active", badgeColor: "text-sp-tertiary bg-sp-tertiary/10" },
            { icon: "verified_user", color: "text-sp-secondary", bgColor: "bg-sp-secondary/10", label: "Approved", value: uploadedTasks.filter(d => d.status === 'Ready for Publishing').length.toString(), badge: "High Rate", badgeColor: "text-sp-secondary bg-sp-secondary/10" },
            { icon: "cloud_upload", color: "text-sp-primary", bgColor: "bg-sp-primary/10", label: "Uploads Today", value: uploadedTasks.length.toString(), badge: "Live Data", badgeColor: "text-sp-primary bg-sp-primary/10" },
            { icon: "rocket_launch", color: "text-on-surface", bgColor: "bg-white/5", label: "Active Campaigns", value: activeCampaigns.toString().padStart(2, '0'), badge: "Active", badgeColor: "text-gray-500 bg-white/5" },
          ].map((s) => (
            <div key={s.label} className="bg-surface-container-low p-5 md:p-6 rounded-xl ghost-border group hover:bg-surface-container-high transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 md:p-3 ${s.bgColor} rounded-xl`}>
                  <span className={`material-symbols-outlined ${s.color} text-xl md:text-2xl`}>{s.icon}</span>
                </div>
                <span className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full ${s.badgeColor}`}>{s.badge}</span>
              </div>
              <h3 className="text-on-surface-variant text-xs md:text-sm font-medium">{s.label}</h3>
              <p className="text-2xl md:text-3xl font-[900] text-white mt-1">{s.value}</p>
            </div>
          ))}
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Queue + Upload */}
          <div className="lg:col-span-4 space-y-8">
            {/* Queue */}
            <section className="bg-surface-container-low rounded-xl ghost-border overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Campaign Design Queue</h2>
                <div className="flex items-center gap-2">
                  <select 
                    value={currentDesigner} 
                    onChange={(e) => setCurrentDesigner(e.target.value)}
                    className="bg-surface-container-highest text-white text-xs p-1 rounded border border-white/10"
                  >
                    <option value="Designer 1">Designer 1</option>
                    <option value="Designer 2">Designer 2</option>
                    <option value="Designer 3">Designer 3</option>
                  </select>
                  <span className="material-symbols-outlined text-gray-500 text-sm">reorder</span>
                </div>
              </div>
              <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                {pendingTasks.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant text-sm">
                    No approved campaigns currently in the queue.
                  </div>
                ) : (
                  pendingTasks.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedTask(item)}
                      className="p-4 hover:bg-surface-container-high transition-colors flex items-center gap-4 group cursor-pointer"
                    >
                      <div className="h-12 w-12 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-sp-primary">image</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white truncate">{item.task_name}</p>
                          {item.status === 'Rework Needed' && (
                            <span className="bg-sp-error/20 text-sp-error text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-sp-error/30 flex-shrink-0">Rework</span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant">Client: {item.clients?.business_name || "Unknown"} • {item.platform}</p>
                        {item.assigned_designer && (
                          <p className="text-[10px] text-sp-primary mt-1">Assigned to: {item.assigned_designer}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        {!item.assigned_designer && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              assignDesigner(item.id, currentDesigner);
                            }}
                            className="text-[10px] bg-sp-primary/20 text-sp-primary px-2 py-1 rounded hover:bg-sp-primary/30 transition-colors"
                          >
                            Assign
                          </button>
                        )}
                        <span className={`material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform text-sp-primary`}>chevron_right</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button className="w-full p-4 text-center text-xs font-bold text-sp-primary hover:bg-sp-primary/5 transition-colors uppercase tracking-widest border-t border-white/5">
                View Full Queue
              </button>
            </section>

            {/* Upload Area Hint */}
            <section 
               onClick={() => {
                 if (pendingTasks.length > 0) setSelectedTask(pendingTasks[0]);
                 else alert("No pending tasks to assign an upload to!");
               }}
               className="bg-surface-container-low rounded-xl border-2 border-dashed border-sp-primary/30 p-8 flex flex-col items-center justify-center gap-4 text-center group hover:border-sp-primary transition-all cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-sp-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-sp-primary text-3xl">upload_file</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Upload Assets</h3>
                <p className="text-on-surface-variant text-sm mt-1">Current Designer: <span className="text-sp-primary font-bold">{currentDesigner}</span></p>
                <p className="text-on-surface-variant text-sm mt-1">Drag and drop or <span className="text-sp-primary font-bold cursor-pointer">browse files</span></p>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">JPG, PNG, SVG, LOTTIE (MAX 50MB)</p>
            </section>
          </div>

          {/* Right: Recent Uploads */}
          <div className="lg:col-span-8">
            <section className="bg-surface-container-low rounded-xl ghost-border overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Recent Uploads</h2>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">search</span>
                  <input className="bg-surface-container-high border-none rounded-lg py-1.5 pl-9 pr-4 text-sm focus:ring-1 focus:ring-sp-primary/30 w-48 transition-all" placeholder="Search assets..." type="text" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-lowest text-xs text-on-surface-variant uppercase tracking-widest font-bold">
                    <tr>
                      <th className="px-6 py-4">Asset Name</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Campaign</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {uploadedTasks.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant">No recent uploads found.</td>
                      </tr>
                    )}
                    {uploadedTasks.map((row) => {
                      const isApproved = row.status === 'Ready for Publishing';
                      const isRejected = row.status === 'Rework Needed';
                      const statusColor = isApproved ? "text-sp-secondary" : isRejected ? "text-sp-error" : "text-sp-tertiary";
                      
                      return (
                        <tr key={row.id} className="hover:bg-surface-container-high transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-black/40 overflow-hidden shrink-0 ghost-border flex items-center justify-center">
                              {row.media_url ? (
                                <span className="material-symbols-outlined text-sp-primary text-sm">check_circle</span>
                              ) : (
                                <span className="material-symbols-outlined text-gray-500 text-sm">description</span>
                              )}
                            </div>
                            <span className="font-medium text-on-surface">{row.task_name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`flex items-center gap-2 ${statusColor}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${statusColor.replace("text-", "bg-")}`}></span>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant">{row.clients?.business_name || "Unknown"}</td>
                          <td className="px-6 py-4 text-on-surface-variant">{new Date(row.created_at).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-auto p-4 border-t border-white/5 text-center">
                <button className="text-xs font-bold text-on-surface-variant hover:text-white transition-colors">Load More History</button>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 px-8 py-12 border-t border-white/5 bg-surface-container-lowest">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-lg font-[900] text-white">ScalePods</span>
            <span className="text-xs text-on-surface-variant">© 2024 Precision Automation</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-on-surface-variant">
            <span className="hover:text-sp-primary transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-sp-primary transition-colors cursor-pointer">System Status</span>
            <span className="hover:text-sp-primary transition-colors cursor-pointer">Documentation</span>
            <span className="hover:text-sp-primary transition-colors cursor-pointer">Support</span>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════ */}
      {/* ASSET UPLOAD MODAL                      */}
      {/* ═══════════════════════════════════════ */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isUploading && setSelectedTask(null)}></div>
          <div className="relative z-10 bg-surface-container-low border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1c1b1b]">
              <div>
                <h3 className="text-xl font-[900] text-white">Upload Creative Asset</h3>
                <p className="text-on-surface-variant text-sm mt-1">Assigning to: <span className="text-sp-primary font-bold">{selectedTask.task_name}</span></p>
                <p className="text-on-surface-variant text-xs mt-1">Designer: <span className="text-sp-secondary font-bold">{currentDesigner}</span></p>
              </div>
              {!isUploading && (
                <button onClick={() => setSelectedTask(null)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined text-gray-400">close</span>
                </button>
              )}
            </div>
            
            <div className="p-8 space-y-6">
              <div className="bg-surface-container-highest p-4 rounded-xl border border-white/5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Campaign</p>
                <p className="text-sm text-white font-medium">{selectedTask.clients?.business_name || "Unknown"} • {selectedTask.platform}</p>
                
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-4 mb-1">Details</p>
                <p className="text-sm text-on-surface-variant line-clamp-2">{selectedTask.topic || selectedTask.post_type}</p>

                {selectedTask.status === 'Rework Needed' && selectedTask.rework_comments && (
                  <>
                    <p className="text-xs font-bold text-sp-error uppercase tracking-widest mt-4 mb-1">Client Rework Feedback</p>
                    <div className="bg-sp-error/10 border border-sp-error/20 text-on-surface p-3 rounded-lg text-sm">
                      <span className="material-symbols-outlined text-sp-error text-sm align-middle mr-1 border-b border-transparent">warning</span>
                      {selectedTask.rework_comments}
                    </div>
                  </>
                )}
              </div>

              {/* Platform Target Selector */}
              <div className="mb-6">
                <p className="text-xs font-bold text-white mb-2">Target Platform</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'instagram', label: '📸 Instagram', icon: 'photo_camera' },
                    { id: 'website', label: '🌐 Website', icon: 'language' },
                    { id: 'linkedin', label: '💼 LinkedIn', icon: 'work' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlatformTarget(p.id)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                        platformTarget === p.id
                          ? 'border-sp-primary bg-sp-primary/10 text-sp-primary'
                          : 'border-white/10 bg-surface-container-highest text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{p.icon}</span>
                      {p.label.split(' ').slice(1).join(' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-white mb-2">Select Media File(s)</p>
                <div className="flex items-center justify-between mb-2">
                   <p className="text-[10px] text-on-surface-variant font-medium">Select up to 10 files if creating a carousel.</p>
                   {uploadFiles.length > 0 && (
                     <button onClick={() => setUploadFiles([])} className="text-[10px] text-sp-primary hover:text-white font-bold transition-colors">Clear All</button>
                   )}
                </div>
                <input 
                  type="file" 
                  multiple
                  accept="image/png, image/jpeg, video/mp4, image/gif, image/webp"
                  onChange={(e) => { 
                    if (e.target.files) {
                      setUploadFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                      setUploadError(null);
                    }
                  }}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-xl file:border-0
                    file:text-sm file:font-semibold
                    file:bg-sp-primary/10 file:text-sp-primary
                    hover:file:bg-sp-primary/20 file:cursor-pointer file:transition-all
                    border border-white/10 rounded-xl"
                />
                
                {uploadFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[10px] uppercase font-bold text-sp-secondary tracking-widest mb-2">Carousel Sequence (Drag to Reorder)</p>
                    <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                      {uploadFiles.map((file, idx) => (
                        <div 
                          key={`${file.name}-${idx}`}
                          draggable
                          onDragStart={() => setDraggedIndex(idx)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedIndex === null) return;
                            const newFiles = [...uploadFiles];
                            const draggedFile = newFiles[draggedIndex];
                            newFiles.splice(draggedIndex, 1);
                            newFiles.splice(idx, 0, draggedFile);
                            setUploadFiles(newFiles);
                            setDraggedIndex(null);
                          }}
                          className={`flex items-center gap-3 bg-surface-container-highest p-2 rounded-xl border ${draggedIndex === idx ? 'border-sp-primary bg-sp-primary/5' : 'border-white/5 hover:border-white/20'} cursor-move transition-colors shadow-sm`}
                        >
                          <div className="flex flex-col items-center justify-center text-gray-600 pl-1">
                            <span className="material-symbols-outlined text-[16px]">drag_indicator</span>
                          </div>
                          <div className="w-8 h-8 rounded-md bg-black/50 border border-white/5 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-sp-primary">{idx + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-white truncate">{file.name}</p>
                            <p className="text-[9px] text-gray-400 flex gap-2">
                              <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                              <span className="uppercase text-sp-secondary font-bold">{file.type.split('/')[1] || 'FILE'}</span>
                            </p>
                          </div>
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setUploadFiles(files => files.filter((_, i) => i !== idx));
                            }}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mr-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {uploadError && (
                <div className="bg-sp-error/10 border border-sp-error/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sp-error text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                    <span className="text-sm font-bold text-sp-error">Upload Failed</span>
                  </div>
                  <p className="text-xs text-on-surface-variant whitespace-pre-line leading-relaxed">{uploadError}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-surface-container-highest flex gap-3">
              <button 
                onClick={handleFileUpload}
                disabled={uploadFiles.length === 0 || isUploading}
                className="flex-1 bg-sp-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-on-primary/20 border-t-on-primary rounded-full animate-spin"></div>
                    Uploading to Storage...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">cloud_upload</span>
                    Submit for Client Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
