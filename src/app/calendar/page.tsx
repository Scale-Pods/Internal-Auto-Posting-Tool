"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";

type Deliverable = {
  id: string;
  task_name: string;
  post_type: string;
  platform: string;
  platform_target?: string;
  topic: string;
  status: string;
  created_at: string;
  scheduled_time?: string;
  client_id: string;
  media_url?: string;
  clients?: { business_name: string };
};

const PLATFORM_ICON: Record<string, string> = {
  instagram: "photo_camera",
  linkedin: "business_center",
  website: "language",
};

const PLATFORM_COLOR: Record<string, string> = {
  instagram: "text-pink-500 bg-pink-500/10 border-pink-500/20",
  linkedin: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  website: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

const STATUS_STYLE: Record<string, string> = {
  Scheduled: "bg-sp-primary/10 text-sp-primary border border-sp-primary/20",
  Published: "bg-sp-secondary/10 text-sp-secondary border border-sp-secondary/20",
  "Ready for Publishing": "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function platformKey(p?: string) {
  return (p || "instagram").toLowerCase();
}

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [approvedContent, setApprovedContent] = useState<Deliverable[]>([]);
  const [selectedContent, setSelectedContent] = useState<Deliverable | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("10:00");
  const [isScheduling, setIsScheduling] = useState(false);

  // Day detail
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    fetchScheduledItems();
  }, [currentYear, currentMonth]);

  async function fetchScheduledItems() {
    setIsLoading(true);
    const startOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();

    const { data } = await supabase
      .from("content_deliverables")
      .select(`*, clients(business_name)`)
      .in("status", ["Scheduled", "Published", "Ready for Publishing"])
      .order("scheduled_time", { ascending: true });

    setDeliverables(data || []);
    setIsLoading(false);
  }

  async function openScheduleModal() {
    // Fetch ready-for-publishing content
    const { data } = await supabase
      .from("content_deliverables")
      .select(`*, clients(business_name)`)
      .eq("status", "Ready for Publishing")
      .order("created_at", { ascending: false });

    setApprovedContent(data || []);
    setShowScheduleModal(true);
    setSelectedContent(null);
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setScheduleDate(d.toISOString().split("T")[0]);
    setScheduleTime("10:00");
  }

  async function handleSchedule() {
    if (!selectedContent || !scheduleDate) {
      alert("Please select content and a date.");
      return;
    }
    setIsScheduling(true);
    try {
      const scheduledISO = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
      const { error } = await supabase
        .from("content_deliverables")
        .update({ status: "Scheduled", scheduled_time: scheduledISO })
        .eq("id", selectedContent.id);

      if (error) throw error;

      // Refresh
      await fetchScheduledItems();
      setShowScheduleModal(false);
      setSelectedContent(null);
    } catch (err: any) {
      alert("Error scheduling: " + err.message);
    } finally {
      setIsScheduling(false);
    }
  }

  // Calendar calculations
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Map of day number → deliverables on that day
  const dayMap = useMemo(() => {
    const map: Record<number, Deliverable[]> = {};
    deliverables.forEach((d) => {
      if (!d.scheduled_time) return;
      const dt = new Date(d.scheduled_time);
      if (dt.getFullYear() === currentYear && dt.getMonth() === currentMonth) {
        const day = dt.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(d);
      }
    });
    return map;
  }, [deliverables, currentYear, currentMonth]);

  const scheduledThisMonth = Object.values(dayMap).flat().length;

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  }
  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  }

  const selectedDayItems = selectedDay ? (dayMap[selectedDay] || []) : [];

  // Build grid cells: blanks + days
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

  return (
    <div className="min-h-screen bg-background text-on-background flex font-sans antialiased">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto md:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-surface-container-low/80 backdrop-blur-xl border-b border-white/5 h-16 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Step 8</p>
              <h1 className="text-xl font-[900] text-white">Publishing Calendar</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openScheduleModal}
              className="bg-sp-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_task</span>
              Schedule Post
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Month Nav + Stats */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all border border-white/10">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div>
                <h2 className="text-2xl font-[900] text-white">{MONTHS[currentMonth]} {currentYear}</h2>
                <p className="text-sm text-on-surface-variant flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sp-primary inline-block" />
                  {scheduledThisMonth} scheduled post{scheduledThisMonth !== 1 ? "s" : ""} this month
                </p>
              </div>
              <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all border border-white/10">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-bold">
              {[
                { label: "Scheduled", color: "bg-sp-primary" },
                { label: "Published", color: "bg-sp-secondary" },
                { label: "Ready", color: "bg-yellow-400" },
              ].map((l) => (
                <span key={l.label} className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className={`w-2 h-2 rounded-full ${l.color}`} />{l.label}
                </span>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-surface-container-low border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            {/* Day name headers */}
            <div className="grid grid-cols-7 border-b border-white/5">
              {DAY_NAMES.map((d) => (
                <div key={d} className="py-3 text-center text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 auto-rows-[minmax(120px,1fr)]">
              {Array.from({ length: totalCells }).map((_, idx) => {
                const dayNum = idx - firstDayOfMonth + 1;
                const isValid = dayNum >= 1 && dayNum <= daysInMonth;
                const isToday = isValid && dayNum === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                const items = isValid ? (dayMap[dayNum] || []) : [];
                const isSelected = selectedDay === dayNum && isValid;

                return (
                  <div
                    key={idx}
                    onClick={() => isValid && setSelectedDay(isSelected ? null : dayNum)}
                    className={`border-b border-r border-white/5 p-2 transition-all ${isValid ? "cursor-pointer hover:bg-white/3" : "bg-black/20"} ${isToday ? "ring-2 ring-inset ring-sp-primary/40 bg-sp-primary/5" : ""} ${isSelected ? "bg-white/5" : ""}`}
                  >
                    {isValid && (
                      <>
                        <span className={`text-sm font-bold mb-1 block w-7 h-7 flex items-center justify-center rounded-full ${isToday ? "bg-sp-primary text-black" : "text-on-surface-variant"}`}>
                          {dayNum}
                        </span>
                        <div className="space-y-1">
                          {items.slice(0, 2).map((item) => {
                            const pKey = platformKey(item.platform_target || item.platform);
                            const dotColor = item.status === "Published" ? "bg-sp-secondary" : item.status === "Scheduled" ? "bg-sp-primary" : "bg-yellow-400";
                            return (
                              <div key={item.id} className="flex items-center gap-1.5 bg-surface-container-high rounded-md px-1.5 py-1 border border-white/5 group">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
                                <span className="text-[10px] font-medium text-on-surface truncate flex-1">{item.task_name}</span>
                                <span className="material-symbols-outlined text-[10px] text-gray-600">{PLATFORM_ICON[pKey] || "public"}</span>
                              </div>
                            );
                          })}
                          {items.length > 2 && (
                            <p className="text-[9px] text-on-surface-variant pl-1">+{items.length - 2} more</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day Detail Panel */}
          {selectedDay && selectedDayItems.length > 0 && (
            <div className="bg-surface-container-low border border-white/5 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">
                  {MONTHS[currentMonth]} {selectedDay}, {currentYear}
                  <span className="ml-2 text-sm font-normal text-on-surface-variant">— {selectedDayItems.length} post{selectedDayItems.length !== 1 ? "s" : ""}</span>
                </h3>
                <button onClick={() => setSelectedDay(null)} className="text-gray-500 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedDayItems.map((item) => {
                  const pKey = platformKey(item.platform_target || item.platform);
                  const time = item.scheduled_time ? new Date(item.scheduled_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";
                  return (
                    <div key={item.id} className="bg-surface-container-high border border-white/5 rounded-xl p-4 flex gap-3">
                      <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border ${PLATFORM_COLOR[pKey] || "bg-white/5 border-white/10"}`}>
                        <span className="material-symbols-outlined text-[18px]">{PLATFORM_ICON[pKey] || "public"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white line-clamp-1">{item.task_name}</p>
                        <p className="text-[10px] text-on-surface-variant">{item.clients?.business_name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[item.status] || "bg-white/5 text-gray-400"}`}>
                            {item.status}
                          </span>
                          <span className="text-[9px] text-gray-500 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">schedule</span>{time}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ─── Schedule Post Modal ─── */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isScheduling && setShowScheduleModal(false)} />
          <div className="relative z-10 bg-surface-container-low border border-white/10 rounded-t-3xl md:rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-[#1c1b1b] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-[900] text-white">Schedule a Post</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Select approved content and pick a date & time</p>
              </div>
              {!isScheduling && (
                <button onClick={() => setShowScheduleModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Content Selector */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-3">
                  Select Approved Content ({approvedContent.length} available)
                </label>
                {approvedContent.length === 0 ? (
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center">
                    <span className="material-symbols-outlined text-3xl text-gray-600 block mb-2">check_circle</span>
                    <p className="text-sm text-on-surface-variant">No content is ready for publishing yet.</p>
                    <p className="text-xs text-gray-600 mt-1">Content must pass through Design Approval first.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {approvedContent.map((item) => {
                      const isSelected = selectedContent?.id === item.id;
                      const pKey = platformKey(item.platform_target || item.platform);
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedContent(item)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${isSelected ? "border-sp-primary bg-sp-primary/5" : "border-white/5 bg-surface-container-high hover:border-white/15"}`}
                        >
                          <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border ${PLATFORM_COLOR[pKey] || "bg-white/5 border-white/10"}`}>
                            <span className="material-symbols-outlined text-[18px]">{PLATFORM_ICON[pKey] || "public"}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white line-clamp-1">{item.task_name}</p>
                            <p className="text-[10px] text-on-surface-variant">{item.clients?.business_name} • {item.platform}</p>
                          </div>
                          {isSelected && <span className="material-symbols-outlined text-sp-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-white text-sm focus:ring-1 focus:ring-sp-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-white text-sm focus:ring-1 focus:ring-sp-primary outline-none"
                  />
                </div>
              </div>

              {/* AI Recommendation Box */}
              <div className="bg-sp-primary/5 border border-sp-primary/20 rounded-xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-sp-primary">lightbulb</span>
                <div>
                  <p className="text-sm font-bold text-white">AI Recommended Time</p>
                  <p className="text-xs text-on-surface-variant">Best engagement window: <span className="text-sp-primary font-bold">10:00 AM – 12:00 PM</span> on weekdays</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/5 bg-surface-container-highest flex gap-3 shrink-0">
              <button
                onClick={() => setShowScheduleModal(false)}
                disabled={isScheduling}
                className="flex-1 py-3 font-bold text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={!selectedContent || !scheduleDate || isScheduling}
                className="flex-1 bg-sp-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-40"
              >
                {isScheduling ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">event_available</span>
                    Confirm Schedule
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
