"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Sub-component untuk icon koin
function CoinIcon({ size = 16, active = false }) {
  const gold = active ? "#fbbf24" : "#475569";
  const goldDark = active ? "#d97706" : "#1e293b";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill={goldDark} />
      <circle cx="12" cy="12" r="9" fill={gold} />
      <text x="12" y="15.5" textAnchor="middle" fontSize="10" fontWeight="900" fill={active ? "#451a03" : "#0f172a"}>$</text>
    </svg>
  );
}

const NAV = [
  { href: "/",                label: "Home",        icon: "⬡",  group: "menu",    isExternal: false },
  { href: "/profile",         label: "Profile",     icon: "👤", group: "menu",    isExternal: false },
  { href: "/games/dice",      label: "Dice",        icon: "🎲", group: "games",   isExternal: false },
  { href: "/games/coinflip",  label: "CoinFlip",    icon: null, group: "games",   customIcon: "coin" },
  { href: "/games/slots",     label: "Slots",       icon: "🎰", group: "games",   isExternal: false },
  { href: "/faucet",          label: "Swap gUSDC",  icon: "💱", group: "utility", isExternal: false },
  // Tombol External Baru
  { href: "https://google.com", label: "Link 1",    icon: "🔗", group: "external", isExternal: true },
  { href: "https://google.com", label: "Link 2",    icon: "🔗", group: "external", isExternal: true },
  { href: "https://google.com", label: "Link 3",    icon: "🔗", group: "external", isExternal: true },
];

const GROUPS = [
  { key: "menu",    label: null },
  { key: "games",   label: "Games" },
  { key: "utility", label: "Utility" },
  { key: "external", label: "External Links" },
];

export function Sidebar() {
  const path = usePathname();
  const [isOpen, setIsOpen] = useState(false); // State untuk mobile toggle

  const toggleSidebar = () => setIsOpen(!isOpen);
  const byGroup = (g) => NAV.filter(n => n.group === g);

  return (
    <>
      {/* MOBILE HEADER & TOGGLE */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 px-6 bg-[#030712] border-b border-white/5 flex items-center justify-between z-[60]">
        <div className="flex items-center gap-2">
          <img src="https://pbs.twimg.com/profile_images/1950265537784926208/qbjSWMDP_400x400.jpg" className="w-8 h-8 rounded-lg" alt="Logo" />
          <span className="font-black text-white text-sm tracking-tighter" style={{ fontFamily: "'Orbitron', sans-serif" }}>RIALO</span>
        </div>
        <button onClick={toggleSidebar} className="p-2 text-white bg-white/5 rounded-lg border border-white/10">
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* MOBILE OVERLAY (Klik luar untuk nutup) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[51] lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* SIDEBAR MAIN */}
      <aside
        className={`fixed left-0 top-0 h-full z-[55] flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ 
          width: 240, 
          background: "#030712", 
          borderRight: "1px solid rgba(255,255,255,0.05)",
          fontFamily: "'Inter', sans-serif" 
        }}
      >
        {/* Brand Header (Desktop) */}
        <div className="px-6 py-8 hidden lg:flex items-center gap-3">
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00f5ff 0%, #0066ff 100%)", padding: "2px" }}>
            <img src="https://pbs.twimg.com/profile_images/1950265537784926208/qbjSWMDP_400x400.jpg" style={{ width: "100%", height: "100%", borderRadius: 8, objectFit: "cover" }} alt="Logo" />
          </div>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, color: "#ffffff" }}>RIALO</span>
        </div>

        {/* Network Indicator (Geser ke bawah di mobile agar tidak nabrak header) */}
        <div className="px-5 mt-20 lg:mt-0 mb-6">
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span style={{ color: "#f8fafc", fontSize: 11, fontWeight: 700 }}>Base Sepolia</span>
            <span style={{ color: "#64748b", fontSize: 10, marginLeft: "auto" }}>Testnet</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 space-y-6 overflow-y-auto custom-scrollbar">
          {GROUPS.map(({ key, label }) => {
            const items = byGroup(key);
            if (!items.length) return null;
            return (
              <div key={key}>
                {label && (
                  <p style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.15em", padding: "0 16px 8px", fontWeight: 800 }}>{label}</p>
                )}
                <div className="space-y-1">
                  {items.map(({ href, label: lbl, icon, customIcon, isExternal }) => {
                    const active = path === href;
                    const content = (
                      <div
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer"
                        style={{ background: active ? "rgba(255,255,255,0.05)" : "transparent", color: active ? "#ffffff" : "#94a3b8" }}
                        onClick={() => { if(!isExternal && window.innerWidth < 1024) setIsOpen(false); }}
                      >
                        <span style={{ width: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {customIcon === "coin" ? <CoinIcon size={18} active={active} /> : <span style={{ fontSize: 16 }}>{icon}</span>}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: active ? 700 : 500 }}>{lbl}</span>
                        {active && <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: "#00f5ff", boxShadow: "0 0 10px #00f5ff" }} />}
                      </div>
                    );

                    return isExternal ? (
                      <a key={href} href={href} target="_blank" rel="noopener noreferrer">{content}</a>
                    ) : (
                      <Link key={href} href={href}>{content}</Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 mt-auto border-t border-white/[0.04]">
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>
            <p>© 2026 Rialo Ecosystem</p>
            <div className="mt-2 flex flex-wrap gap-x-1 items-center">
              <span>by</span>
              <a href="https://x.com/Juniorr1945" target="_blank" className="text-slate-300 hover:text-cyan-400 font-semibold">Juniorrr1945</a>
              <span>×</span>
              <a href="https://x.com/Szaonly666" target="_blank" className="text-slate-300 hover:text-cyan-400 font-semibold">Sza</a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}