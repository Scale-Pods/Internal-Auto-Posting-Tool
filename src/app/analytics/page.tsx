"use client";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Bar */}
      <header className="sticky top-0 w-full z-50 h-16 flex justify-between items-center px-8 bg-[#131313]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-8">
          <h2 className="text-xl font-[900] text-white">Analytics</h2>
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Overview</span>
            <span className="text-[#c0c1ff] border-b-2 border-[#c0c1ff] pb-[18px]">Performance</span>
            <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Real-time</span>
            <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Reports</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
            <input className="bg-surface-container-highest border-none rounded-xl pl-10 pr-4 py-2 text-xs w-64 focus:ring-1 focus:ring-sp-primary text-on-surface" placeholder="Search analytics..." type="text" />
          </div>
          <button className="px-4 py-2 bg-sp-primary/10 text-sp-primary border border-sp-primary/20 rounded-xl text-xs font-bold hover:bg-sp-primary/20 transition-all">Export CSV</button>
        </div>
      </header>

      <div className="p-8 max-w-[1400px] mx-auto space-y-8 flex-1">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-3xl font-[900] text-white tracking-tight">Performance Summary</h3>
            <p className="text-on-surface-variant text-sm mt-1">Real-time metrics for your marketing automation funnels.</p>
          </div>
          <div className="bg-surface-container-low p-1 rounded-xl flex items-center shadow-inner">
            <button className="px-4 py-1.5 text-xs font-medium text-gray-500 hover:text-white transition-colors">24h</button>
            <button className="px-4 py-1.5 text-xs font-medium bg-surface-container-high text-[#c0c1ff] rounded-lg shadow-sm">7 Days</button>
            <button className="px-4 py-1.5 text-xs font-medium text-gray-500 hover:text-white transition-colors">30 Days</button>
            <button className="px-4 py-1.5 text-xs font-medium text-gray-500 hover:text-white transition-colors">Quarter</button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "visibility", color: "text-sp-primary", bgColor: "bg-sp-primary/10", label: "Impressions", value: "1.42M", delta: "+12.4%", barW: "w-[70%]", barColor: "bg-sp-primary", shadow: "shadow-[0_0_8px_rgba(192,193,255,0.4)]" },
            { icon: "bolt", color: "text-sp-secondary", bgColor: "bg-sp-secondary/10", label: "Engagement", value: "42.8k", delta: "+8.2%", barW: "w-[45%]", barColor: "bg-sp-secondary", shadow: "shadow-[0_0_8px_rgba(69,223,164,0.4)]" },
            { icon: "ads_click", color: "text-sp-tertiary", bgColor: "bg-sp-tertiary/10", label: "Clicks", value: "12.6k", delta: "+14.1%", barW: "w-[62%]", barColor: "bg-sp-tertiary", shadow: "shadow-[0_0_8px_rgba(206,189,255,0.4)]" },
            { icon: "show_chart", color: "text-secondary-container", bgColor: "bg-secondary-container/10", label: "Growth", value: "21.9%", delta: "+5.4%", barW: "w-[88%]", barColor: "bg-secondary-container", shadow: "shadow-[0_0_8px_rgba(0,189,133,0.4)]" },
          ].map((s) => (
            <div key={s.label} className="bg-surface-container-low p-6 rounded-xl border border-white/5 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 ${s.bgColor} rounded-lg ${s.color}`}>
                  <span className="material-symbols-outlined">{s.icon}</span>
                </div>
                <div className="flex items-center gap-1 text-sp-secondary font-bold text-xs">
                  <span className="material-symbols-outlined text-xs">trending_up</span>{s.delta}
                </div>
              </div>
              <p className="text-outline text-xs font-medium uppercase tracking-wider">{s.label}</p>
              <h4 className="text-3xl font-[900] text-white mt-1">{s.value}</h4>
              <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${s.barColor} ${s.barW} rounded-full ${s.shadow}`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Engagement Chart */}
          <div className="bg-surface-container-low p-8 rounded-xl border border-white/5 min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h5 className="text-xl font-bold text-white">Engagement Over Time</h5>
                <p className="text-xs text-on-surface-variant mt-1">Aggregated platform interactions</p>
              </div>
            </div>
            <div className="flex-1 flex items-end gap-3 pb-4">
              {[40, 65, 45, 85, 60, 95, 75, 55].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-sp-primary/20 to-sp-primary/40 rounded-t-lg" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-outline uppercase tracking-widest pt-4 border-t border-white/5">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="bg-surface-container-low p-8 rounded-xl border border-white/5 min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h5 className="text-xl font-bold text-white">Platform Breakdown</h5>
                <p className="text-xs text-on-surface-variant mt-1">Traffic distribution by source</p>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center relative">
              <div className="w-48 h-48 rounded-full border-[16px] border-surface-container flex items-center justify-center relative">
                <div className="absolute inset-[-16px] rounded-full border-[16px] border-sp-primary border-r-transparent border-b-transparent rotate-45"></div>
                <div className="absolute inset-[-16px] rounded-full border-[16px] border-sp-secondary border-l-transparent border-t-transparent -rotate-12"></div>
                <div className="text-center">
                  <span className="text-2xl font-[900] text-white">84%</span>
                  <p className="text-[10px] text-outline uppercase">Active</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-8">
              {[
                { color: "bg-sp-primary", label: "Social Media (52%)" },
                { color: "bg-sp-secondary", label: "Direct Mail (32%)" },
                { color: "bg-sp-tertiary", label: "Referral (10%)" },
                { color: "bg-surface-container-highest", label: "Others (6%)" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${l.color}`}></div>
                  <span className="text-xs text-on-surface-variant">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-surface-container-low rounded-xl border border-white/5 overflow-hidden">
          <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
            <h5 className="text-xl font-bold text-white">Recent Posts Performance</h5>
            <button className="text-xs font-bold text-sp-primary hover:underline">View All Posts</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-outline border-b border-white/5">
                  <th className="px-8 py-4 font-semibold">Campaign Name</th>
                  <th className="px-8 py-4 font-semibold">Post Date</th>
                  <th className="px-8 py-4 font-semibold">Reach</th>
                  <th className="px-8 py-4 font-semibold">Conv. Rate</th>
                  <th className="px-8 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: "Summer Solstice Blast", sub: "Influencer-led", date: "Oct 24, 2023", reach: "124,500", rate: "4.2%", rateW: "w-[42%]", status: "Active", statusColor: "bg-sp-secondary/10 text-sp-secondary" },
                  { name: "Tech Webinar Re-run", sub: "Automated Sequence", date: "Oct 22, 2023", reach: "89,200", rate: "2.8%", rateW: "w-[28%]", status: "Paused", statusColor: "bg-white/5 text-outline" },
                  { name: "Fall Collection Drop", sub: "Multi-channel", date: "Oct 19, 2023", reach: "210,400", rate: "5.9%", rateW: "w-[59%]", status: "Active", statusColor: "bg-sp-secondary/10 text-sp-secondary" },
                ].map((row) => (
                  <tr key={row.name} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-white">{row.name}</p>
                      <p className="text-[10px] text-outline">{row.sub}</p>
                    </td>
                    <td className="px-8 py-5 text-sm text-on-surface-variant">{row.date}</td>
                    <td className="px-8 py-5 text-sm text-white font-medium">{row.reach}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-sp-secondary font-bold">{row.rate}</span>
                        <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`bg-sp-secondary h-full ${row.rateW}`}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${row.statusColor}`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
