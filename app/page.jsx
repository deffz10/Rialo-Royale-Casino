"use client";

import Link from "next/link";
import { useEffect, useRef, useCallback } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const HOME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');

@keyframes hTwinkle    { from{opacity:.05} to{opacity:.9} }
@keyframes hBolt       { 0%{height:0;opacity:0} 10%{height:40%;opacity:1} 50%{opacity:.5} 100%{height:90%;opacity:0} }
@keyframes hFloat      { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(2deg)} }
@keyframes hPulse      { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
@keyframes hScan       { 0%{top:0} 100%{top:100%} }
@keyframes hCardShine  { 0%{transform:translateX(-120%) skewX(-20deg)} 100%{transform:translateX(300%) skewX(-20deg)} }
@keyframes hStatCount  { from{transform:scale(1.3) translateY(-4px);opacity:0} to{transform:scale(1) translateY(0);opacity:1} }
@keyframes hOrbit      { from{transform:rotate(0deg) translateX(80px) rotate(0deg)} to{transform:rotate(360deg) translateX(80px) rotate(-360deg)} }
@keyframes hSlideUp    { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes marqueeScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

/* FIX 1: removed overflow:hidden so content is not clipped */
.home-wrap {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 100% 60% at 50% -5%,rgba(0,100,200,.15) 0%,rgba(0,50,100,.08) 40%,transparent 70%),
    radial-gradient(ellipse 80% 40% at 20% 80%,rgba(167,139,250,.06) 0%,transparent 50%),
    radial-gradient(ellipse 60% 40% at 80% 90%,rgba(251,146,60,.05) 0%,transparent 50%),
    #020610;
  position: relative;
  font-family: 'Rajdhani', sans-serif;
  width: 100%;
  box-sizing: border-box;
}

/* FIX 2: bolt & scan use absolute (not fixed) so they stay inside content area */
.h-bolt {
  position: absolute; top: 0;
  width: 3px;
  background: linear-gradient(180deg,rgba(255,255,255,.9),rgba(150,200,255,.6),transparent);
  opacity: 0; pointer-events: none; z-index: 1;
  filter: blur(1px); box-shadow: 0 0 10px 5px rgba(100,180,255,.6);
}
.h-bolt.active { animation: hBolt .6s ease-out forwards; }

.h-star { position:absolute; border-radius:50%; background:#fff; pointer-events:none; }

/* FIX 3: scan line absolute, not fixed */
.h-scan-line {
  position: absolute; left:0; right:0; top:0; height:2px;
  background: linear-gradient(90deg,transparent,rgba(0,200,255,.3),transparent);
  pointer-events: none; z-index: 2;
  animation: hScan 8s linear infinite; opacity: .4;
}

.h-title-main {
  font-family:'Bebas Neue',cursive;
  font-size:clamp(72px,12vw,140px);
  letter-spacing:10px; color:#ffffff; line-height:.9;
}
.h-title-sub {
  font-family:'Bebas Neue',cursive;
  font-size:clamp(18px,3vw,32px);
  letter-spacing:clamp(8px,2vw,22px); color:#94a3b8;
}

.h-game-card {
  border-radius:20px;
  background:linear-gradient(135deg,rgba(8,13,26,.95) 0%,rgba(12,20,38,.9) 100%);
  border:1px solid rgba(255,255,255,.07);
  overflow:hidden; transition:all .3s cubic-bezier(0.175,0.885,0.32,1.275);
  cursor:pointer; position:relative;
  /* equal height */
  display:flex; flex-direction:column; height:100%;
}
.h-game-card:hover { transform:translateY(-6px) scale(1.01); border-color:rgba(255,255,255,.2); box-shadow:0 24px 60px rgba(0,0,0,.6); }
.h-game-card::before { content:'';position:absolute;inset:0;opacity:0;transition:opacity .3s;pointer-events:none; }
.h-game-card:hover::before { opacity:1; }

.h-card-body { padding:22px 22px 20px; display:flex; flex-direction:column; flex:1; }

.h-card-shine { position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);transform:skewX(-20deg);pointer-events:none; }
.h-game-card:hover .h-card-shine { animation:hCardShine .7s ease-out forwards; }

.h-card-line { position:absolute;bottom:0;left:0;height:3px;width:0;transition:width .5s ease-out;border-radius:0 3px 3px 0; }
.h-game-card:hover .h-card-line { width:100%; }

.h-icon-orb {
  width:72px;height:72px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:32px;position:relative;flex-shrink:0;
  animation:hFloat 3.5s ease-in-out infinite;
  box-shadow:inset 0 -4px 12px rgba(0,0,0,.4);
}
.h-icon-orb::after { content:'';position:absolute;inset:3px;border-radius:50%;background:radial-gradient(circle at 35% 25%,rgba(255,255,255,.35),transparent 60%);pointer-events:none; }

.h-net-badge {
  display:inline-flex;align-items:center;gap:8px;
  padding:8px 20px;border-radius:50px;
  background:rgba(0,245,255,.06);border:1px solid rgba(0,245,255,.2);
  font-size:12px;color:#00f5ff;font-family:'Orbitron',monospace;letter-spacing:2px;
}

.h-stat-card {
  padding:18px 20px;border-radius:14px;
  background:linear-gradient(135deg,rgba(8,13,26,.9),rgba(12,20,38,.85));
  border:1px solid rgba(255,255,255,.06);text-align:center;transition:all .2s;
}
.h-stat-card:hover { border-color:rgba(0,245,255,.2);transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,0,0,.4); }
.h-stat-val   { font-family:'Bebas Neue',cursive;font-size:28px;letter-spacing:2px;color:#00f5ff;display:block; }
.h-stat-label { font-size:10px;color:#64748b;letter-spacing:3px;text-transform:uppercase; }

.h-step { padding:16px 20px;border-radius:14px;background:rgba(8,13,26,.7);border:1px solid rgba(255,255,255,.05);display:flex;align-items:flex-start;gap:14px; }
.h-step-num { width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',cursive;font-size:18px;letter-spacing:1px;flex-shrink:0; }

.h-cta-btn {
  padding:16px 40px;border-radius:50px;border:none;
  font-family:'Bebas Neue',cursive;font-size:22px;letter-spacing:5px;cursor:pointer;
  background:linear-gradient(135deg,#00f5ff,#0066ff);color:#000d1a;
  box-shadow:0 0 0 1px rgba(0,245,255,.3),0 8px 32px rgba(0,200,255,.4);
  transition:all .2s;font-weight:900;position:relative;overflow:hidden;
}
.h-cta-btn:hover { transform:translateY(-3px);box-shadow:0 0 0 1px rgba(0,245,255,.5),0 12px 40px rgba(0,200,255,.6); }
.h-cta-btn::before { content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);transition:left .4s; }
.h-cta-btn:hover::before { left:100%; }

.h-orbit-icon { position:absolute;font-size:28px;animation:hOrbit var(--dur,8s) var(--delay,0s) linear infinite; }

.h-sep { height:1px;background:linear-gradient(90deg,transparent,rgba(0,245,255,.15),transparent);margin:60px 0; }

/* Ticker — white & animated */
.h-ticker { overflow:hidden;white-space:nowrap;width:100%; }
.h-ticker-inner {
  display:inline-block;animation:marqueeScroll 22s linear infinite;
  font-family:'Rajdhani',sans-serif;font-size:12px;
  color:#ffffff;letter-spacing:3px;font-weight:600;
}

/* Game grid — 4 equal columns */
.h-games-grid {
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:16px;
}
@media (max-width:1100px) { .h-games-grid { grid-template-columns:repeat(2,1fr); } }
@media (max-width:600px)  { .h-games-grid { grid-template-columns:1fr; } }
`;

const GAMES = [
  { href:"/games/dice",    icon:"🎲", coinSvg:false, title:"Lucky Dice",  desc:"Predict HIGH or LOW on a d6. 50% chance, 1.96x instant payout.", color:"#00f5ff", rgb:"0,245,255",   tag:"LIVE", mult:"1.96x", chance:"50%"    },
  { href:"/games/coinflip",icon:null,  coinSvg:true,  title:"Coin Flip",   desc:"Call HEADS or TAILS. Provably fair on-chain coin toss.",           color:"#a78bfa", rgb:"167,139,250", tag:"LIVE", mult:"1.96x", chance:"50%"    },
  { href:"/games/slots",   icon:"🎰", coinSvg:false, title:"Lucky Slots", desc:"Spin 3 reels across 7 symbols. Hit the Diamond jackpot for 50x.",  color:"#fb923c", rgb:"251,146,60",  tag:"LIVE", mult:"50x",   chance:"Varies" },
  { href:"#",              icon:"💣", coinSvg:false, title:"Drop Bomb",   desc:"Navigate a minefield. Cash out before you hit the bomb.",           color:"#4ade80", rgb:"74,222,128",  tag:"SOON", mult:"∞",     chance:"???"    },
];

const STATS = [
  { label:"Network",    value:"Base Sepolia" },
  { label:"Games Live", value:"3"            },
  { label:"Chain ID",   value:"84532"        },
  { label:"Currency",   value:"gUSDC"        },
];

const HOW_TO = [
  { num:"01", color:"#00f5ff", rgb:"0,245,255",   title:"Connect Wallet", desc:"Connect MetaMask or any EVM wallet to Base Sepolia testnet." },
  { num:"02", color:"#a78bfa", rgb:"167,139,250", title:"Get Test gUSDC", desc:"Swap or use the faucet to get free gUSDC for playing."      },
  { num:"03", color:"#fb923c", rgb:"251,146,60",  title:"Pick Your Game", desc:"Choose from Dice, Coin Flip, or Slots — all instant payouts."},
  { num:"04", color:"#4ade80", rgb:"74,222,128",  title:"Win & Withdraw", desc:"Winnings land in your wallet automatically via smart contract."},
];

const TICKER_TEXT = "★ LUCKY DICE — 1.96x INSTANT PAYOUT   ★ COIN FLIP — 50/50 ON-CHAIN   ★ LUCKY SLOTS — UP TO 50x MULTIPLIER   ★ DROP BOMB — COMING SOON   ★ 2% HOUSE EDGE — ALWAYS FAIR   ★ BUILT ON BASE SEPOLIA   ";

function CoinSvgIcon({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#d97706"/>
      <circle cx="24" cy="24" r="20" fill="#fbbf24"/>
      <circle cx="24" cy="24" r="16" fill="#f59e0b" opacity="0.6"/>
      <circle cx="24" cy="24" r="14" fill="#fbbf24" opacity="0.4"/>
      <text x="24" y="30" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#92400e" fontFamily="Georgia,serif">$</text>
      <ellipse cx="17" cy="17" rx="5" ry="3" fill="rgba(255,255,255,0.4)" transform="rotate(-35 17 17)"/>
    </svg>
  );
}

function InjectHomeStyles() {
  useEffect(() => {
    const id = "home-pro-styles";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id; el.textContent = HOME_CSS;
      document.head.appendChild(el);
    }
    return () => { const el = document.getElementById(id); if (el) el.remove(); };
  }, []);
  return null;
}

function Stars({ count = 100 }) {
  const stars = useRef(
    Array.from({ length: count }, () => ({
      left:  Math.random() * 100,
      top:   Math.random() * 100,
      size:  Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3,
      dur:   1.5 + Math.random() * 3,
      delay: Math.random() * 4,
    }))
  );
  return (
    <>
      {stars.current.map((s, i) => (
        <div key={i} className="h-star" style={{ left:`${s.left}%`, top:`${s.top}%`, width:s.size, height:s.size, animation:`hTwinkle ${s.dur}s ${s.delay}s infinite alternate` }}/>
      ))}
    </>
  );
}

export default function HomePage() {
  const { isConnected } = useAccount();
  const wrapRef = useRef(null);

  // Bolt spawner
  const spawn = useCallback((count = 1) => {
    if (!wrapRef.current) return;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const b = document.createElement("div");
        b.className = "h-bolt";
        b.style.cssText = `left:${5 + Math.random() * 90}%;`;
        wrapRef.current.appendChild(b);
        void b.offsetWidth;
        b.classList.add("active");
        setTimeout(() => b.remove(), 700);
      }, i * 150 + Math.random() * 100);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => { if (Math.random() < 0.2) spawn(1); }, 3500);
    return () => clearInterval(id);
  }, [spawn]);

  return (
    <>
      <InjectHomeStyles />

      <div className="home-wrap" ref={wrapRef}>

        {/* Scan line — absolute, inside content area */}
        <div className="h-scan-line" />

        {/* Stars */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
          <Stars count={120} />
        </div>

        {/* ── HERO ── */}
        <section style={{ position:"relative", zIndex:10, padding:"clamp(60px,10vh,100px) 24px 60px", textAlign:"center" }}>

          {/* Logo + RIALO + Royale Casino — sejajar dengan logo */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:18, marginBottom:20, flexWrap:"wrap" }}>
            <img
              src="https://pbs.twimg.com/profile_images/1950265537784926208/qbjSWMDP_400x400.jpg"
              alt="Rialo"
              style={{ width:64, height:64, borderRadius:14, objectFit:"cover", boxShadow:"0 0 20px rgba(0,245,255,0.22)", flexShrink:0 }}
            />
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:0 }}>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"clamp(38px,5vw,60px)", letterSpacing:5, color:"#ffffff", lineHeight:1 }}>RIALO</div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"clamp(9px,1vw,11px)", fontWeight:600, color:"#00f5ff", letterSpacing:5, textTransform:"uppercase", opacity:0.8, marginTop:2 }}>ROYALE CASINO</div>
            </div>
          </div>

          <p style={{ color:"#cbd5e1", fontSize:"clamp(14px,2vw,18px)", maxWidth:520, margin:"0 auto 36px", lineHeight:1.7 }}>
            Play provably fair games on Base Sepolia. Connect once, play everything. All outcomes are determined on-chain.
          </p>

          {/* CTA */}
          {!isConnected ? (
            <div style={{ display:"flex", justifyContent:"center", marginBottom:48 }}>
              <ConnectButton label="CONNECT AND PLAY" />
            </div>
          ) : (
            <div style={{ display:"flex", justifyContent:"center", gap:14, marginBottom:48, flexWrap:"wrap" }}>
              <Link href="/games/dice"><button className="h-cta-btn">PLAY NOW</button></Link>
            </div>
          )}

          {/* Stats */}
          <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap", animation:"hSlideUp .8s .3s ease-out both" }}>
            {STATS.map(s => (
              <div key={s.label} className="h-stat-card" style={{ minWidth:110 }}>
                <span className="h-stat-val">{s.value}</span>
                <span className="h-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── TICKER ── */}
        <div style={{ borderTop:"1px solid rgba(255,255,255,.04)", borderBottom:"1px solid rgba(255,255,255,.04)", padding:"10px 0", background:"rgba(0,0,0,.2)", position:"relative", zIndex:10 }}>
          <div className="h-ticker">
            <div className="h-ticker-inner">{TICKER_TEXT}{TICKER_TEXT}</div>
          </div>
        </div>

        <div className="h-sep" />

        {/* ── GAME CARDS ── */}
        <section style={{ position:"relative", zIndex:10, padding:"0 20px 80px" }}>
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:11, color:"#64748b", letterSpacing:6, marginBottom:8 }}>— AVAILABLE NOW —</div>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"clamp(32px,4vw,48px)", letterSpacing:4, background:"linear-gradient(180deg,#fff,#94a3b8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              CHOOSE YOUR GAME
            </div>
          </div>

          {/* 4-column equal grid */}
          <div className="h-games-grid">
            {GAMES.map((g, idx) => (
              <Link key={g.title} href={g.href} style={{ textDecoration:"none", pointerEvents:g.href==="#"?"none":"auto", display:"flex" }}>
                <div className="h-game-card" style={{ opacity:g.href==="#"?.5:1, width:"100%" }}>
                  <div className="h-card-shine"/>
                  <div style={{ height:3, background:`linear-gradient(90deg,rgba(${g.rgb},.8),rgba(${g.rgb},.2),transparent)`, flexShrink:0 }}/>
                  <div className="h-card-body">
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18 }}>
                      <div className="h-icon-orb" style={{ background:`radial-gradient(135deg at 30% 30%,rgba(${g.rgb},.3),rgba(${g.rgb},.1))`, border:`2px solid rgba(${g.rgb},.3)`, animationDelay:`${idx*.5}s` }}>
                        {g.coinSvg ? <CoinSvgIcon size={34}/> : <span style={{ fontSize:30, zIndex:1 }}>{g.icon}</span>}
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, padding:"5px 10px", borderRadius:20, letterSpacing:2, background:g.tag==="LIVE"?"rgba(74,222,128,.12)":"rgba(156,163,175,.1)", color:g.tag==="LIVE"?"#4ade80":"#9ca3af", border:`1px solid ${g.tag==="LIVE"?"rgba(74,222,128,.25)":"rgba(156,163,175,.2)"}` }}>
                        {g.tag==="LIVE"?"● LIVE":"◌ SOON"}
                      </span>
                    </div>
                    <h3 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:26, letterSpacing:2, color:"#e2e8f0", margin:"0 0 8px" }}>{g.title}</h3>
                    <p style={{ color:"#cbd5e1", fontSize:13, lineHeight:1.6, margin:"0 0 18px", flex:1 }}>{g.desc}</p>
                    <div style={{ display:"flex", gap:10 }}>
                      <div style={{ flex:1, padding:"8px 10px", borderRadius:10, background:`rgba(${g.rgb},.06)`, border:`1px solid rgba(${g.rgb},.15)`, textAlign:"center" }}>
                        <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:20, color:g.color, letterSpacing:1 }}>{g.mult}</div>
                        <div style={{ fontSize:9, color:"#64748b", letterSpacing:2 }}>MAX MULT</div>
                      </div>
                      <div style={{ flex:1, padding:"8px 10px", borderRadius:10, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", textAlign:"center" }}>
                        <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:20, color:"#cbd5e1", letterSpacing:1 }}>{g.chance}</div>
                        <div style={{ fontSize:9, color:"#64748b", letterSpacing:2 }}>WIN CHANCE</div>
                      </div>
                    </div>
                    {g.href !== "#" && (
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:14, paddingTop:14, borderTop:"1px solid rgba(255,255,255,.04)" }}>
                        <span style={{ fontSize:11, color:g.color, fontWeight:700, letterSpacing:2 }}>PLAY NOW</span>
                        <span style={{ fontSize:16, color:g.color }}>→</span>
                      </div>
                    )}
                  </div>
                  <div className="h-card-line" style={{ background:`linear-gradient(90deg,${g.color},transparent)` }}/>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="h-sep" />

        {/* ── HOW IT WORKS ── */}
        <section style={{ position:"relative", zIndex:10, padding:"0 20px 80px" }}>
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:11, color:"#64748b", letterSpacing:6, marginBottom:8 }}>— GETTING STARTED —</div>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:40, letterSpacing:4, background:"linear-gradient(180deg,#fff,#94a3b8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              HOW IT WORKS
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
            {HOW_TO.map(s => (
              <div key={s.num} className="h-step">
                <div className="h-step-num" style={{ background:`rgba(${s.rgb},.12)`, border:`2px solid rgba(${s.rgb},.3)`, color:s.color }}>{s.num}</div>
                <div>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:17, letterSpacing:2, color:"#e2e8f0", marginBottom:4 }}>{s.title}</div>
                  <div style={{ fontSize:12, color:"#cbd5e1", lineHeight:1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section style={{ position:"relative", zIndex:10, padding:"20px 20px 80px", textAlign:"center" }}>
          <div style={{ maxWidth:600, margin:"0 auto", padding:"40px 32px", borderRadius:24, background:"linear-gradient(135deg,rgba(0,100,200,.08),rgba(0,200,255,.04))", border:"1px solid rgba(0,245,255,.12)", boxShadow:"0 0 60px rgba(0,150,255,.08)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14, marginBottom:12 }}>
              <img src="https://pbs.twimg.com/profile_images/1950265537784926208/qbjSWMDP_400x400.jpg" alt="Rialo" style={{ width:44, height:44, borderRadius:10, objectFit:"cover" }}/>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:36, letterSpacing:5, color:"#ffffff" }}>READY TO PLAY?</div>
            </div>
            <p style={{ color:"#cbd5e1", fontSize:14, marginBottom:28 }}>No real money. Just on-chain fun on Base Sepolia testnet.</p>
            {!isConnected ? (
              <div style={{ display:"flex", justifyContent:"center" }}><ConnectButton label="CONNECT WALLET"/></div>
            ) : (
              <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
                {GAMES.filter(g => g.href !== "#").map(g => (
                  <Link key={g.href} href={g.href}>
                    <button style={{ padding:"12px 24px", borderRadius:50, border:`1px solid rgba(${g.rgb},.3)`, background:`rgba(${g.rgb},.08)`, color:g.color, fontFamily:"'Bebas Neue',cursive", fontSize:16, letterSpacing:3, cursor:"pointer", transition:"all .2s" }}>
                      {g.icon} {g.title.split(" ")[1]}
                    </button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <div style={{ borderTop:"1px solid rgba(255,255,255,.04)", padding:"20px 24px", textAlign:"center", position:"relative", zIndex:10 }}>
          <span style={{ fontSize:11, color:"#475569", letterSpacing:3 }}>
            RIALO ECOSYSTEM · BASE SEPOLIA TESTNET · FOR ENTERTAINMENT PURPOSES ONLY
          </span>
        </div>

      </div>
    </>
  );
}
