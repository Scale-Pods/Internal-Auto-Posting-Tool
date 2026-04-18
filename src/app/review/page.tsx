"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, logout } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ReviewPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Client");
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reworkComment, setReworkComment] = useState("");

  useEffect(() => {
    const user = getUser();
    // We allow anyone to view for now, but usually we'd restrict
    if (user) {
      setUserName(user.name);
    }

    async function fetchReviewQueue() {
      const { data, error } = await supabase
        .from('content_deliverables')
        .select(`
          *,
          clients (
            business_name
          )
        `)
        .eq('status', 'Awaiting Review')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching review items:", error);
        return;
      }
      setDeliverables(data || []);
    }

    fetchReviewQueue();
  }, [router]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  async function handleApprove(id: string) {
    try {
      const { error } = await supabase
        .from('content_deliverables')
        .update({ status: 'Ready for Publishing' })
        .eq('id', id);

      if (error) throw new Error(error.message);

      alert("✅ Content Approved! It is now Ready for Publishing by the n8n engine.");
      setDeliverables(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      alert("Failed to approve: " + err.message);
    }
  }

  async function handleRejectSubmit() {
    if (!rejectingId) return;
    if (!reworkComment.trim()) {
      alert("Please provide feedback for the rework.");
      return;
    }

    try {
      const { error } = await supabase
        .from('content_deliverables')
        .update({ 
          status: 'Rework Needed',
          rework_comments: reworkComment
        })
        .eq('id', rejectingId);

      if (error) throw new Error(error.message);

      alert("❌ Sent back to Designer for Rework!");
      setDeliverables(prev => prev.filter(d => d.id !== rejectingId));
      setRejectingId(null);
      setReworkComment("");
    } catch (err: any) {
      alert("Failed to reject: " + err.message);
    }
  }

  const renderMedia = (url: string) => {
    if (!url) return <div className="w-full h-full flex items-center justify-center bg-surface-container-highest text-gray-500">No Media</div>;
    
    if (url.match(/\.(mp4|webm)$/i)) {
      return (
        <video controls className="w-full h-48 object-cover">
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }
    return <img src={url} alt="Creative" className="w-full h-48 object-cover" />;
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* Top Nav — contextual review toolbar */}
      <header className="sticky top-0 z-40 h-16 bg-[#131313]/80 backdrop-blur-xl shadow-sm shadow-black/50">
        <div className="flex justify-between items-center px-4 md:px-8 w-full h-16 max-w-[1920px] mx-auto">
          <div className="flex items-center gap-4 md:gap-8">
             <div className="flex items-center gap-2 md:gap-3">
              <span className="text-lg md:text-xl font-[900] text-white truncate">Content Review</span>
              <span className="hidden sm:inline-block bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border border-secondary/20">Review Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] md:text-xs text-gray-400">User: {userName}</span>
          </div>
        </div>
      </header>

      <main className="pt-6 md:pt-8 pb-12 px-4 md:px-8 max-w-[1920px] mx-auto space-y-8 md:space-y-12">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-sp-secondary font-medium tracking-widest text-[10px] md:text-xs uppercase">Step 6</p>
            <h1 className="text-3xl md:text-5xl font-[900] tracking-tighter text-white">Content Approval</h1>
            <p className="text-on-surface-variant max-w-xl leading-relaxed text-sm md:text-base">Review creative assets uploaded by your designer. Approve them for automated publishing or request revisions.</p>
          </div>
        </section>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {deliverables.length === 0 ? (
            <div className="col-span-full p-8 md:p-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
              <span className="material-symbols-outlined text-4xl text-gray-500 mb-4">check_circle</span>
              <h3 className="text-lg md:text-xl font-bold text-white">All caught up!</h3>
              <p className="text-on-surface-variant mt-2 text-sm">No pending creative assets awaiting your review.</p>
            </div>
          ) : (
            deliverables.map(task => (
               <div key={task.id} className="bg-surface-container-low border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors flex flex-col group shadow-lg">
                  {/* Media Embed */}
                  <div className="relative bg-black h-48 md:h-56 border-b border-white/5">
                    {renderMedia(task.media_url)}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest text-white border border-white/10 shadow-sm">
                      {task.platform}
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="p-5 md:p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <p className="text-[10px] md:text-xs text-sp-secondary uppercase tracking-widest font-bold truncate">{task.clients?.business_name || "Unknown Client"}</p>
                      <p className="text-[10px] text-gray-500 shrink-0">{new Date(task.created_at).toLocaleDateString()}</p>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-white mb-2 line-clamp-1">{task.task_name}</h3>
                    <div className="text-xs md:text-sm text-on-surface-variant line-clamp-2 md:line-clamp-3 mb-6 bg-surface-container-highest p-3 rounded-lg border border-white/5">
                       <span className="text-[9px] md:text-xs text-gray-500 block mb-1">Details/Theme:</span>
                       {task.topic || task.post_type}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleApprove(task.id)}
                        className="bg-sp-secondary text-black font-bold py-2 md:py-2.5 rounded-xl flex items-center justify-center gap-1.5 md:gap-2 hover:opacity-90 transition-opacity text-sm"
                      >
                        <span className="material-symbols-outlined text-sm md:text-base">thumb_up</span> Approve
                      </button>
                      <button 
                        onClick={() => setRejectingId(task.id)}
                        className="bg-surface-container-highest border border-white/5 text-sp-error font-bold py-2 md:py-2.5 rounded-xl flex items-center justify-center gap-1.5 md:gap-2 hover:bg-white/5 transition-colors text-sm"
                      >
                        <span className="material-symbols-outlined text-sm md:text-base">thumb_down</span> Reject
                      </button>
                    </div>
                  </div>
               </div>
            ))
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setRejectingId(null)}></div>
          <div className="relative z-10 bg-surface-container-low border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 p-6 animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 absolute bottom-0 md:static">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 md:hidden" />
            <h3 className="text-lg md:text-xl font-[900] text-white mb-2">Request Rework</h3>
            <p className="text-xs md:text-sm text-on-surface-variant mb-6">Let the designer know what needs to be changed.</p>
            
            <textarea 
              value={reworkComment}
              onChange={(e) => setReworkComment(e.target.value)}
              placeholder="E.g., Change the font color to blue, update the hook text to..."
              className="w-full bg-surface-container-highest border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-sp-primary focus:border-sp-primary outline-none transition-all h-32 resize-none"
            ></textarea>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setRejectingId(null); setReworkComment(""); }} className="flex-1 py-3 font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button 
                onClick={handleRejectSubmit} 
                className="flex-1 bg-sp-error text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                Send to Designer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
