"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, X, Clock, CheckCircle2, Loader2, Zap } from "lucide-react";

type Deliverable = {
  id: string;
  task_name: string;
  post_type?: string;
  platform: string;
  platform_target?: string;
  topic?: string;
  status: string;
  created_at: string;
  scheduled_time?: string;
  client_id: string;
  clients?: { business_name: string };
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const PLATFORM_COLOR: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  linkedin:  "bg-blue-100 text-blue-700",
  website:   "bg-emerald-100 text-emerald-700",
};

const STATUS_DOT: Record<string, string> = {
  "Scheduled":           "bg-primary",
  "Published":           "bg-emerald-500",
  "Ready for Publishing":"bg-amber-400",
};

function pKey(p?: string) { return (p || "instagram").toLowerCase(); }

export default function AdminCalendarPage() {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [items, setItems] = useState<Deliverable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Schedule modal
  const [showModal, setShowModal]           = useState(false);
  const [readyContent, setReadyContent]     = useState<Deliverable[]>([]);
  const [selectedItem, setSelectedItem]     = useState<Deliverable | null>(null);
  const [schedDate, setSchedDate]           = useState("");
  const [schedTime, setSchedTime]           = useState("10:00");
  const [isScheduling, setIsScheduling]     = useState(false);

  // Day detail
  const [activeDay, setActiveDay] = useState<number | null>(null);

  useEffect(() => { fetchItems(); }, [year, month]);

  async function fetchItems() {
    setIsLoading(true);
    const { data } = await supabase
      .from("content_deliverables")
      .select("*, clients(business_name)")
      .in("status", ["Scheduled", "Published", "Ready for Publishing"])
      .order("scheduled_time", { ascending: true });
    setItems(data || []);
    setIsLoading(false);
  }

  async function openModal() {
    const { data } = await supabase
      .from("content_deliverables")
      .select("*, clients(business_name)")
      .eq("status", "Ready for Publishing")
      .order("created_at", { ascending: false });
    setReadyContent(data || []);
    setSelectedItem(null);
    const d = new Date(); d.setDate(d.getDate() + 1);
    setSchedDate(d.toISOString().split("T")[0]);
    setSchedTime("10:00");
    setShowModal(true);
  }

  async function confirmSchedule() {
    if (!selectedItem || !schedDate) return;
    setIsScheduling(true);
    try {
      const iso = new Date(`${schedDate}T${schedTime}:00`).toISOString();
      const { error } = await supabase
        .from("content_deliverables")
        .update({ status: "Scheduled", scheduled_time: iso })
        .eq("id", selectedItem.id);
      if (error) throw error;
      await fetchItems();
      setShowModal(false);
    } catch (e: any) { alert("Error: " + e.message); }
    finally { setIsScheduling(false); }
  }

  // Calendar math
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMon  = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMon) / 7) * 7;

  const dayMap = useMemo(() => {
    const m: Record<number, Deliverable[]> = {};
    items.forEach(d => {
      if (!d.scheduled_time) return;
      const dt = new Date(d.scheduled_time);
      if (dt.getFullYear() === year && dt.getMonth() === month) {
        const day = dt.getDate();
        if (!m[day]) m[day] = [];
        m[day].push(d);
      }
    });
    return m;
  }, [items, year, month]);

  const scheduledCount = Object.values(dayMap).flat().length;
  const activeDayItems = activeDay ? (dayMap[activeDay] || []) : [];

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }

  return (
    <div className="min-h-screen bg-[#F8F7F5] p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-h1 text-slate-900">Publishing Calendar</h1>
            <p className="text-slate-500 text-sm mt-0.5">{scheduledCount} posts scheduled this month</p>
          </div>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Schedule Post
        </button>
      </div>

      {/* Month Nav */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-900 min-w-[160px] text-center">{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-4 text-[11px] font-semibold text-slate-500">
            {[["Scheduled","bg-primary"], ["Published","bg-emerald-500"], ["Ready","bg-amber-400"]].map(([l,c]) => (
              <span key={l} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${c}`} />{l}
              </span>
            ))}
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/60">
          {DAY_NAMES.map(d => (
            <div key={d} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 auto-rows-[minmax(100px,1fr)]">
          {Array.from({ length: totalCells }).map((_, idx) => {
            const dayNum = idx - firstDay + 1;
            const valid  = dayNum >= 1 && dayNum <= daysInMon;
            const isToday = valid && dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isActive = activeDay === dayNum && valid;
            const dayItems = valid ? (dayMap[dayNum] || []) : [];

            return (
              <div
                key={idx}
                onClick={() => valid && setActiveDay(isActive ? null : dayNum)}
                className={`border-b border-r border-slate-100 p-2 transition-colors
                  ${valid ? "cursor-pointer hover:bg-orange-50/40" : "bg-slate-50/30"}
                  ${isToday ? "bg-orange-50 ring-2 ring-inset ring-primary/20" : ""}
                  ${isActive ? "bg-orange-50" : ""}
                `}
              >
                {valid && (
                  <>
                    <span className={`text-xs font-bold mb-1 block w-6 h-6 flex items-center justify-center rounded-full
                      ${isToday ? "bg-primary text-white" : "text-slate-500"}`}>
                      {dayNum}
                    </span>
                    <div className="space-y-0.5">
                      {dayItems.slice(0, 2).map(item => (
                        <div key={item.id} className="flex items-center gap-1 bg-white rounded px-1.5 py-0.5 border border-slate-100 shadow-xs">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[item.status] || "bg-slate-300"}`} />
                          <span className="text-[9px] font-medium text-slate-700 truncate">{item.task_name}</span>
                        </div>
                      ))}
                      {dayItems.length > 2 && (
                        <p className="text-[9px] text-slate-400 pl-1">+{dayItems.length - 2} more</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Detail */}
      {activeDay && activeDayItems.length > 0 && (
        <div className="mt-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">
              {MONTHS[month]} {activeDay}, {year}
              <span className="ml-2 text-sm font-normal text-slate-500">— {activeDayItems.length} post{activeDayItems.length !== 1 ? "s" : ""}</span>
            </h3>
            <button onClick={() => setActiveDay(null)} className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {activeDayItems.map(item => {
              const time = item.scheduled_time
                ? new Date(item.scheduled_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                : "—";
              const statusBadge = item.status === "Published"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : item.status === "Scheduled"
                  ? "bg-orange-50 text-primary border-orange-200"
                  : "bg-amber-50 text-amber-700 border-amber-200";
              return (
                <div key={item.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50 flex flex-col gap-2">
                  <p className="text-sm font-bold text-slate-900 line-clamp-1">{item.task_name}</p>
                  <p className="text-xs text-slate-500">{item.clients?.business_name}</p>
                  <div className="flex items-center gap-2 mt-auto">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusBadge}`}>{item.status}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Clock className="w-3 h-3" />{time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Schedule Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !isScheduling && setShowModal(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Schedule a Post</h3>
                <p className="text-sm text-slate-500 mt-0.5">Pick approved content and set a date & time</p>
              </div>
              {!isScheduling && (
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Content selector */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Select Content ({readyContent.length} ready)
                </p>
                {readyContent.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                    <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No content ready for publishing yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {readyContent.map(item => {
                      const sel = selectedItem?.id === item.id;
                      const pk  = pKey(item.platform_target || item.platform);
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all
                            ${sel ? "border-primary bg-orange-50" : "border-slate-100 bg-white hover:border-slate-200"}`}
                        >
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${PLATFORM_COLOR[pk] || "bg-slate-100 text-slate-600"}`}>
                            {pk}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{item.task_name}</p>
                            <p className="text-[11px] text-slate-400">{item.clients?.business_name}</p>
                          </div>
                          {sel && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Date</label>
                  <input
                    type="date"
                    value={schedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setSchedDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Time</label>
                  <input
                    type="time"
                    value={schedTime}
                    onChange={e => setSchedTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              {/* Tip */}
              <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 flex items-center gap-3">
                <Zap className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs text-slate-600 font-medium">Best engagement: <strong className="text-primary">10 AM – 12 PM</strong> on weekdays</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isScheduling}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSchedule}
                disabled={!selectedItem || !schedDate || isScheduling}
                className="flex-1 bg-primary hover:bg-orange-600 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                {isScheduling
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Scheduling…</>
                  : <><CheckCircle2 className="w-4 h-4" /> Confirm</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
