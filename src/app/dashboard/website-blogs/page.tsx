"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  Globe, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Search,
  BookOpen
} from "lucide-react";
import { LoadingLottie } from "@/components/loading-lottie";

type Client = {
  id: string;
  business_name: string;
  industry_type: string;
  blog_status: string;
  created_at: string;
};

export default function WebsiteBlogsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchClients();

    // Real-time subscription for all clients
    const channel = supabase
      .channel("blogs-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "clients",
        },
        (payload) => {
          console.log("Client update received:", payload.new);
          setClients((prev) => 
            prev.map((c) => (c.id === payload.new.id ? { ...c, ...payload.new } : c))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, business_name, industry_type, blog_status, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white">
        <LoadingLottie message="Loading blog status..." size={550} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Website Blogs</h1>
          <p className="text-slate-500">Manage and approve AI-generated blog content for your clients.</p>
        </div>

        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const isGenerating = client.blog_status === "Generating Blog";
          
          return (
            <div
              key={client.id}
              onClick={() => {
                if (!isGenerating) {
                  window.location.href = `/dashboard/website-blogs/${client.id}`;
                }
              }}
              className={`group bg-white border border-slate-100 rounded-[32px] p-8 transition-all duration-300 ${
                isGenerating 
                  ? "opacity-90 cursor-not-allowed border-blue-100 bg-blue-50/10 shadow-inner" 
                  : "cursor-pointer hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10"
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                  isGenerating ? "bg-blue-100 text-blue-600" : "bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
                }`}>
                  {isGenerating ? <Loader2 className="w-7 h-7 animate-spin" /> : <Globe className="w-7 h-7" />}
                </div>
                <StatusBadge status={client.blog_status || "Idle"} />
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-1">{client.business_name}</h3>
              <p className="text-sm font-medium text-slate-500 mb-8 line-clamp-1">{client.industry_type}</p>

              <div className={`pt-6 border-t flex items-center justify-between ${
                isGenerating ? "border-blue-100/50" : "border-slate-50"
              }`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  isGenerating ? "text-blue-500" : "text-slate-400"
                }`}>
                  {isGenerating ? "AI is Writing..." : "View Report"}
                </span>
                {!isGenerating && (
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Idle": "bg-slate-50 text-slate-500 border-slate-200",
    "Generating Blog": "bg-blue-50 text-blue-600 border-blue-200 animate-pulse",
    "Ready for Review": "bg-amber-50 text-amber-600 border-amber-200",
    "Approved": "bg-emerald-50 text-emerald-600 border-emerald-200",
    "Published": "bg-primary/10 text-primary border-primary/20",
  };

  const icons: Record<string, any> = {
    "Generating Blog": <Loader2 className="w-3 h-3 animate-spin" />,
    "Ready for Review": <Clock className="w-3 h-3" />,
    "Approved": <CheckCircle2 className="w-3 h-3" />,
    "Published": <Globe className="w-3 h-3" />,
  };

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles["Idle"]}`}>
      {icons[status]}
      {status}
    </div>
  );
}
