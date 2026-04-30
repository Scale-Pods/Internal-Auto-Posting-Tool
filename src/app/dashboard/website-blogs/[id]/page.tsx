"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  User, 
  Clock,
  ExternalLink,
  ChevronRight,
  Share2,
  MoreVertical,
  ThumbsUp,
  MessageSquare
} from "lucide-react";
import { LoadingLottie } from "@/components/loading-lottie";

type Client = {
  id: string;
  business_name: string;
  blog_status: string;
  blog_json: any;
};

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientId) fetchClient();
  }, [clientId]);

  const fetchClient = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, business_name, blog_status, blog_json")
        .eq("id", clientId)
        .single();

      if (error) throw error;
      setClient(data);
    } catch (err) {
      console.error("Error fetching blog details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!client) return;
    try {
      await supabase
        .from("clients")
        .update({ blog_status: "Approved" })
        .eq("id", client.id);
      
      setClient({ ...client, blog_status: "Approved" });
    } catch (err) {
      console.error("Error approving blog:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white">
        <LoadingLottie message="Fetching blog content..." size={550} />
      </div>
    );
  }

  if (!client || !client.blog_json) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center p-10 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-md">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Calendar className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Blog Content Yet</h2>
          <p className="text-slate-500 mb-8">Go to the client details page and trigger "Generate Website Blog" to get started.</p>
          <button 
            onClick={() => router.push(`/dashboard/clients/${clientId}`)}
            className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Client Info
          </button>
        </div>
      </div>
    );
  }

  // Robust parsing of blog_json in case it is stored as a string
  const blogData = typeof client.blog_json === 'string' 
    ? JSON.parse(client.blog_json) 
    : client.blog_json;

  const { title, header_image, author, sections } = blogData;

  return (
    <div className="flex-1 min-h-screen bg-[#fafafa] pb-20">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-slate-900 truncate max-w-[200px]">
                {client.business_name}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest uppercase">
                Reviewing Blog Content
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {client.blog_status === "Approved" ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
                Approved
              </div>
            ) : (
              <button
                onClick={handleApprove}
                className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-primary/20"
              >
                Approve & Publish
              </button>
            )}
            <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 border border-slate-100 bg-white">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-6">
        <article className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          {/* Header Image */}
          <div className="relative h-[450px] w-full bg-slate-100 overflow-hidden">
            <img 
              src={header_image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426"} 
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                  Featured Article
                </span>
                <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> 8 min read
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                {title}
              </h1>
            </div>
          </div>

          {/* Blog Meta */}
          <div className="px-12 py-10 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-100 overflow-hidden">
                <img 
                  src={`https://ui-avatars.com/api/?name=${author || client.business_name}&background=f97316&color=fff`} 
                  alt={author}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{author || "ScalePods AI Writer"}</p>
                <p className="text-xs text-slate-500">Managing Editor at {client.business_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 text-slate-400">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-xs font-bold">2.4k</span>
               </div>
               <div className="flex items-center gap-2 text-slate-400">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs font-bold">42</span>
               </div>
            </div>
          </div>

          {/* Blog Content */}
          <div className="px-12 py-16">
            {/* Introduction Section */}
            {blogData.introduction && (
              <div className="mb-16">
                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-lg">
                   <p className="font-bold text-slate-900 text-xl mb-4">{blogData.introduction.hook}</p>
                   <p className="mb-6">{blogData.introduction.context}</p>
                   <p className="italic text-slate-500 border-l-4 border-primary/20 pl-6 my-8">{blogData.introduction.thesis}</p>
                </div>
              </div>
            )}

            {/* Main Sections */}
            {sections?.map((section: any, idx: number) => (
              <div key={idx} className="mb-16 last:mb-0">
                {section.heading && (
                  <h2 className="text-3xl font-bold text-slate-900 mb-8 leading-snug">
                    {section.heading}
                  </h2>
                )}
                
                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-lg mb-8">
                  {section.body?.split('\n').map((para: string, pIdx: number) => (
                    para.trim() && <p key={pIdx} className="mb-6 last:mb-0">{para.trim()}</p>
                  ))}
                </div>

                {section.image && (
                  <div className="my-12 group/img">
                    <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/50 transition-transform duration-500 group-hover/img:scale-[1.01]">
                      <img src={section.image} alt={section.image_alt || section.heading} className="w-full" />
                    </div>
                    {section.image_caption && (
                      <p className="text-center text-xs text-slate-400 mt-4 font-medium tracking-wide uppercase italic">
                        {section.image_caption}
                      </p>
                    )}
                  </div>
                )}

                {section.key_takeaway && (
                  <div className="bg-slate-50 border-l-4 border-primary rounded-r-2xl p-6 my-10">
                    <p className="text-sm font-bold text-slate-900 mb-1">Key Takeaway</p>
                    <p className="text-slate-600 text-base italic">{section.key_takeaway}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Conclusion Section */}
            {blogData.conclusion && (
              <div className="mt-20 pt-16 border-t border-slate-100">
                <h2 className="text-3xl font-bold text-slate-900 mb-8">
                  {blogData.conclusion.heading || "Final Thoughts"}
                </h2>
                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-lg">
                  {blogData.conclusion.summary?.split('\n').map((para: string, pIdx: number) => (
                    para.trim() && <p key={pIdx} className="mb-6">{para.trim()}</p>
                  ))}
                  <p className="font-bold text-slate-900 mt-8 text-xl">
                    {blogData.conclusion.final_thought}
                  </p>
                </div>
              </div>
            )}

            {/* FAQ Section */}
            {blogData.faq && blogData.faq.length > 0 && (
              <div className="mt-24 pt-16 border-t border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-10">Frequently Asked Questions</h2>
                <div className="space-y-8">
                  {blogData.faq.map((item: any, fIdx: number) => (
                    <div key={fIdx} className="bg-slate-50/50 rounded-2xl p-8 border border-slate-100">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-start gap-3">
                        <span className="text-primary font-black">Q.</span>
                        {item.question}
                      </h3>
                      <p className="text-slate-600 leading-relaxed pl-7">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Section */}
            {blogData.cta && (
              <div className="mt-24 bg-slate-900 rounded-[40px] p-12 text-center text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -ml-32 -mb-32 rounded-full" />
                
                <h2 className="text-3xl font-bold mb-6 relative z-10">{blogData.cta.heading}</h2>
                <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto relative z-10 leading-relaxed">
                  {blogData.cta.text}
                </p>
                <Link 
                  href={blogData.cta.url || "/contact"}
                  className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-primary/20 relative z-10 group"
                >
                  {blogData.cta.button_text || "Get Started Today"}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </article>

        {/* Footer Navigation */}
        <div className="mt-12 flex items-center justify-between">
          <button className="text-sm font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Previous Client
          </button>
          <button className="text-sm font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-2">
             Next Client <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
