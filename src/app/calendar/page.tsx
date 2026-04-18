"use client";

export default function CalendarPage() {
  const DAYS = [
    { name: "Monday", date: "16" },
    { name: "Tuesday", date: "17" },
    { name: "Wednesday", date: "18" },
    { name: "Thursday", date: "19", isToday: true },
    { name: "Friday", date: "20" },
    { name: "Saturday", date: "21" },
    { name: "Weekend", date: "22" },
  ];

  const POSTS: Record<string, { icon: string; iconColor: string; title: string; time: string; status: string; statusColor: string; image?: boolean }[]> = {
    "16": [{ icon: "video_library", iconColor: "text-sp-primary", title: "Q4 Growth Strategy Video Announcement", time: "09:00 AM", status: "Published", statusColor: "bg-sp-secondary/10 text-sp-secondary", image: true }],
    "17": [{ icon: "article", iconColor: "text-sp-tertiary", title: "The Future of AI Content Pods", time: "02:30 PM", status: "Scheduled", statusColor: "bg-sp-primary/10 text-sp-primary" }],
    "19": [
      { icon: "podcasts", iconColor: "text-sp-secondary", title: "Scaling Beyond the First 10k Users", time: "11:00 AM", status: "Processing", statusColor: "bg-sp-secondary/10 text-sp-secondary" },
      { icon: "share", iconColor: "text-sp-tertiary", title: "Weekly Performance Recap", time: "05:00 PM", status: "Scheduled", statusColor: "bg-sp-primary/10 text-sp-primary" },
    ],
    "20": [{ icon: "grid_view", iconColor: "text-sp-secondary", title: "Product Hunt Launch Visuals", time: "08:00 AM", status: "Scheduled", statusColor: "bg-sp-primary/10 text-sp-primary", image: true }],
    "22": [{ icon: "draft", iconColor: "text-gray-400", title: "Sunday Thoughts on Scalability", time: "TBD", status: "Draft", statusColor: "bg-gray-500/10 text-gray-400" }],
  };

  return (
    <div className="min-h-screen relative">
      {/* Top Bar */}
      <header className="fixed top-0 right-0 left-64 z-40 bg-[#131313]/80 backdrop-blur-xl h-16 flex items-center justify-between px-8 border-b border-white/5">
        <div className="flex items-center gap-6">
          <span className="text-xl font-[900] text-white">Content Calendar</span>
          <div className="h-4 w-px bg-white/10"></div>
          <div className="flex bg-surface-container-low rounded-lg p-1">
            <button className="px-4 py-1.5 text-xs font-bold text-white bg-surface-container-high rounded-md shadow-sm">Week</button>
            <button className="px-4 py-1.5 text-xs font-medium text-gray-500 hover:text-white transition-colors">Month</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-gray-400 hover:text-white transition-colors cursor-pointer">notifications</span>
        </div>
      </header>

      <section className="pt-24 px-8 pb-12">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-[900] tracking-tight text-white uppercase italic">October 2023</h2>
            <div className="flex gap-1">
              <button className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-surface-container-high text-sm font-medium rounded-xl hover:bg-surface-bright transition-colors border border-white/5">Filter by Platform</button>
            <button className="px-5 py-2.5 bg-sp-primary text-on-primary text-sm font-bold rounded-xl hover:shadow-[0_0_20px_rgba(192,193,255,0.3)] transition-all">Schedule Post</button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          {/* Day Headers */}
          {DAYS.map((day) => (
            <div key={day.date} className="bg-surface-container-low p-4 text-center border-b border-white/5">
              <span className="text-[10px] font-[900] uppercase tracking-widest text-gray-500">{day.name}</span>
              <p className={`text-xl font-[900] mt-1 ${day.isToday ? "text-sp-primary" : "text-white"}`}>{day.date}</p>
            </div>
          ))}

          {/* Day Cells */}
          {DAYS.map((day) => {
            const posts = POSTS[day.date] || [];
            return (
              <div key={`cell-${day.date}`} className={`min-h-[500px] p-3 space-y-3 relative ${day.isToday ? "bg-surface-container-low/50" : "bg-surface"}`}>
                {day.isToday && <div className="absolute inset-0 border-2 border-sp-primary/20 pointer-events-none rounded-sm"></div>}
                {posts.length === 0 && (
                  <div className="h-full border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center opacity-20">
                    <span className="material-symbols-outlined text-4xl">add_circle</span>
                  </div>
                )}
                {posts.map((post, i) => (
                  <div key={i} className={`group bg-surface-container-high p-4 rounded-2xl border hover:border-sp-primary/50 transition-all cursor-pointer ${day.isToday && i === 0 ? "border-sp-primary/30 shadow-[0_0_30px_rgba(192,193,255,0.1)]" : "border-white/5"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`material-symbols-outlined text-lg ${post.iconColor}`}>{post.icon}</span>
                      <span className={`text-[9px] font-bold py-0.5 px-2 rounded-full uppercase ${post.statusColor}`}>{post.status}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-tight mb-2">{post.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      {post.time}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      {/* Floating Queue Status */}
      <div className="fixed bottom-10 right-10 flex flex-col items-end gap-4 pointer-events-none z-50">
        <div className="bg-surface-container-high/60 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl pointer-events-auto max-w-xs transform hover:-translate-y-2 transition-transform">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-sp-secondary animate-pulse"></div>
            <span className="text-[10px] font-[900] uppercase tracking-widest text-sp-secondary">Queue Status</span>
          </div>
          <h3 className="text-xl font-[900] text-white leading-tight mb-2">12 Posts Queued</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Your content pipeline is at 84% capacity. 4 platforms active.</p>
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
            <span className="text-[10px] font-medium text-gray-500">Next: Tuesday, 2:30 PM</span>
            <button className="text-xs font-bold text-sp-primary hover:underline">View Pipeline</button>
          </div>
        </div>
      </div>
    </div>
  );
}
