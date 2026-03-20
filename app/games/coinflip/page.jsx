"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent, usePublicClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatUnits, parseUnits } from "viem";
import { CHAIN_ID } from "@/lib/wagmi";
import { GUSDC_ADDRESS, TREASURY_ADDRESS, COINFLIP_ADDRESS, ERC20_ABI, COINFLIP_ABI, TREASURY_ABI, MAX_UINT } from "@/lib/contracts";

const BETS = [1, 2, 5, 10, 25, 50];

const CF_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Orbitron:wght@700;900&family=Rajdhani:wght@600;700&display=swap');
@keyframes cfBolt      { 0%{height:0;opacity:0} 15%{height:220px;opacity:1} 45%{height:400px;opacity:.6} 100%{height:420px;opacity:0} }
@keyframes cfBulb      { from{opacity:.3;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
@keyframes cfGlow      { from{filter:drop-shadow(0 0 4px #a78bfa)} to{filter:drop-shadow(0 0 18px #7c3aed)} }
@keyframes cfBtnPulse  { 0%,100%{box-shadow:0 5px 0 #660000,0 8px 28px rgba(255,60,0,.55),inset 0 1px 0 rgba(255,255,255,.2)} 50%{box-shadow:0 5px 0 #660000,0 8px 40px rgba(255,100,0,.9),inset 0 1px 0 rgba(255,255,255,.2)} }
@keyframes cfCoinFlip  { 0%{transform:rotateY(0deg)} 100%{transform:rotateY(1440deg)} }
@keyframes cfCoinIdle  { 0%,100%{transform:rotateY(0deg) rotateZ(-5deg)} 50%{transform:rotateY(20deg) rotateZ(5deg)} }
@keyframes cfWinPop    { 0%{transform:scale(.4) translateY(28px);opacity:0} 65%{transform:scale(1.07);opacity:1} 100%{transform:scale(1);opacity:1} }
@keyframes cfLosePop   { 0%{transform:translateY(-18px);opacity:0} 100%{transform:translateY(0);opacity:1} }
@keyframes cfOverlay   { 0%{opacity:0} 25%{opacity:1} 100%{opacity:0} }
@keyframes cfShimmer   { 0%{left:-100%} 100%{left:200%} }
@keyframes cfSpotSway  { 0%,100%{transform:rotate(-10deg)} 50%{transform:rotate(10deg)} }
@keyframes cfParticle  { 0%{transform:translate(0,0) rotate(0deg);opacity:1} 100%{transform:translate(var(--tx),var(--ty)) rotate(720deg) scale(.15);opacity:0} }
@keyframes cfStarTwinkle { from{opacity:.04} to{opacity:.88} }
@keyframes marqueeScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

/* Particle background */
.cf-bg-wrap {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse 110% 55% at 50% 0%, rgba(100,50,200,.14) 0%, transparent 55%),
    radial-gradient(ellipse 70% 40% at 5% 80%,  rgba(150,80,255,.07) 0%, transparent 50%),
    radial-gradient(ellipse 60% 35% at 95% 85%, rgba(100,50,200,.06) 0%, transparent 50%),
    #020610;
}
.cf-bg-star { position:absolute; border-radius:50%; background:#fff; pointer-events:none; }

.cf-machine {
  background: linear-gradient(160deg,#000d1a 0%,#001a2e 25%,#000f1f 55%,#001428 80%,#000a15 100%);
  border-radius: 24px 24px 32px 32px;
  border: 3px solid;
  /* Mencerahkan border mesin (Panah Atas) */
  border-color: #ffd700 #b8860b #daa520 #ffd700;
  box-shadow: 0 0 0 1px #221100, 0 0 60px rgba(255,215,0,.15), 0 32px 80px rgba(0,0,0,.9), inset 0 0 60px rgba(255,180,0,.03);
  position: relative;
}
.cf-machine::before { content:'';position:absolute;inset:6px;border-radius:20px 20px 28px 28px;border:1px solid rgba(255,215,0,.15);pointer-events:none; }

/* Mencerahkan bar chrome samping (Panah Kiri & Kanan) */
.cf-chrome-bar { 
  position:absolute;
  top:80px;
  width:14px;
  height:calc(100% - 140px);
  background:linear-gradient(90deg,#887,#ccb,#998,#ddc,#887);
  border-radius:6px;
  box-shadow:0 0 12px rgba(255,255,255,0.15), 0 0 5px rgba(0,0,0,0.5); 
}

.cf-spin-btn {
  width:100%;padding:15px 0;font-family:'Bebas Neue',cursive;font-size:26px;letter-spacing:5px;
  cursor:pointer;border:none;border-radius:50px;
  background:linear-gradient(180deg,#ff5555 0%,#dd1111 38%,#990000 55%,#cc2222 78%,#ff5555 100%);
  color:#fff;box-shadow:0 5px 0 #660000,0 8px 28px rgba(255,60,0,.55),inset 0 1px 0 rgba(255,255,255,.25);
  transition:all .1s;text-shadow:0 2px 6px rgba(0,0,0,.6);animation:cfBtnPulse 2.5s ease-in-out infinite;
  position:relative;overflow:hidden;font-weight:900;
}
.cf-spin-btn::after { content:'';position:absolute;top:0;width:40%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent);animation:cfShimmer 2.5s 1s infinite; }
.cf-spin-btn:active{transform:translateY(4px);box-shadow:0 1px 0 #660000,inset 0 1px 0 rgba(255,255,255,.15);animation:none}
.cf-spin-btn:disabled{background:linear-gradient(180deg,#333,#222);color:#555;cursor:not-allowed;animation:none;box-shadow:0 3px 0 #111}
.cf-spin-btn:disabled::after{display:none}
.cf-approve-btn { width:100%;padding:15px 0;font-family:'Bebas Neue',cursive;font-size:22px;letter-spacing:4px;cursor:pointer;border:none;border-radius:50px;background:linear-gradient(180deg,#ffdd44,#cc9900 40%,#886600 60%,#cc9900 80%,#ffdd44 100%);color:#0a0a00;box-shadow:0 5px 0 #664400,0 8px 28px rgba(255,180,0,.4),inset 0 1px 0 rgba(255,255,255,.4);transition:all .1s;font-weight:900; }
.cf-approve-btn:active{transform:translateY(4px);box-shadow:0 1px 0 #664400}
.cf-approve-btn:disabled{background:linear-gradient(180deg,#333,#222);color:#555;cursor:not-allowed;box-shadow:0 3px 0 #111}
.cf-bet-chip { padding:8px 14px;border-radius:50px;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;cursor:pointer;border:2px solid #550000;background:linear-gradient(180deg,#2a0000,#1a0000);color:#aaa;transition:all .15s; }
.cf-bet-chip:hover{border-color:#aa0000;color:#fff;transform:translateY(-1px)}
.cf-bet-chip.active{background:linear-gradient(180deg,#7a2200,#551100);border-color:#FFD700;color:#FFD700;box-shadow:0 0 14px rgba(255,165,0,.5),0 3px 0 #441100;}
.cf-bet-chip:disabled{opacity:.4;cursor:not-allowed;transform:none}
.cf-lcd { background:linear-gradient(180deg,#000806,#001208);border:2px solid #003322;border-radius:8px;font-family:'Orbitron',monospace;box-shadow:inset 0 0 16px rgba(0,80,50,.3),0 0 8px rgba(0,180,80,.12); }
.cf-win-overlay { position:fixed;inset:0;pointer-events:none;z-index:999;background:radial-gradient(ellipse at 50% 40%,rgba(255,220,0,.18),transparent 65%);animation:cfOverlay .8s ease-out forwards; }
.cf-bolt { position:absolute;top:0;width:3px;background:linear-gradient(180deg,#fff,#ffee99,rgba(255,200,0,0));opacity:0;border-radius:2px;pointer-events:none;filter:blur(1.5px);box-shadow:0 0 12px 6px rgba(255,180,0,.7),0 0 40px 14px rgba(255,120,0,.35); }
.cf-bolt.active { animation:cfBolt .5s ease-out forwards; }
.cf-particle { position:absolute;width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff,#FFD700,#aa6600);border:1px solid #886600;animation:cfParticle var(--dur,.8s) var(--delay,0s) ease-out forwards;pointer-events:none;z-index:100; }
.cf-coin-stage { perspective:600px;perspective-origin:50% 50%; }
.cf-coin-3d { width:150px;height:150px;transform-style:preserve-3d;position:relative;cursor:default; }
.cf-coin-3d.idle { animation:cfCoinIdle 3s ease-in-out infinite; }
.cf-coin-3d.spinning { animation:cfCoinFlip .4s linear infinite; }
.cf-coin-3d.result { transition:transform .5s cubic-bezier(0.175,0.885,0.32,1.275); }
.cf-coin-face { position:absolute;inset:0;border-radius:50%;backface-visibility:hidden;display:flex;align-items:center;justify-content:center;font-size:64px;border:4px solid; }
.cf-coin-heads { background:radial-gradient(circle at 35% 35%,#ffe066,#d4a017,#8a6500);border-color:#d4a017;transform:translateZ(0);box-shadow:inset 0 0 30px rgba(0,0,0,0.3),0 0 30px rgba(255,200,0,0.4); }
.cf-coin-tails { background:radial-gradient(circle at 35% 35%,#aab8c8,#708090,#3a4a5a);border-color:#708090;transform:rotateY(180deg) translateZ(0);box-shadow:inset 0 0 30px rgba(0,0,0,0.4),0 0 20px rgba(100,150,200,0.3); }
.cf-coin-edge { position:absolute;left:50%;top:0;width:12px;height:100%;margin-left:-6px;background:linear-gradient(90deg,#cc9900,#ffee77,#cc9900,#ffee77,#cc9900);transform:rotateY(90deg);border-radius:3px; }
.cf-coin-shadow { width:120px;height:20px;margin:10px auto 0;background:radial-gradient(ellipse,rgba(167,139,250,0.3),transparent 70%);border-radius:50%; }
.cf-choice-btn { flex:1;padding:16px 8px;border-radius:16px;font-family:'Bebas Neue',cursive;font-size:20px;letter-spacing:3px;cursor:pointer;border:2px solid;transition:all .15s;position:relative;overflow:hidden; }
.cf-result-win { animation:cfWinPop .4s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
.cf-result-lose { animation:cfLosePop .3s ease-out forwards; }
`;

function InjectCFStyles() {
  useEffect(() => {
    const id = "cf-pro-styles-v3";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id; el.textContent = CF_CSS;
      document.head.appendChild(el);
    }
    return () => { const el = document.getElementById(id); if (el) el.remove(); };
  }, []);
  return null;
}

function BgStars({ count = 110 }) {
  const stars = useRef(Array.from({ length: count }, () => ({
    l: Math.random()*100, t: Math.random()*100,
    s: Math.random()<.7?1:Math.random()<.9?2:3,
    d: 1.5+Math.random()*3, delay: Math.random()*4,
  })));
  return (
    <>
      {stars.current.map((s,i) => (
        <div key={i} className="cf-bg-star" style={{ left:`${s.l}%`, top:`${s.t}%`, width:s.s, height:s.s, animation:`cfStarTwinkle ${s.d}s ${s.delay}s infinite alternate` }} />
      ))}
    </>
  );
}

function Coin3D({ spinning, resultHeads }) {
  const stateClass = spinning ? "spinning" : resultHeads === null ? "idle" : "result";
  const resultStyle = resultHeads === null ? {} : { transform: resultHeads ? "rotateY(0deg)" : "rotateY(180deg)" };
  return (
    <div className="cf-coin-stage">
      <div className={`cf-coin-3d ${stateClass}`} style={resultStyle}>
        <div className="cf-coin-face cf-coin-heads">🦅</div>
        <div className="cf-coin-face cf-coin-tails">🛡️</div>
        <div className="cf-coin-edge" />
      </div>
      <div className="cf-coin-shadow" />
    </div>
  );
}

function useCFLightning(ref) {
  const spawn = useCallback((count = 1) => {
    if (!ref.current) return;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const b = document.createElement("div");
        b.className = "cf-bolt";
        b.style.cssText = `left:${8+Math.random()*84}%;`;
        ref.current.appendChild(b);
        void b.offsetWidth; b.classList.add("active");
        setTimeout(() => b.remove(), 600);
      }, i * 130 + Math.random() * 90);
    }
  }, [ref]);
  useEffect(() => {
    const id = setInterval(() => { if (Math.random() < .1) spawn(1); }, 2500);
    return () => clearInterval(id);
  }, [spawn]);
  return spawn;
}

function useCFParticles(ref) {
  return useCallback((count = 14) => {
    if (!ref.current) return;
    const { width, height } = ref.current.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "cf-particle";
      const a = (Math.PI*2*i)/count + Math.random()*.5;
      const d = 60 + Math.random()*110;
      p.style.cssText = `left:${width/2-8}px;top:${height*.38}px;--tx:${Math.cos(a)*d}px;--ty:${-80-Math.random()*90}px;--dur:${.55+Math.random()*.5}s;--delay:${Math.random()*.25}s;`;
      ref.current.appendChild(p);
      setTimeout(() => p.remove(), 1100);
    }
  }, [ref]);
}

function SidebarCoinIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#d97706" />
      <circle cx="12" cy="12" r="9" fill="#fbbf24" />
      <circle cx="12" cy="12" r="7" fill="#d97706" opacity="0.4" />
      <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1a0a00" fontFamily="serif">$</text>
      <ellipse cx="9" cy="9" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.35)" transform="rotate(-30 9 9)" />
    </svg>
  );
}

const CF_BULB_C = ["#FFD700","#FF4444","#44FFAA","#4499FF","#FF44FF","#FF8800"];
function CFBulbs({ count = 26 }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", padding:"0 2px" }}>
      {Array.from({ length: count }).map((_, i) => {
        const c = CF_BULB_C[i % CF_BULB_C.length];
        return <div key={i} style={{ width:10,height:10,borderRadius:"50%",background:`radial-gradient(circle at 35% 35%,#fff,${c})`,boxShadow:`0 0 6px 3px ${c}`,animation:`cfBulb 1.1s ${(i*.055)%1}s infinite alternate`,flexShrink:0 }} />;
      })}
    </div>
  );
}

function CFResultBanner({ result, onReset }) {
  if (!result) return null;
  if (result.won) return (
    <div className="cf-result-win" style={{ textAlign:"center",padding:"14px 10px",background:"linear-gradient(135deg,rgba(40,0,60,0.4),rgba(80,0,120,0.25),rgba(40,0,60,0.4))",border:"2px solid rgba(167,139,250,0.45)",borderRadius:16,marginBottom:14,boxShadow:"0 0 30px rgba(150,80,255,0.2)" }}>
      <div style={{ fontSize:28,marginBottom:4 }}>🎉🪙🎉</div>
      <div style={{ fontFamily:"'Bebas Neue',cursive",fontSize:30,letterSpacing:4,background:"linear-gradient(180deg,#fff,#cc88ff,#9933dd)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:4 }}>WIN — +{Number(result.payout).toLocaleString()} gUSDC</div>
      <div style={{ fontSize:36,marginBottom:6 }}>{result.resultHeads?"🦅":"🛡️"}</div>
      <div style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:20,background:"rgba(167,139,250,0.12)",border:"1px solid rgba(167,139,250,0.3)",marginBottom:12 }}>
        <span style={{ color:"#a78bfa",fontSize:12,fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{result.resultHeads?"HEADS":"TAILS"} · YOUR PICK: {result.isHeads?"HEADS":"TAILS"}</span>
      </div><br/>
      <button onClick={onReset} style={{ padding:"8px 24px",borderRadius:50,border:"1px solid rgba(167,139,250,0.4)",background:"rgba(167,139,250,0.1)",color:"#a78bfa",fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer" }}>↩ FLIP AGAIN</button>
    </div>
  );
  return (
    <div className="cf-result-lose" style={{ textAlign:"center",padding:"12px 10px",background:"linear-gradient(135deg,rgba(40,0,0,0.4),rgba(80,0,0,0.2),rgba(40,0,0,0.4))",border:"1px solid rgba(248,113,113,0.3)",borderRadius:14,marginBottom:14 }}>
      <div style={{ fontSize:24,marginBottom:4 }}>😔</div>
      <div style={{ fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:700,color:"#f87171",marginBottom:4,letterSpacing:2 }}>-{result.bet} gUSDC</div>
      <div style={{ fontSize:32,marginBottom:6 }}>{result.resultHeads?"🦅":"🛡️"}</div>
      <div style={{ color:"#cbd5e1",fontSize:11,fontFamily:"'Rajdhani',sans-serif",marginBottom:10 }}>RESULT: {result.resultHeads?"HEADS":"TAILS"} · YOUR PICK: {result.isHeads?"HEADS":"TAILS"}</div>
      <button onClick={onReset} style={{ padding:"7px 22px",borderRadius:50,border:"1px solid rgba(248,113,113,0.3)",background:"rgba(248,113,113,0.08)",color:"#f87171",fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer" }}>TRY AGAIN</button>
    </div>
  );
}

export default function CoinFlipPage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient({ chainId: CHAIN_ID });
  const [bet, setBet] = useState(5);
  const [isHeads, setIsHeads] = useState(true);
  const [busy, setBusy] = useState(false);
  const [approving, setApproving] = useState(false);
  const [coinFace, setCoinFace] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [err, setErr] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [winOverlay, setWinOverlay] = useState(false);
  const handled = useRef(false);
  const pollRef = useRef(null);
  const wrapRef = useRef(null);
  const lightRef = useRef(null);
  const betWei = parseUnits(bet.toString(), 6);
  const { data: gusdcBal,   refetch: rBal   } = useReadContract({ address: GUSDC_ADDRESS, abi: ERC20_ABI, functionName: "balanceOf", args: [address], query: { enabled: !!address }, chainId: CHAIN_ID });
  const { data: gusdcAllow, refetch: rAllow  } = useReadContract({ address: GUSDC_ADDRESS, abi: ERC20_ABI, functionName: "allowance", args: [address, COINFLIP_ADDRESS], query: { enabled: !!address }, chainId: CHAIN_ID });
  const { data: bankroll }                     = useReadContract({ address: TREASURY_ADDRESS, abi: TREASURY_ABI, functionName: "netBankroll", chainId: CHAIN_ID });
  const balance = gusdcBal ? parseFloat(formatUnits(gusdcBal, 6)).toFixed(2) : "0.00";
  const bankrollFmt = bankroll ? parseFloat(formatUnits(bankroll, 6)).toFixed(0) : "0";
  const needApprove = !gusdcAllow || gusdcAllow < betWei;
  const spawnLightning = useCFLightning(lightRef);
  const spawnParticles = useCFParticles(wrapRef);
  useEffect(() => { const id = setInterval(() => spawnLightning(1), 8000+Math.random()*4000); return () => clearInterval(id); }, [spawnLightning]);
  const processResult = useCallback((args) => {
    if (handled.current) return; handled.current = true; clearInterval(pollRef.current);
    const { resultHeads, playerHeads, won, payoutAmount, betAmount } = args;
    const payout = payoutAmount ? parseFloat(formatUnits(payoutAmount, 6)).toFixed(2) : "0";
    const betAmt = betAmount ? parseFloat(formatUnits(betAmount, 6)).toFixed(2) : bet.toString();
    setCoinFace(resultHeads); setBusy(false);
    const res = { won, resultHeads, isHeads: playerHeads, payout, bet: parseFloat(betAmt) };
    setResult(res); setHistory(h => [res, ...h.slice(0, 11)]);
    if (won) { setWinOverlay(true); setTimeout(() => setWinOverlay(false), 900); spawnLightning(5); spawnParticles(16); }
    rBal();
  }, [bet, rBal, spawnLightning, spawnParticles]);
  useWatchContractEvent({ address: COINFLIP_ADDRESS, abi: COINFLIP_ABI, eventName: "FlipResult", chainId: CHAIN_ID, pollingInterval: 1_000,
    onLogs(logs) { const log = logs.find(l => l.args?.player?.toLowerCase() === address?.toLowerCase()); if (log) processResult(log.args); } });
  const startPoll = useCallback((fromBlock) => {
    clearInterval(pollRef.current); handled.current = false;
    pollRef.current = setInterval(async () => {
      if (handled.current) { clearInterval(pollRef.current); return; }
      try {
        const logs = await publicClient.getLogs({ address: COINFLIP_ADDRESS,
          event: { type:"event", name:"FlipResult", inputs:[{name:"player",type:"address",indexed:true},{name:"resultHeads",type:"bool",indexed:false},{name:"playerHeads",type:"bool",indexed:false},{name:"won",type:"bool",indexed:false},{name:"betAmount",type:"uint256",indexed:false},{name:"payoutAmount",type:"uint256",indexed:false},{name:"nonce",type:"uint256",indexed:false}] },
          args: { player: address }, fromBlock: fromBlock ?? "latest", toBlock: "latest" });
        if (logs.length > 0) processResult(logs[logs.length-1].args);
      } catch {}
    }, 1_500);
    setTimeout(() => { clearInterval(pollRef.current); if (!handled.current) setBusy(false); }, 30_000);
  }, [publicClient, address, processResult]);
  const handleApprove = async () => {
    setErr(null); setApproving(true);
    try { await writeContractAsync({ address: GUSDC_ADDRESS, abi: ERC20_ABI, functionName: "approve", args: [COINFLIP_ADDRESS, MAX_UINT], chainId: CHAIN_ID }); setTimeout(() => rAllow(), 2000); }
    catch (e) { setErr(e.shortMessage || "Approve failed"); } setApproving(false);
  };
  const handleFlip = async () => {
    if (!isConnected || busy || isPending) return;
    if (parseFloat(balance) < bet) { setErr(`Insufficient gUSDC balance (${balance}).`); return; }
    setErr(null); setResult(null); setCoinFace(null); handled.current = false; setBusy(true); spawnLightning(2);
    try {
      const curBlock = await publicClient.getBlockNumber();
      const hash = await writeContractAsync({ address: COINFLIP_ADDRESS, abi: COINFLIP_ABI, functionName: "flip", args: [betWei, isHeads], chainId: CHAIN_ID });
      setTxHash(hash); startPoll(curBlock - 1n);
    } catch (e) { setErr(e.shortMessage || e.message || "Transaction failed"); setBusy(false); }
  };
  const reset = () => { setResult(null); setCoinFace(null); setErr(null); setBusy(false); };

  return (
    <>
      <InjectCFStyles />
      {winOverlay && <div className="cf-win-overlay" />}
      <div ref={lightRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:50 }} />

      <div className="cf-bg-wrap" ref={wrapRef}>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
          <BgStars count={110} />
        </div>
        <div style={{ position:"absolute", top:0, left:"12%", pointerEvents:"none", opacity:0.4, zIndex:1 }}>
          <div style={{ width:110, height:280, background:"linear-gradient(180deg,rgba(150,80,255,0.1),transparent)", transformOrigin:"top center", animation:"cfSpotSway 4.5s ease-in-out infinite" }} />
        </div>
        <div style={{ position:"absolute", top:0, right:"12%", pointerEvents:"none", opacity:0.3, zIndex:1 }}>
          <div style={{ width:110, height:280, background:"linear-gradient(180deg,rgba(120,60,220,0.08),transparent)", transformOrigin:"top center", animation:"cfSpotSway 4.5s 1.8s ease-in-out infinite reverse" }} />
        </div>

        <div style={{ position:"relative", zIndex:10, padding:"24px 16px 40px" }}>
          <div style={{ maxWidth:1060, margin:"0 auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:26 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <SidebarCoinIcon size={28} />
                <div>
                  <h1 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:32, letterSpacing:5, background:"linear-gradient(180deg,#fff,#fbbf24,#d97706)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", margin:0, lineHeight:1 }}>- RIALO ROYAL CASINO -</h1>
                  {/* Teks Subtitle dibuat lebih terang */}
                  <p style={{ color:"#94a3b8", fontSize:10, margin:"2px 0 0", letterSpacing:2, fontFamily:"'Rajdhani',sans-serif" }}>Block Entropy Mix · 50/50 · 1.96× · 2% House Edge</p>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                {/* Teks Label dibuat lebih terang */}
                <p style={{ color:"#94a3b8", fontSize:9, margin:"0 0 2px", letterSpacing:2, fontFamily:"'Rajdhani',sans-serif" }}>NET BANKROLL</p>
                <p style={{ fontFamily:"'Orbitron',monospace", color:"#4ade80", fontSize:22, fontWeight:900, margin:0, animation:"cfGlow 2s infinite alternate" }}>{Number(bankrollFmt).toLocaleString()} USDC</p>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:18, alignItems:"start" }}>
              <div className="cf-machine">
                <div className="cf-chrome-bar" style={{ left:-9 }} />
                <div className="cf-chrome-bar" style={{ right:-9 }} />
                {/* Border Bottom Header Mesin dipercerah */}
                <div style={{ background:"linear-gradient(180deg,#1a0000,#300000,#1a0000)", borderBottom:"2px solid rgba(255,215,0,0.6)", borderRadius:"20px 20px 0 0", padding:"12px 24px 8px", textAlign:"center" }}>
                  <div style={{ overflow:"hidden", marginBottom:8, height:18 }}>
                    {/* Teks Marquee dipercerah */}
                    <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:11, color:"#ffaa00", letterSpacing:4, whiteSpace:"nowrap", animation:"marqueeScroll 14s linear infinite" }}>
                      ★ HEADS OR TAILS ★ &nbsp;&nbsp;&nbsp; 🪙 1.96× PAYOUT &nbsp;&nbsp;&nbsp; ⚡ INSTANT RESULT &nbsp;&nbsp;&nbsp; 🔐 ON-CHAIN FAIR &nbsp;&nbsp;&nbsp;
                    </div>
                  </div>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:44, letterSpacing:8, background:"linear-gradient(180deg,#fff 0%,#FFD700 35%,#FFA500 65%,#cc6600 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", filter:"drop-shadow(0 0 14px rgba(255,160,0,0.7))", lineHeight:1 }}>LUCKY FLIP</div>
                  <CFBulbs count={26} />
                </div>
                <div style={{ padding:"20px 24px 26px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                    <div className="cf-lcd" style={{ padding:"6px 14px" }}>
                      {/* Label Balance dipercerah */}
                      <span style={{ display:"block", fontSize:9, color:"#4ade80", letterSpacing:2, fontFamily:"'Rajdhani',sans-serif" }}>gUSDC BALANCE</span>
                      <span style={{ fontSize:16, color:"#4ade80", letterSpacing:2, fontFamily:"'Orbitron',monospace", fontWeight:700 }}>{balance}</span>
                    </div>
                    <a href="/faucet" style={{ fontSize:11, color:"#fb923c", padding:"7px 14px", background:"rgba(251,146,60,0.06)", border:"1px solid rgba(251,146,60,0.2)", borderRadius:50, textDecoration:"none", fontFamily:"'Rajdhani',sans-serif", fontWeight:700, letterSpacing:1 }}>+ SWAP</a>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:20 }}>
                    <div style={{ padding:"28px 40px", borderRadius:20, background:"linear-gradient(180deg,#060010,#0a0018,#060010)", border:"3px solid #334", boxShadow:"inset 0 4px 20px rgba(0,0,0,0.9),0 4px 20px rgba(0,0,0,0.6)", position:"relative" }}>
                      {[0,1,2,3].map(i => (
                        <div key={i} style={{ position:"absolute", width:9, height:9, borderRadius:"50%", background:"radial-gradient(circle at 35% 35%,#aaa,#555)", border:"1px solid #333", top:i<2?8:undefined, bottom:i>=2?8:undefined, left:i%2===0?8:undefined, right:i%2===1?8:undefined }} />
                      ))}
                      <Coin3D spinning={busy} resultHeads={coinFace} />
                    </div>
                    <div style={{ marginTop:10, textAlign:"center", minHeight:20 }}>
                      {/* Prompt dipercerah */}
                      {!busy && coinFace===null && <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:12, color:"#cbd5e1", letterSpacing:3 }}>CHOOSE HEADS OR TAILS</span>}
                      {busy && <span style={{ fontFamily:"'Orbitron',monospace", fontSize:12, fontWeight:700, color:"#a78bfa", letterSpacing:3, animation:"cfGlow 0.6s infinite alternate" }}>⚡ FLIPPING...</span>}
                      {!busy && coinFace!==null && !result?.won && <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:13, color:coinFace?"#fbbf24":"#cbd5e1", fontWeight:700, letterSpacing:2 }}>{coinFace?"🦅 HEADS":"🛡️ TAILS"}</span>}
                    </div>
                  </div>
                  {result && !busy && <CFResultBanner result={result} onReset={reset} />}
                  {err && <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)", borderRadius:10, padding:"9px 14px", marginBottom:12, color:"#f87171", fontSize:12, fontFamily:"'Rajdhani',sans-serif", fontWeight:600 }}>⚠️ {err}</div>}
                  {isConnected && needApprove && !busy && <div style={{ background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.25)", borderRadius:10, padding:"9px 14px", marginBottom:12, color:"#fbbf24", fontSize:11, fontFamily:"'Rajdhani',sans-serif", fontWeight:600 }}>⚡ Approve gUSDC to CoinFlip contract before your first flip.</div>}
                  
                  {/* Label input dipercerah */}
                  <div style={{ fontSize:9, color:"#94a3b8", textTransform:"uppercase", letterSpacing:3, marginBottom:8, fontFamily:"'Rajdhani',sans-serif", fontWeight:600 }}>CHOOSE YOUR SIDE</div>
                  <div style={{ display:"flex", gap:10, marginBottom:18 }}>
                    {[{val:true,label:"HEADS",icon:"🦅",color:"#fbbf24",rgb:"251,191,36"},{val:false,label:"TAILS",icon:"🛡️",color:"#cbd5e1",rgb:"148,163,184"}].map(o => (
                      <button key={o.label} className="cf-choice-btn" onClick={() => setIsHeads(o.val)} disabled={busy}
                        style={{ background:isHeads===o.val?`rgba(${o.rgb},0.12)`:"rgba(255,255,255,0.02)", borderColor:isHeads===o.val?`rgba(${o.rgb},0.55)`:"rgba(255,255,255,0.07)", color:isHeads===o.val?o.color:"#94a3b8", opacity:busy?0.45:1 }}>
                        <span style={{ fontSize:28, display:"block", marginBottom:4 }}>{o.icon}</span>{o.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize:9, color:"#94a3b8", textTransform:"uppercase", letterSpacing:3, marginBottom:8, fontFamily:"'Rajdhani',sans-serif", fontWeight:600 }}>BET AMOUNT (gUSDC)</div>
                  <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:18 }}>
                    {BETS.map(v => <button key={v} className={`cf-bet-chip${bet===v?" active":""}`} onClick={() => setBet(v)} disabled={busy}>{v}</button>)}
                  </div>

                  {isConnected ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {needApprove
                        ? <button className="cf-approve-btn" onClick={handleApprove} disabled={approving}>{approving?"⏳ APPROVING...":"🔓 APPROVE gUSDC"}</button>
                        : <button className="cf-spin-btn" onClick={handleFlip} disabled={busy}>{busy?"⚡ PROCESSING...":`🪙 FLIP ${isHeads?"HEADS":"TAILS"} — ${bet} gUSDC`}</button>}
                      {txHash && <a href={`https://sepolia.basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ textAlign:"center", fontSize:10, color:"#64748b", textDecoration:"none", fontFamily:"'Rajdhani',sans-serif" }}>↗ View on Basescan</a>}
                    </div>
                  ) : <div style={{ display:"flex", justifyContent:"center", paddingTop:4 }}><ConnectButton label="Connect Wallet" /></div>}
                </div>
                <div style={{ height:16, margin:"0 16px", background:"linear-gradient(180deg,#2a2a2a,#444,#333,#555,#222)", borderRadius:"0 0 20px 20px", borderTop:"2px solid #666", boxShadow:"0 8px 24px rgba(0,0,0,0.7)" }} />
              </div>

              {/* Panel Kanan dengan teks lebih terang */}
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ background:"#080d1a", border:"1px solid rgba(167,139,250,0.08)", borderRadius:16, padding:"14px 16px" }}>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:14, color:"#a78bfa", letterSpacing:4, marginBottom:12 }}>★ HOW TO PLAY ★</div>
                  {[{num:"01",color:"#a78bfa",text:"Choose HEADS (🦅) or TAILS (🛡️) — your prediction."},{num:"02",color:"#fbbf24",text:"Set your bet amount in gUSDC using the chips below."},{num:"03",color:"#4ade80",text:"Click FLIP — the result is resolved instantly on-chain."},{num:"04",color:"#00f5ff",text:"Win 1.96× your bet if the coin lands on your chosen side."}].map(s => (
                    <div key={s.num} style={{ display:"flex", gap:10, marginBottom:10, alignItems:"flex-start" }}>
                      <div style={{ width:24,height:24,borderRadius:8,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.2)",fontFamily:"'Bebas Neue',cursive",fontSize:11,color:s.color }}>{s.num}</div>
                      <p style={{ color:"#cbd5e1",fontSize:12,margin:0,lineHeight:1.5,fontFamily:"'Rajdhani',sans-serif" }}>{s.text}</p>
                    </div>
                  ))}
                </div>

                <div style={{ background:"#080d1a", border:"1px solid rgba(255,255,255,0.05)", borderRadius:16, padding:"14px 16px" }}>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:14, color:"#fb923c", letterSpacing:4, marginBottom:10 }}>GAME INFO</div>
                  {[["Win Chance","50%"],["Payout","1.96×"],["House Edge","2%"],["Min Bet","1 gUSDC"],["Max Bet","100 gUSDC"],["TX","1 (instant)"]].map(([l,v]) => (
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:11, fontFamily:"'Rajdhani',sans-serif" }}>
                      <span style={{ color:"#cbd5e1" }}>{l}</span><span style={{ color:"#e2e8f0", fontWeight:700 }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background:"#080d1a", border:"1px solid rgba(255,255,255,0.05)", borderRadius:16, padding:"14px 16px" }}>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:14, color:"#fb923c", letterSpacing:4, marginBottom:10 }}>FLIP HISTORY</div>
                  {history.length===0 ? <p style={{ color:"#64748b",fontSize:11,textAlign:"center",padding:"10px 0",fontFamily:"'Rajdhani',sans-serif" }}>No flips yet</p>
                  : history.map((h,i) => (
                    <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",borderRadius:10,marginBottom:4,background:h.won?"rgba(74,222,128,0.06)":"rgba(248,113,113,0.05)",border:`1px solid ${h.won?"rgba(74,222,128,0.12)":"rgba(248,113,113,0.1)"}` }}>
                      <span style={{ fontSize:13 }}>{h.resultHeads?"🦅":"🛡️"} <span style={{ fontSize:10,color:"#cbd5e1",fontFamily:"'Rajdhani',sans-serif" }}>vs {h.isHeads?"🦅":"🛡️"}</span></span>
                      <span style={{ fontWeight:700,fontSize:11,fontFamily:"'Orbitron',monospace",color:h.won?"#4ade80":"#f87171" }}>{h.won?`+${Number(h.payout).toFixed(2)}`:`-${h.bet}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}