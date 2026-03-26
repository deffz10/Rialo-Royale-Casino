"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent, usePublicClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatUnits, parseUnits } from "viem";
import { CHAIN_ID } from "@/lib/wagmi";
import { GUSDC_ADDRESS, TREASURY_ADDRESS, SLOTS_ADDRESS, ERC20_ABI, SLOTS_ABI, TREASURY_ABI, MAX_UINT } from "@/lib/contracts";

const SYMBOLS = [
  { id:0, emoji:"💎", label:"Diamond", mult:"50×",  color:"#00f5ff", rarity:"Ultra Rare" },
  { id:1, emoji:"7️⃣", label:"Seven",   mult:"20×",  color:"#fbbf24", rarity:"Rare"       },
  { id:2, emoji:"🎰", label:"Slots",   mult:"10×",  color:"#a78bfa", rarity:"Rare"       },
  { id:3, emoji:"🍋", label:"Lemon",   mult:"3×",   color:"#fde047", rarity:"Uncommon"   },
  { id:4, emoji:"🍊", label:"Orange",  mult:"2×",   color:"#fb923c", rarity:"Common"     },
  { id:5, emoji:"🍒", label:"Cherry",  mult:"1.5×", color:"#f87171", rarity:"Common"     },
  { id:6, emoji:"⭐", label:"Star",    mult:"1.2×", color:"#facc15", rarity:"Common"     },
];
const BETS = [1, 2, 5, 10, 25, 50];
const SPIN_TOPIC = "0x796eb98d52bf803976b33eb7b351a9eb9819d45bf48633ca9defe901778d37f8";
const BULB_COLORS = ["#FFD700","#FF4444","#44FFAA","#4499FF","#FF44FF","#FF8800"];

const SLOTS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Orbitron:wght@700;900&family=Rajdhani:wght@600;700&display=swap');
@keyframes twinkle      { from{opacity:.15} to{opacity:1} }
@keyframes bulbPulse    { from{opacity:.3;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
@keyframes jackpotNum   { from{filter:drop-shadow(0 0 4px #ff8)} to{filter:drop-shadow(0 0 18px #f80)} }
@keyframes spinReel     { 0%{transform:translateY(-24px);opacity:.5} 50%{transform:translateY(0);opacity:1} 100%{transform:translateY(24px);opacity:.5} }
@keyframes reelWinFlash { 0%,100%{box-shadow:inset 3px 0 14px #000,inset -3px 0 14px #000} 50%{box-shadow:inset 3px 0 14px #000,inset -3px 0 14px #000,0 0 40px 14px rgba(255,220,0,.85),inset 0 0 40px rgba(255,220,0,.35)} }
@keyframes boltFlash    { 0%{height:0;opacity:0} 15%{height:200px;opacity:1} 40%{height:380px;opacity:.7} 70%{opacity:.3} 100%{height:420px;opacity:0} }
@keyframes coinFly      { 0%{transform:translate(0,0) rotate(0deg) scale(1);opacity:1} 100%{transform:translate(var(--tx),var(--ty)) rotate(720deg) scale(.2);opacity:0} }
@keyframes winBanner    { 0%{transform:scale(.4) translateY(30px);opacity:0} 60%{transform:scale(1.08) translateY(-4px);opacity:1} 100%{transform:scale(1) translateY(0);opacity:1} }
@keyframes loseBanner   { 0%{transform:translateY(-20px);opacity:0} 100%{transform:translateY(0);opacity:1} }
@keyframes overlayFlash { 0%{opacity:0} 25%{opacity:1} 100%{opacity:0} }
@keyframes marqueeScroll{ 0%{transform:translateX(100%)} 100%{transform:translateX(-100%)} }
@keyframes spotSway     { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(8deg)} }
@keyframes spinBtnPulse { 0%,100%{box-shadow:0 5px 0 #660000,0 8px 28px rgba(255,60,0,.55),inset 0 1px 0 rgba(255,255,255,.25)} 50%{box-shadow:0 5px 0 #660000,0 8px 40px rgba(255,100,0,.9),inset 0 1px 0 rgba(255,255,255,.25)} }
@keyframes symbolPop    { 0%{transform:scale(0.6)} 70%{transform:scale(1.15)} 100%{transform:scale(1)} }
@keyframes shimmerSlide { 0%{left:-100%} 100%{left:200%} }
@keyframes sStarTwinkle { from{opacity:.04} to{opacity:.88} }

/* ── Particle BG ── */
.s-bg-wrap {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse 110% 55% at 50% 0%, rgba(200,80,0,.12) 0%, transparent 55%),
    radial-gradient(ellipse 70% 40% at 5% 80%,  rgba(255,100,0,.07) 0%, transparent 50%),
    radial-gradient(ellipse 60% 35% at 95% 85%, rgba(180,60,0,.05) 0%, transparent 50%),
    #020610;
}
.s-bg-star { position:absolute; border-radius:50%; background:#fff; pointer-events:none; }

.s-machine {
  background:linear-gradient(160deg,#1e0000 0%,#2d0000 25%,#200000 50%,#2d0000 75%,#1e0000 100%);
  border-radius:24px 24px 32px 32px;border:3px solid;border-color:#cc9900 #886600 #aa7700 #cc9900;
  box-shadow:0 0 0 1px #441100,0 0 60px rgba(180,60,0,.35),0 32px 80px rgba(0,0,0,.9),inset 0 0 60px rgba(255,40,0,.06);
  position:relative;
}
.s-machine::before { content:'';position:absolute;inset:6px;border-radius:20px 20px 28px 28px;border:1px solid rgba(255,180,0,.12);pointer-events:none; }
.s-chrome-bar { position:absolute;top:80px;width:14px;height:calc(100% - 140px);background:linear-gradient(90deg,#555,#eee,#999,#ddd,#666);border-radius:6px;box-shadow:0 0 10px rgba(0,0,0,.6); }
.s-reel-window { background:linear-gradient(180deg,#080808,#111,#0c0c0c);border-radius:14px;border:5px solid;border-color:#999 #444 #666 #ccc;box-shadow:inset 0 6px 24px rgba(0,0,0,.95),inset 0 -3px 10px rgba(255,255,255,.04),0 4px 24px rgba(0,0,0,.8);position:relative;overflow:hidden; }
.s-reel { width:110px;height:150px;background:linear-gradient(90deg,#0a0a0a 0%,#1a1a1a 18%,#242424 50%,#1a1a1a 82%,#0a0a0a 100%);border-radius:6px;border:2px solid;border-color:#555 #222 #333 #888;position:relative;overflow:hidden;box-shadow:inset 5px 0 16px rgba(0,0,0,.9),inset -5px 0 16px rgba(0,0,0,.9);flex-shrink:0; }
.s-reel.spinning .s-reel-inner { animation:spinReel .09s linear infinite; }
.s-reel.win-flash { animation:reelWinFlash .35s ease-out 4; }
.s-reel::after { content:'';position:absolute;inset:0;z-index:4;pointer-events:none;background:repeating-linear-gradient(180deg,rgba(0,0,0,.18) 0px,rgba(0,0,0,.18) 1px,transparent 1px,transparent 5px); }
.s-reel-inner { position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:3; }
.s-reel-shine { position:absolute;inset:0;z-index:5;pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,.1) 0%,transparent 22%,transparent 78%,rgba(255,255,255,.05) 100%); }
.s-reel-vignette { position:absolute;inset:0;z-index:6;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.92) 0%,transparent 28%,transparent 72%,rgba(0,0,0,.92) 100%); }
.s-symbol { font-size:60px;line-height:1;display:block; }
.s-symbol.pop { animation:symbolPop .25s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
.s-spin-btn { width:100%;padding:15px 0;font-family:'Bebas Neue',cursive;font-size:26px;letter-spacing:5px;cursor:pointer;border:none;border-radius:50px;background:linear-gradient(180deg,#ff5555 0%,#dd1111 38%,#990000 55%,#cc2222 78%,#ff5555 100%);color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.6);animation:spinBtnPulse 2.5s ease-in-out infinite;position:relative;overflow:hidden;transition:all .1s;font-weight:900;box-shadow:0 5px 0 #660000,0 8px 28px rgba(255,60,0,.55),inset 0 1px 0 rgba(255,255,255,.25); }
.s-spin-btn::before { content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);transition:left .5s; }
.s-spin-btn:hover::before { left:100%; }
.s-spin-btn:active { transform:translateY(4px);box-shadow:0 1px 0 #660000,0 2px 12px rgba(255,60,0,.35),inset 0 1px 0 rgba(255,255,255,.15);animation:none; }
.s-spin-btn:disabled { background:linear-gradient(180deg,#3a3a3a,#222);color:#555;cursor:not-allowed;animation:none;box-shadow:0 3px 0 #111; }
.s-spin-btn:disabled::before { display:none; }
.s-approve-btn { width:100%;padding:15px 0;font-family:'Bebas Neue',cursive;font-size:22px;letter-spacing:4px;cursor:pointer;border:none;border-radius:50px;background:linear-gradient(180deg,#ffdd44,#cc9900 40%,#886600 60%,#cc9900 80%,#ffdd44 100%);color:#1a0000;box-shadow:0 5px 0 #664400,0 8px 28px rgba(255,180,0,.45),inset 0 1px 0 rgba(255,255,255,.4);transition:all .1s;font-weight:900; }
.s-approve-btn:active { transform:translateY(4px);box-shadow:0 1px 0 #664400; }
.s-approve-btn:disabled { background:linear-gradient(180deg,#3a3a3a,#222);color:#555;cursor:not-allowed;box-shadow:0 3px 0 #111; }
.s-bet-chip { padding:8px 14px;border-radius:50px;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;cursor:pointer;border:2px solid #550000;background:linear-gradient(180deg,#2a0000,#1a0000);color:#cbd5e1;transition:all .15s; }
.s-bet-chip:hover { border-color:#aa0000;color:#f8fafc;transform:translateY(-1px); }
.s-bet-chip.active { background:linear-gradient(180deg,#7a2200,#551100);border-color:#FFD700;color:#FFD700;box-shadow:0 0 14px rgba(255,165,0,.5),0 3px 0 #441100; }
.s-bet-chip:disabled { opacity:.45;cursor:not-allowed;transform:none; }
.s-lcd { background:linear-gradient(180deg,#000806,#001208);border:2px solid #005522;border-radius:8px;font-family:'Orbitron',monospace;box-shadow:inset 0 0 16px rgba(0,100,50,.3),0 0 8px rgba(0,200,100,.15); }
.s-bolt { position:absolute;top:0;width:3px;background:linear-gradient(180deg,#ffffff,#ccccff,rgba(150,120,255,0));opacity:0;border-radius:2px;pointer-events:none;filter:blur(1.5px);box-shadow:0 0 12px 6px rgba(140,100,255,.7),0 0 40px 14px rgba(100,60,255,.35); }
.s-bolt.active { animation:boltFlash .5s ease-out forwards; }
.s-coin { position:absolute;width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff 0%,#FFD700 40%,#aa6600 100%);border:1px solid #886600;animation:coinFly var(--dur,.8s) var(--delay,0s) ease-out forwards;pointer-events:none;z-index:100; }
.s-win-overlay { position:fixed;inset:0;pointer-events:none;z-index:999;background:radial-gradient(ellipse at 50% 40%,rgba(255,220,0,.22),transparent 65%);animation:overlayFlash .7s ease-out forwards; }
.s-win-result { animation:winBanner .4s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
.s-lose-result { animation:loseBanner .3s ease-out forwards; }
.s-pt-row { display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:12px; }
`;

function InjectStyles() {
  useEffect(() => {
    const id = "slots-styles-v3";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id; el.textContent = SLOTS_CSS;
      document.head.appendChild(el);
    }
    return () => { const el = document.getElementById(id); if (el) el.remove(); };
  }, []);
  return null;
}

/* ── Particle Stars ── */
function BgStars({ count = 110 }) {
  const stars = useRef(Array.from({ length: count }, () => ({
    l: Math.random()*100, t: Math.random()*100,
    s: Math.random()<.7?1:Math.random()<.9?2:3,
    d: 1.5+Math.random()*3, delay: Math.random()*4,
  })));
  return (
    <>
      {stars.current.map((s,i) => (
        <div key={i} className="s-bg-star" style={{ left:`${s.l}%`, top:`${s.t}%`, width:s.s, height:s.s, animation:`sStarTwinkle ${s.d}s ${s.delay}s infinite alternate` }} />
      ))}
    </>
  );
}

function Reel({ symbolIdx, spinning, win }) {
  const [displayIdx, setDisplayIdx] = useState(symbolIdx ?? 4);
  const iRef = useRef(null);
  useEffect(() => {
    if (spinning) { iRef.current = setInterval(() => setDisplayIdx(Math.floor(Math.random()*7)), 80); }
    else { clearInterval(iRef.current); if (symbolIdx != null) setDisplayIdx(symbolIdx); }
    return () => clearInterval(iRef.current);
  }, [spinning, symbolIdx]);
  const sym = SYMBOLS[displayIdx] ?? SYMBOLS[4];
  return (
    <div className={`s-reel${spinning?" spinning":""}${win&&!spinning?" win-flash":""}`}>
      <div className="s-reel-inner">
        <span className={`s-symbol${!spinning&&win?" pop":""}`}>{sym.emoji}</span>
      </div>
      <div className="s-reel-shine" /><div className="s-reel-vignette" />
    </div>
  );
}

function useLightning(ref) {
  const spawn = useCallback((count = 1) => {
    if (!ref.current) return;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const b = document.createElement("div"); b.className = "s-bolt";
        b.style.left = (8+Math.random()*84)+"%";
        ref.current.appendChild(b); void b.offsetWidth; b.classList.add("active");
        setTimeout(() => b.remove(), 600);
      }, i*140+Math.random()*80);
    }
  }, [ref]);
  useEffect(() => { const id = setInterval(() => { if (Math.random()<.12) spawn(1); }, 2200); return () => clearInterval(id); }, [spawn]);
  return spawn;
}

function useCoins(ref) {
  return useCallback((count = 14) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.width/2, cy = rect.height*0.42;
    for (let i = 0; i < count; i++) {
      const coin = document.createElement("div"); coin.className = "s-coin";
      const angle = (Math.PI*2*i)/count + Math.random()*0.5;
      const dist = 70 + Math.random()*110;
      coin.style.cssText = "left:"+(cx-8)+"px;top:"+(cy-8)+"px;--tx:"+Math.round(Math.cos(angle)*dist)+"px;--ty:"+(-90-Math.round(Math.random()*90))+"px;--dur:"+(0.55+Math.random()*0.5).toFixed(2)+"s;--delay:"+(Math.random()*0.25).toFixed(2)+"s;";
      ref.current.appendChild(coin); setTimeout(() => coin.remove(), 1200);
    }
  }, [ref]);
}

function Bulbs({ count = 28 }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", padding:"0 2px" }}>
      {Array.from({ length: count }).map((_, i) => {
        const c = BULB_COLORS[i % BULB_COLORS.length];
        return <div key={i} style={{ width:10,height:10,borderRadius:"50%",background:"radial-gradient(circle at 35% 35%,#fff,"+c+")",boxShadow:"0 0 6px 3px "+c,animation:"bulbPulse 1.1s "+((i*0.055)%1).toFixed(3)+"s infinite alternate",flexShrink:0 }} />;
      })}
    </div>
  );
}

function ResultBanner({ result, onReset }) {
  if (!result) return null;
  if (result.won) {
    const sym = SYMBOLS[result.reels[0]];
    return (
      <div className="s-win-result" style={{ textAlign:"center",padding:"14px 10px",background:"linear-gradient(135deg,rgba(0,60,0,.35),rgba(0,120,0,.2),rgba(0,60,0,.35))",border:"2px solid rgba(74,222,128,.4)",borderRadius:16,marginBottom:14,boxShadow:"0 0 30px rgba(74,222,128,.2)" }}>
        <div style={{ fontSize:28,marginBottom:4 }}>🎉🎰🎉</div>
        <div style={{ fontFamily:"'Bebas Neue',cursive",fontSize:30,letterSpacing:4,background:"linear-gradient(180deg,#fff,#FFD700,#FFA500)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:4 }}>{result.multiplier}x WIN — +{Number(result.payout).toLocaleString()} gUSDC</div>
        <div style={{ fontSize:22,marginBottom:6,letterSpacing:-2 }}>{result.reels.map(r => SYMBOLS[r]?.emoji||"?").join(" ")}</div>
        <div style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:20,background:"rgba(74,222,128,.15)",border:"1px solid rgba(74,222,128,.3)",marginBottom:12 }}>
          <span style={{ color:"#4ade80",fontSize:12,fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{sym?sym.label.toUpperCase():"WIN"} — {result.multiplier}x MULTIPLIER</span>
        </div><br/>
        <button onClick={onReset} style={{ padding:"8px 24px",borderRadius:50,border:"1px solid rgba(74,222,128,.4)",background:"rgba(74,222,128,.1)",color:"#4ade80",fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer" }}>SPIN AGAIN</button>
      </div>
    );
  }
  return (
    <div className="s-lose-result" style={{ textAlign:"center",padding:"12px 10px",background:"linear-gradient(135deg,rgba(60,0,0,.35),rgba(120,0,0,.2),rgba(60,0,0,.35))",border:"1px solid rgba(248,113,113,.3)",borderRadius:14,marginBottom:14 }}>
      <div style={{ fontSize:24,marginBottom:4 }}>😔</div>
      <div style={{ fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:700,color:"#f87171",marginBottom:6,letterSpacing:2 }}>-{result.bet} gUSDC</div>
      <div style={{ fontSize:20,marginBottom:10,letterSpacing:-2 }}>{result.reels.map(r => SYMBOLS[r]?.emoji||"?").join(" ")}</div>
      <button onClick={onReset} style={{ padding:"7px 22px",borderRadius:50,border:"1px solid rgba(248,113,113,.3)",background:"rgba(248,113,113,.08)",color:"#f87171",fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer" }}>TRY AGAIN</button>
    </div>
  );
}

export default function SlotsPage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient({ chainId: CHAIN_ID });
  const [bet, setBet] = useState(5);
  const [reels, setReels] = useState([4,4,4]);
  const [winReels, setWinReels] = useState([false,false,false]);
  const [busy, setBusy] = useState(false);
  const [approving, setApproving] = useState(false);
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
  const { data: gusdcAllow, refetch: rAllow  } = useReadContract({ address: GUSDC_ADDRESS, abi: ERC20_ABI, functionName: "allowance", args: [address, SLOTS_ADDRESS], query: { enabled: !!address }, chainId: CHAIN_ID });
  const { data: bankroll }                     = useReadContract({ address: TREASURY_ADDRESS, abi: TREASURY_ABI, functionName: "netBankroll", chainId: CHAIN_ID });
  const balance = gusdcBal ? parseFloat(formatUnits(gusdcBal, 6)).toFixed(2) : "0.00";
  const bankrollFmt = bankroll ? parseFloat(formatUnits(bankroll, 6)).toFixed(0) : "0";
  const needApprove = !gusdcAllow || gusdcAllow < betWei;
  const spawnLightning = useLightning(lightRef);
  const spawnCoins = useCoins(wrapRef);
  useEffect(() => { const id = setInterval(() => spawnLightning(1), 7500+Math.random()*4000); return () => clearInterval(id); }, [spawnLightning]);
  const processResult = useCallback((args) => {
    if (handled.current) return; handled.current = true; clearInterval(pollRef.current);
    const { reel0, reel1, reel2, multiplierX100, payoutAmount, betAmount } = args;
    const r0=Number(reel0), r1=Number(reel1), r2=Number(reel2), mult=Number(multiplierX100);
    const payout = payoutAmount ? parseFloat(formatUnits(BigInt(payoutAmount.toString()), 6)).toFixed(2) : "0";
    const betAmt = betAmount ? parseFloat(formatUnits(BigInt(betAmount.toString()), 6)).toFixed(2) : bet.toString();
    const won = mult > 0;
    setReels([r0,r1,r2]); setWinReels(won?[true,true,true]:[false,false,false]); setBusy(false);
    const res = { won, reels:[r0,r1,r2], multiplier:mult/100, payout, bet:parseFloat(betAmt) };
    setResult(res); setHistory(h => [res,...h.slice(0,11)]);
    if (won) { setWinOverlay(true); setTimeout(() => setWinOverlay(false), 800); spawnLightning(6); spawnCoins(18); }
    rBal();
  }, [bet, rBal, spawnLightning, spawnCoins]);
  useWatchContractEvent({ address: SLOTS_ADDRESS, abi: SLOTS_ABI, eventName: "SpinResult", chainId: CHAIN_ID, pollingInterval: 1_000,
    onLogs(logs) { const log = logs.find(l => l.args?.player?.toLowerCase() === address?.toLowerCase()); if (log) processResult(log.args); } });
  const startPoll = useCallback((fromBlock) => {
    clearInterval(pollRef.current); handled.current = false;
    pollRef.current = setInterval(async () => {
      if (handled.current) { clearInterval(pollRef.current); return; }
      try {
        const logs = await publicClient.getLogs({ address: SLOTS_ADDRESS,
          event: { type:"event", name:"SpinResult", inputs:[{name:"player",type:"address",indexed:true},{name:"reel0",type:"uint8",indexed:false},{name:"reel1",type:"uint8",indexed:false},{name:"reel2",type:"uint8",indexed:false},{name:"multiplierX100",type:"uint256",indexed:false},{name:"betAmount",type:"uint256",indexed:false},{name:"payoutAmount",type:"uint256",indexed:false},{name:"nonce",type:"uint256",indexed:false}] },
          args: { player: address }, fromBlock: fromBlock ?? "latest", toBlock: "latest" });
        if (logs.length > 0) processResult(logs[logs.length-1].args);
      } catch {}
    }, 1_500);
    setTimeout(() => { clearInterval(pollRef.current); if (!handled.current) setBusy(false); }, 30_000);
  }, [publicClient, address, processResult]);
  const decodeReceipt = (receipt) => {
    const log = receipt.logs.find(l => l.address?.toLowerCase()===SLOTS_ADDRESS.toLowerCase() && l.topics[0]?.toLowerCase()===SPIN_TOPIC.toLowerCase());
    if (!log || log.data.length < 322) return null;
    const d = log.data;
    return { reel0:parseInt(d.slice(2,66),16), reel1:parseInt(d.slice(66,130),16), reel2:parseInt(d.slice(130,194),16), multiplierX100:BigInt("0x"+d.slice(194,258)), betAmount:BigInt("0x"+d.slice(258,322)), payoutAmount:BigInt("0x"+(d.slice(322,386)||"0")) };
  };
  useEffect(() => { return () => clearInterval(pollRef.current); }, []);
  const handleApprove = async () => {
    setErr(null); setApproving(true);
    try { await writeContractAsync({ address: GUSDC_ADDRESS, abi: ERC20_ABI, functionName: "approve", args: [SLOTS_ADDRESS, MAX_UINT], chainId: CHAIN_ID }); setTimeout(() => rAllow(), 2000); }
    catch (e) { setErr(e.shortMessage || "Approve failed"); } setApproving(false);
  };
  const handleSpin = async () => {
    if (!isConnected || busy || isPending) return;
    if (parseFloat(balance) < bet) { setErr("Insufficient gUSDC balance ("+balance+")."); return; }
    setErr(null); setResult(null); setWinReels([false,false,false]); handled.current = false; setBusy(true); spawnLightning(2);
    try {
      const curBlock = await publicClient.getBlockNumber();
      const hash = await writeContractAsync({ address: SLOTS_ADDRESS, abi: SLOTS_ABI, functionName: "spin", args: [betWei], chainId: CHAIN_ID, gas: 300_000n });
      setTxHash(hash); startPoll(curBlock - 1n);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const decoded = decodeReceipt(receipt);
      if (decoded) processResult(decoded);
    } catch (e) { setErr(e.shortMessage || e.message || "Spin failed"); setBusy(false); }
  };
  const reset = () => { setResult(null); setErr(null); setBusy(false); setReels([4,4,4]); setWinReels([false,false,false]); };

  return (
    <div>
      <InjectStyles />
      {winOverlay && <div className="s-win-overlay" />}
      <div ref={lightRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:50 }} />

      <div className="s-bg-wrap" ref={wrapRef}>
        {/* Particle stars */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
          <BgStars count={110} />
        </div>
        {/* Spotlights */}
        <div style={{ position:"absolute", top:0, left:"15%", pointerEvents:"none", opacity:.4, zIndex:1, width:120, height:300, background:"linear-gradient(180deg,rgba(255,120,0,.1),transparent)", transformOrigin:"top center", animation:"spotSway 4s ease-in-out infinite" }} />
        <div style={{ position:"absolute", top:0, right:"15%", pointerEvents:"none", opacity:.35, zIndex:1, width:120, height:300, background:"linear-gradient(180deg,rgba(255,80,0,.08),transparent)", transformOrigin:"top center", animation:"spotSway 4s 1.5s ease-in-out infinite reverse" }} />

        <div style={{ position:"relative", zIndex:10, padding:"24px 16px 40px" }}>
          <div style={{ maxWidth:1060, margin:"0 auto" }}>
            {/* Header — left aligned */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:26 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:28 }}>🎰</span>
                <div>
                  <h1 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:32, letterSpacing:5, background:"linear-gradient(180deg,#fff,#FFD700,#FF8C00)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", margin:0, lineHeight:1 }}>- RIALO ROYAL CASINO -</h1>
                  <p style={{ color:"#94a3b8", fontSize:10, margin:"2px 0 0", letterSpacing:2, fontFamily:"'Rajdhani',sans-serif" }}>Block Entropy Mix · 3 Reel · 7 Symbols · 2% House Edge</p>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ color:"#94a3b8", fontSize:9, margin:"0 0 2px", letterSpacing:2, fontFamily:"'Rajdhani',sans-serif" }}>NET BANKROLL</p>
                <p style={{ fontFamily:"'Orbitron',monospace", color:"#4ade80", fontSize:22, fontWeight:900, margin:0, animation:"jackpotNum 2s infinite alternate" }}>{Number(bankrollFmt).toLocaleString()} USDC</p>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:18, alignItems:"start" }}>
              {/* Machine */}
              <div className="s-machine">
                <div className="s-chrome-bar" style={{ left:-9 }} />
                <div className="s-chrome-bar" style={{ right:-9, background:"linear-gradient(90deg,#666,#ddd,#999,#eee,#555)" }} />
                <div style={{ background:"linear-gradient(180deg,#1a0000,#300000,#1a0000)", borderBottom:"2px solid rgba(255,180,0,.3)", borderRadius:"20px 20px 0 0", padding:"12px 24px 8px", textAlign:"center" }}>
                  <div style={{ overflow:"hidden", marginBottom:8, height:18 }}>
                    <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:11, color:"#ffb300", letterSpacing:4, whiteSpace:"nowrap", animation:"marqueeScroll 14s linear infinite" }}>
                      GOOD LUCK! &nbsp;&nbsp;&nbsp; DIAMOND PAYS 50x &nbsp;&nbsp;&nbsp; PLAY RESPONSIBLY &nbsp;&nbsp;&nbsp; INSTANT PAYOUT &nbsp;&nbsp;&nbsp;
                    </div>
                  </div>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:46, letterSpacing:8, background:"linear-gradient(180deg,#fff 0%,#FFD700 35%,#FFA500 65%,#cc6600 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", filter:"drop-shadow(0 0 14px rgba(255,160,0,.7))", lineHeight:1 }}>LUCKY SLOT</div>
                  <Bulbs count={28} />
                </div>
                <div style={{ padding:"20px 24px 26px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                    <div className="s-lcd" style={{ padding:"6px 14px" }}>
                      <span style={{ display:"block", fontSize:9, color:"#4ade80", letterSpacing:2, fontFamily:"'Rajdhani',sans-serif" }}>gUSDC BALANCE</span>
                      <span style={{ fontSize:16, color:"#4ade80", letterSpacing:2, fontFamily:"'Orbitron',monospace", fontWeight:700 }}>{balance}</span>
                    </div>
                    <a href="/faucet" style={{ fontSize:11, color:"#fb923c", padding:"7px 14px", background:"rgba(251,146,60,.06)", border:"1px solid rgba(251,146,60,.25)", borderRadius:50, textDecoration:"none", fontFamily:"'Rajdhani',sans-serif", fontWeight:700, letterSpacing:1 }}>+ SWAP</a>
                  </div>
                  {/* Reel window */}
                  <div className="s-reel-window" style={{ padding:14, marginBottom:14 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", position:"relative" }}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, minWidth:50, flexShrink:0 }}>
                        <div style={{ width:14, height:80, borderRadius:7, background:"linear-gradient(180deg,#888,#ccc,#888,#555)", boxShadow:"2px 2px 6px rgba(0,0,0,.5)", position:"relative" }}>
                          <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", width:24, height:24, borderRadius:"50%", background:"radial-gradient(circle at 35% 35%,#ff6644,#cc2200)", border:"2px solid #884400", boxShadow:"0 0 8px rgba(255,100,0,.6)" }} />
                        </div>
                        {["#4ade80","#fbbf24","#f87171"].map((c,i) => <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:c, boxShadow:"0 0 6px 2px "+c, animation:"bulbPulse 1.2s "+(i*0.3)+"s infinite alternate" }} />)}
                      </div>
                      {reels.map((r,i) => <Reel key={i} symbolIdx={r} spinning={busy} win={winReels[i]} />)}
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, minWidth:50, flexShrink:0 }}>
                        <div style={{ width:14, height:80, borderRadius:7, background:"linear-gradient(180deg,#888,#ccc,#888,#555)", boxShadow:"2px 2px 6px rgba(0,0,0,.5)", position:"relative" }}>
                          <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", width:24, height:24, borderRadius:"50%", background:"radial-gradient(circle at 35% 35%,#ff6644,#cc2200)", border:"2px solid #884400", boxShadow:"0 0 8px rgba(255,100,0,.6)" }} />
                        </div>
                        {["#00f5ff","#fbbf24","#a78bfa"].map((c,i) => <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:c, boxShadow:"0 0 6px 2px "+c, animation:"bulbPulse 1.2s "+(i*0.4+0.2)+"s infinite alternate" }} />)}
                      </div>
                    </div>
                  </div>
                  {busy && <div style={{ textAlign:"center", marginBottom:12 }}><span style={{ fontFamily:"'Orbitron',monospace", fontSize:12, fontWeight:700, color:"#fb923c", letterSpacing:3, animation:"jackpotNum .6s infinite alternate" }}>SPINNING...</span></div>}
                  {result && !busy && <ResultBanner result={result} onReset={reset} />}
                  {err && <div style={{ background:"rgba(248,113,113,.08)", border:"1px solid rgba(248,113,113,.25)", borderRadius:10, padding:"9px 14px", marginBottom:12, color:"#f87171", fontSize:12, fontFamily:"'Rajdhani',sans-serif", fontWeight:600 }}>{err}</div>}
                  {isConnected && needApprove && !busy && <div style={{ background:"rgba(251,191,36,.06)", border:"1px solid rgba(251,191,36,.25)", borderRadius:10, padding:"9px 14px", marginBottom:12, color:"#fbbf24", fontSize:11, fontFamily:"'Rajdhani',sans-serif", fontWeight:600 }}>Approve gUSDC to Slots contract before your first spin.</div>}
                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontSize:9, color:"#cbd5e1", textTransform:"uppercase", letterSpacing:3, marginBottom:8, fontFamily:"'Rajdhani',sans-serif", fontWeight:600 }}>BET AMOUNT (gUSDC)</div>
                    <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                      {BETS.map(v => <button key={v} className={"s-bet-chip"+(bet===v?" active":"")} onClick={() => setBet(v)} disabled={busy}>{v}</button>)}
                    </div>
                  </div>
                  {isConnected ? (
                    <div>
                      {needApprove
                        ? <button className="s-approve-btn" onClick={handleApprove} disabled={approving}>{approving?"APPROVING...":"APPROVE gUSDC"}</button>
                        : <button className="s-spin-btn" onClick={handleSpin} disabled={busy}>{busy?"PROCESSING...":"SPIN  "+bet+" gUSDC"}</button>}
                      {txHash && <a href={"https://sepolia.basescan.org/tx/"+txHash} target="_blank" rel="noopener noreferrer" style={{ display:"block", textAlign:"center", fontSize:10, color:"#94a3b8", textDecoration:"none", marginTop:6, fontFamily:"'Rajdhani',sans-serif" }}>View on Basescan</a>}
                    </div>
                  ) : <div style={{ display:"flex", justifyContent:"center", paddingTop:4 }}><ConnectButton label="Connect Wallet" /></div>}
                </div>
                <div style={{ height:16, margin:"0 16px", background:"linear-gradient(180deg,#2a2a2a,#444,#333,#555,#222)", borderRadius:"0 0 20px 20px", borderTop:"2px solid #666", boxShadow:"0 8px 24px rgba(0,0,0,.7)" }} />
              </div>

              {/* Right panels */}
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ background:"#080d1a", border:"1px solid rgba(255,180,0,.1)", borderRadius:16, padding:"14px 16px" }}>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:14, color:"#FFD700", letterSpacing:4, marginBottom:10 }}>PAYTABLE</div>
                  {SYMBOLS.map(s => (
                    <div key={s.id} className="s-pt-row">
                      <span style={{ fontSize:15, letterSpacing:-3 }}>{s.emoji}{s.emoji}{s.emoji}</span>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:15, color:s.color, letterSpacing:1 }}>{s.mult}</div>
                        <div style={{ fontSize:9, color:"#94a3b8", letterSpacing:1 }}>{s.rarity}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ display:"flex", justifyContent:"space-between", paddingTop:6, fontSize:11, color:"#cbd5e1", fontFamily:"'Rajdhani',sans-serif" }}>
                    <span>2 matching symbols</span><span style={{ fontWeight:700 }}>0.5x</span>
                  </div>
                </div>
                <div style={{ background:"#080d1a", border:"1px solid rgba(255,255,255,.05)", borderRadius:16, padding:"14px 16px" }}>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:14, color:"#fb923c", letterSpacing:4, marginBottom:10 }}>GAME INFO</div>
                  {[["Min Bet","1 gUSDC"],["Max Bet","50 gUSDC"],["House Edge","2%"],["Transactions","1 (instant)"],["RNG","Block Entropy"]].map(([l,v]) => (
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid rgba(255,255,255,.04)", fontSize:11, fontFamily:"'Rajdhani',sans-serif" }}>
                      <span style={{ color:"#cbd5e1" }}>{l}</span><span style={{ color:"#ffffff", fontWeight:700 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:"#080d1a", border:"1px solid rgba(255,255,255,.05)", borderRadius:16, padding:"14px 16px" }}>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:14, color:"#fb923c", letterSpacing:4, marginBottom:10 }}>SPIN HISTORY</div>
                  {history.length===0 ? <p style={{ color:"#94a3b8", fontSize:11, textAlign:"center", padding:"10px 0", fontFamily:"'Rajdhani',sans-serif" }}>No spins yet</p>
                  : history.map((h,i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 10px", borderRadius:10, marginBottom:4, background:h.won?"rgba(74,222,128,.06)":"rgba(248,113,113,.05)", border:"1px solid "+(h.won?"rgba(74,222,128,.12)":"rgba(248,113,113,.1)") }}>
                      <span style={{ fontSize:14, letterSpacing:-2 }}>{h.reels.map(r => SYMBOLS[r]?.emoji||"?").join("")}</span>
                      <span style={{ fontWeight:700, fontSize:11, fontFamily:"'Orbitron',monospace", color:h.won?"#4ade80":"#f87171" }}>{h.won?"+"+Number(h.payout).toFixed(2):"-"+h.bet}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
