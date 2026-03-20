"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent, usePublicClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatUnits, parseUnits } from "viem";
import { CHAIN_ID } from "@/lib/wagmi";
import { GUSDC_ADDRESS, TREASURY_ADDRESS, DICE_ADDRESS, ERC20_ABI, DICE_ABI, TREASURY_ABI, MAX_UINT } from "@/lib/contracts";

const BETS  = [1, 2, 5, 10, 25, 50];
const FACES = ["⚀","⚁","⚂","⚃","⚄","⚅"];

const DICE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Orbitron:wght@700;900&family=Rajdhani:wght@600;700&display=swap');
@keyframes dTwinkle    { from{opacity:.05} to{opacity:.9} }
@keyframes dBolt       { 0%{height:0;opacity:0} 15%{height:220px;opacity:1} 45%{height:400px;opacity:.6} 100%{height:420px;opacity:0} }
@keyframes dCoinFly    { 0%{transform:translate(0,0) rotate(0deg);opacity:1} 100%{transform:translate(var(--tx),var(--ty)) rotate(540deg) scale(.2);opacity:0} }
@keyframes dOverlay    { 0%{opacity:0} 25%{opacity:1} 100%{opacity:0} }
@keyframes dSpotSway   { 0%,100%{transform:rotate(-10deg)} 50%{transform:rotate(10deg)} }
@keyframes dDiceRoll   { 0%{transform:rotateX(0deg) rotateY(0deg) rotateZ(0deg)} 25%{transform:rotateX(180deg) rotateY(90deg) rotateZ(45deg)} 50%{transform:rotateX(90deg) rotateY(270deg) rotateZ(180deg)} 75%{transform:rotateX(270deg) rotateY(180deg) rotateZ(90deg)} 100%{transform:rotateX(360deg) rotateY(360deg) rotateZ(360deg)} }
@keyframes dBulb       { from{opacity:.3;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
@keyframes dWinPop     { 0%{transform:scale(.4) translateY(28px);opacity:0} 65%{transform:scale(1.07) translateY(-3px);opacity:1} 100%{transform:scale(1) translateY(0);opacity:1} }
@keyframes dLosePop    { 0%{transform:translateY(-18px);opacity:0} 100%{transform:translateY(0);opacity:1} }
@keyframes dGlow       { from{filter:drop-shadow(0 0 4px #0ff)} to{filter:drop-shadow(0 0 18px #0bf)} }
@keyframes dBtnPulse   { 0%,100%{box-shadow:0 5px 0 #003344,0 8px 28px rgba(0,200,255,.45),inset 0 1px 0 rgba(255,255,255,.2)} 50%{box-shadow:0 5px 0 #003344,0 8px 40px rgba(0,245,255,.8),inset 0 1px 0 rgba(255,255,255,.2)} }
@keyframes dShimmer    { 0%{left:-100%} 100%{left:200%} }
@keyframes dNumberPop  { 0%{transform:scale(1.4)} 100%{transform:scale(1)} }
@keyframes dPipBounce  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.4)} }
@keyframes dStarTwinkle{ from{opacity:.04} to{opacity:.88} }
@keyframes marqueeScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

/* ── BACKGROUND WRAP ── */
.d-bg-wrap {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse 110% 55% at 50% 0%, rgba(0,100,200,.16) 0%, transparent 55%),
    radial-gradient(ellipse 70% 40% at 5% 80%,  rgba(0,150,255,.07) 0%, transparent 50%),
    radial-gradient(ellipse 60% 35% at 95% 85%, rgba(0,100,200,.06) 0%, transparent 50%),
    #020610;
}
.d-bg-star { position:absolute; border-radius:50%; background:#fff; pointer-events:none; }

.d-machine {
  background: linear-gradient(160deg,#000d1a 0%,#001a2e 25%,#000f1f 55%,#001428 80%,#000a15 100%);
  border-radius: 24px 24px 32px 32px;
  border: 3px solid;
  border-color: #0099aa #006677 #0088aa #00bbcc;
  box-shadow: 0 0 0 1px #003344, 0 0 60px rgba(0,180,255,.2), 0 32px 80px rgba(0,0,0,.9), inset 0 0 60px rgba(0,100,255,.04);
  position: relative;
}
.d-machine::before {
  content:'';position:absolute;inset:6px;border-radius:20px 20px 28px 28px;
  border:1px solid rgba(0,245,255,.08);pointer-events:none;
}
.d-chrome-bar {
  position:absolute;top:80px;width:14px;height:calc(100% - 140px);
  background:linear-gradient(90deg,#334,#88a,#556,#99b,#445);
  border-radius:6px;box-shadow:0 0 10px rgba(0,0,0,.6);
}
.d-3d-cube { width:130px;height:130px;perspective:400px;perspective-origin:50% 50%; }
.d-cube-inner { width:100%;height:100%;transform-style:preserve-3d;position:relative; }
.d-cube-inner.rolling { animation:dDiceRoll .18s linear infinite; }
.d-cube-face {
  position:absolute;inset:0;border-radius:18px;
  display:flex;align-items:center;justify-content:center;
  font-size:70px;backface-visibility:hidden;
  background:linear-gradient(145deg, #ffffff, #e2e8f0);
  border:2px solid #cbd5e1;
  box-shadow:inset 0 0 15px rgba(0,0,0,0.1);
}
.d-face-front  { transform:translateZ(65px); }
.d-face-back   { transform:translateZ(-65px) rotateY(180deg); }
.d-face-left   { transform:translateX(-65px) rotateY(-90deg); }
.d-face-right  { transform:translateX(65px)  rotateY(90deg); }
.d-face-top    { transform:translateY(-65px) rotateX(90deg); }
.d-face-bottom { transform:translateY(65px)  rotateX(-90deg); }
.d-cube-shadow { width:120px;height:20px;margin:6px auto 0;background:radial-gradient(ellipse,rgba(0,200,255,.25),transparent 70%);border-radius:50%; }

.d-spin-btn {
  width:100%;padding:15px 0;
  font-family:'Bebas Neue',cursive;font-size:26px;letter-spacing:5px;
  cursor:pointer;border:none;border-radius:50px;
  background:linear-gradient(180deg,#22ddff 0%,#00aacc 38%,#006688 55%,#009bbb 78%,#22ddff 100%);
  color:#000d1a;
  box-shadow:0 5px 0 #003344,0 8px 28px rgba(0,200,255,.45),inset 0 1px 0 rgba(255,255,255,.3);
  transition:all .1s;text-shadow:0 1px 3px rgba(0,0,0,.3);
  animation:dBtnPulse 2.5s ease-in-out infinite;
  position:relative;overflow:hidden;font-weight:900;
}
.d-spin-btn::after { content:'';position:absolute;top:0;width:40%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);animation:dShimmer 2.5s 1s infinite; }
.d-spin-btn:active{transform:translateY(4px);box-shadow:0 1px 0 #003344,0 2px 12px rgba(0,200,255,.3),inset 0 1px 0 rgba(255,255,255,.2);animation:none}
.d-spin-btn:disabled{background:linear-gradient(180deg,#333,#222);color:#888;cursor:not-allowed;animation:none;box-shadow:0 3px 0 #111}
.d-spin-btn:disabled::after{display:none}

.d-approve-btn {
  width:100%;padding:15px 0;
  font-family:'Bebas Neue',cursive;font-size:22px;letter-spacing:4px;
  cursor:pointer;border:none;border-radius:50px;
  background:linear-gradient(180deg,#ffdd44,#cc9900 40%,#886600 60%,#cc9900 80%,#ffdd44 100%);
  color:#0a0a00;box-shadow:0 5px 0 #664400,0 8px 28px rgba(255,180,0,.4),inset 0 1px 0 rgba(255,255,255,.4);
  transition:all .1s;font-weight:900;
}
.d-approve-btn:active{transform:translateY(4px);box-shadow:0 1px 0 #664400}
.d-approve-btn:disabled{background:linear-gradient(180deg,#333,#222);color:#888;cursor:not-allowed;box-shadow:0 3px 0 #111}

.d-bet-chip {
  padding:8px 14px;border-radius:50px;
  font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;
  cursor:pointer;border:2px solid #003344;
  background:linear-gradient(180deg,#001a28,#000d18);
  color:#cbd5e1;transition:all .15s;
}
.d-bet-chip:hover{border-color:#006688;color:#00f5ff;transform:translateY(-1px)}
.d-bet-chip.active{background:linear-gradient(180deg,#003a4a,#002233);border-color:#00f5ff;color:#00f5ff;box-shadow:0 0 14px rgba(0,245,255,.4),0 3px 0 #002233;}
.d-bet-chip:disabled{opacity:.4;cursor:not-allowed;transform:none}

.d-choice-btn {
  flex:1;padding:14px 8px;border-radius:16px;
  font-family:'Bebas Neue',cursive;font-size:20px;letter-spacing:3px;
  cursor:pointer;border:2px solid;transition:all .15s;
}
.d-lcd {
  background:linear-gradient(180deg,#000806,#001208);
  border:2px solid #003322;border-radius:8px;
  font-family:'Orbitron',monospace;
  box-shadow:inset 0 0 16px rgba(0,80,50,.3),0 0 8px rgba(0,180,80,.12);
}
.d-win-overlay { position:fixed;inset:0;pointer-events:none;z-index:999;background:radial-gradient(ellipse at 50% 40%,rgba(0,245,255,.18),transparent 65%);animation:dOverlay .8s ease-out forwards; }
.d-bolt { position:absolute;top:0;width:3px;background:linear-gradient(180deg,#fff,#aaf,rgba(100,200,255,0));opacity:0;border-radius:2px;pointer-events:none;filter:blur(1.5px);box-shadow:0 0 12px 6px rgba(0,180,255,.7),0 0 40px 14px rgba(0,100,255,.35); }
.d-bolt.active { animation:dBolt .5s ease-out forwards; }
.d-coin { position:absolute;width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff,#00f5ff,#0066aa);border:1px solid #0088aa;animation:dCoinFly var(--dur,.8s) var(--delay,0s) ease-out forwards;pointer-events:none;z-index:100; }
.d-pip { width:12px;height:12px;border-radius:50%;background: #111; box-shadow: inset 0 0 4px rgba(255,255,255,0.2); }
.d-result-win { animation:dWinPop .4s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
.d-result-lose { animation:dLosePop .3s ease-out forwards; }
`;

function InjectDiceStyles() {
  useEffect(() => {
    const id = "dice-pro-styles";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id; el.textContent = DICE_CSS;
      document.head.appendChild(el);
    }
    return () => { const el = document.getElementById(id); if (el) el.remove(); };
  }, []);
  return null;
}

function DiceStars({ count = 100 }) {
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
        <div key={i} className="d-bg-star" style={{ left:`${s.left}%`, top:`${s.top}%`, width:s.size, height:s.size, animation:`dStarTwinkle ${s.dur}s ${s.delay}s infinite alternate` }} />
      ))}
    </>
  );
}

const FACE_PIPS = [
  [[50,50]],
  [[25,25],[75,75]],
  [[25,25],[50,50],[75,75]],
  [[25,25],[75,25],[25,75],[75,75]],
  [[25,25],[75,25],[50,50],[25,75],[75,75]],
  [[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]],
];

function DiceFace({ value, size = 90, style }) {
  const pips = FACE_PIPS[(value || 1) - 1];
  const pipSize = size * 0.13;
  return (
    <div style={{ width:size, height:size, borderRadius:size*0.18, background:"linear-gradient(145deg,#ffffff,#e2e8f0)", border:"1px solid #cbd5e1", position:"relative", boxShadow:"0 4px 6px rgba(0,0,0,0.1), inset 0 0 10px rgba(0,0,0,0.05)", ...style }}>
      {pips.map((p, i) => (
        <div key={i} className="d-pip" style={{ position:"absolute", width:pipSize, height:pipSize, left:`${p[0]-(pipSize/size*50)}%`, top:`${p[1]-(pipSize/size*50)}%` }} />
      ))}
    </div>
  );
}

function Dice3D({ value, rolling, won }) {
  const faces = [value, ((value)%6)+1, ((value+1)%6)+1, ((value+2)%6)+1, ((value+3)%6)+1, ((value+4)%6)+1];
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div className="d-3d-cube">
        <div className={`d-cube-inner${rolling ? " rolling" : ""}`}>
          {["front","back","left","right","top","bottom"].map((f, i) => (
            <div key={f} className={`d-cube-face d-face-${f}`}>
              {FACE_PIPS[(faces[i]||1)-1].map((p, j) => (
                <div key={j} className="d-pip" style={{ position:"absolute", left:`${p[0]-6}%`, top:`${p[1]-6}%` }} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="d-cube-shadow" style={{ opacity: rolling ? .5 : .9 }} />
    </div>
  );
}

function useDiceLightning(ref) {
  const spawn = useCallback((count = 1) => {
    if (!ref.current) return;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const b = document.createElement("div");
        b.className = "d-bolt";
        b.style.cssText = `left:${8+Math.random()*84}%;`;
        ref.current.appendChild(b);
        void b.offsetWidth; b.classList.add("active");
        setTimeout(() => b.remove(), 600);
      }, i * 130 + Math.random() * 90);
    }
  }, [ref]);
  useEffect(() => {
    const id = setInterval(() => { if (Math.random() < .1) spawn(1); }, 2400);
    return () => clearInterval(id);
  }, [spawn]);
  return spawn;
}

function useDiceCoins(ref) {
  return useCallback((count = 12) => {
    if (!ref.current) return;
    const { width, height } = ref.current.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
      const c = document.createElement("div");
      c.className = "d-coin";
      const a = (Math.PI * 2 * i) / count + Math.random() * .5;
      const d = 60 + Math.random() * 100;
      c.style.cssText = `left:${width/2-8}px;top:${height*.38}px;--tx:${Math.cos(a)*d}px;--ty:${-80-Math.random()*90}px;--dur:${.5+Math.random()*.5}s;--delay:${Math.random()*.25}s;`;
      ref.current.appendChild(c);
      setTimeout(() => c.remove(), 1100);
    }
  }, [ref]);
}

const BULB_C = ["#00f5ff","#0088ff","#00ddcc","#22aaff","#00ccff","#44ddff"];
function DiceBulbs({ count = 26 }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", padding:"0 2px" }}>
      {Array.from({ length: count }).map((_, i) => {
        const c = BULB_C[i % BULB_C.length];
        return <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:`radial-gradient(circle at 35% 35%,#fff,${c})`, boxShadow:`0 0 6px 3px ${c}`, animation:`dBulb 1.1s ${(i*.055)%1}s infinite alternate`, flexShrink:0 }} />;
      })}
    </div>
  );
}

function DiceResultBanner({ result, onReset }) {
  if (!result) return null;
  if (result.won) return (
    <div className="d-result-win" style={{ textAlign:"center", padding:"14px 10px", background:"linear-gradient(135deg,rgba(0,40,60,.4),rgba(0,80,100,.2),rgba(0,40,60,.4))", border:"2px solid rgba(0,245,255,.4)", borderRadius:16, marginBottom:14, boxShadow:"0 0 30px rgba(0,200,255,.15),inset 0 0 30px rgba(0,200,255,.04)" }}>
      <div style={{ fontSize:28, marginBottom:4 }}>🎉🎲🎉</div>
      <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:30, letterSpacing:4, background:"linear-gradient(180deg,#fff,#00f5ff,#0088ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", filter:"drop-shadow(0 0 12px rgba(0,200,255,.8))", marginBottom:4 }}>
        WIN — +{Number(result.payout).toLocaleString()} gUSDC
      </div>
      <div style={{ display:"flex", justifyContent:"center", marginBottom:10 }}>
          <DiceFace value={result.diceValue} size={60} />
      </div>
      <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 14px", borderRadius:20, background:"rgba(0,245,255,.12)", border:"1px solid rgba(0,245,255,.3)", marginBottom:12 }}>
        <span style={{ color:"#00f5ff", fontSize:12, fontFamily:"'Rajdhani',sans-serif", fontWeight:700 }}>
          ROLLED {result.diceValue} · {result.diceValue>=4?"HIGH":"LOW"} · YOUR PICK: {result.isHigh?"HIGH":"LOW"}
        </span>
      </div>
      <br />
      <button onClick={onReset} style={{ padding:"8px 24px", borderRadius:50, border:"1px solid rgba(0,245,255,.4)", background:"rgba(0,245,255,.1)", color:"#00f5ff", fontFamily:"'Rajdhani',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer" }}>↩ ROLL AGAIN</button>
    </div>
  );
  return (
    <div className="d-result-lose" style={{ textAlign:"center", padding:"12px 10px", background:"linear-gradient(135deg,rgba(40,0,0,.4),rgba(80,0,0,.2),rgba(40,0,0,.4))", border:"1px solid rgba(248,113,113,.3)", borderRadius:14, marginBottom:14 }}>
      <div style={{ fontSize:24, marginBottom:4 }}>😔</div>
      <div style={{ fontFamily:"'Orbitron',monospace", fontSize:16, fontWeight:700, color:"#f87171", marginBottom:4, letterSpacing:2 }}>-{result.bet} gUSDC</div>
      <div style={{ display:"flex", justifyContent:"center", marginBottom:10 }}>
          <DiceFace value={result.diceValue} size={50} />
      </div>
      <div style={{ color:"#94a3b8", fontSize:11, fontFamily:"'Rajdhani',sans-serif", marginBottom:10 }}>
        ROLLED {result.diceValue} ({result.diceValue>=4?"HIGH":"LOW"}) · YOUR PICK: {result.isHigh?"HIGH":"LOW"}
      </div>
      <button onClick={onReset} style={{ padding:"7px 22px", borderRadius:50, border:"1px solid rgba(248,113,113,.3)", background:"rgba(248,113,113,.08)", color:"#f87171", fontFamily:"'Rajdhani',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer" }}>TRY AGAIN</button>
    </div>
  );
}

export default function DicePage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient({ chainId: CHAIN_ID });

  const [bet, setBet]       = useState(5);
  const [isHigh, setIsHigh] = useState(true);
  const [busy, setBusy]     = useState(false);
  const [approving, setApproving] = useState(false);
  const [diceVal, setDiceVal]     = useState(1);
  const [won, setWon]             = useState(null);
  const [result, setResult]   = useState(null);
  const [history, setHistory] = useState([]);
  const [err, setErr]         = useState(null);
  const [txHash, setTxHash]   = useState(null);
  const [winOverlay, setWinOverlay] = useState(false);

  const handled  = useRef(false);
  const pollRef  = useRef(null);
  const wrapRef  = useRef(null);
  const lightRef = useRef(null);
  const betWei   = parseUnits(bet.toString(), 6);

  const { data: gusdcBal,   refetch: rBal  } = useReadContract({ address: GUSDC_ADDRESS,    abi: ERC20_ABI,    functionName: "balanceOf", args: [address], query: { enabled: !!address }, chainId: CHAIN_ID });
  const { data: gusdcAllow, refetch: rAllow } = useReadContract({ address: GUSDC_ADDRESS,    abi: ERC20_ABI,    functionName: "allowance", args: [address, DICE_ADDRESS], query: { enabled: !!address }, chainId: CHAIN_ID });
  const { data: bankroll }                    = useReadContract({ address: TREASURY_ADDRESS, abi: TREASURY_ABI, functionName: "netBankroll", chainId: CHAIN_ID });

  const balance     = gusdcBal ? parseFloat(formatUnits(gusdcBal, 6)).toFixed(2) : "0.00";
  const bankrollFmt = bankroll  ? parseFloat(formatUnits(bankroll, 6)).toFixed(0) : "0";
  const needApprove = !gusdcAllow || gusdcAllow < betWei;

  const spawnLightning = useDiceLightning(lightRef);
  const spawnCoins     = useDiceCoins(wrapRef);

  useEffect(() => {
    const id = setInterval(() => spawnLightning(1), 8000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, [spawnLightning]);

  const processResult = useCallback((args) => {
    if (handled.current) return;
    handled.current = true;
    clearInterval(pollRef.current);
    const { diceValue, isHigh: wasHigh, won: didWin, payoutAmount, betAmount } = args;
    const payout = payoutAmount ? parseFloat(formatUnits(payoutAmount, 6)).toFixed(2) : "0";
    const betAmt  = betAmount   ? parseFloat(formatUnits(betAmount, 6)).toFixed(2) : bet.toString();
    setDiceVal(Number(diceValue));
    setWon(didWin);
    setBusy(false);
    const res = { won: didWin, diceValue: Number(diceValue), isHigh: wasHigh, payout, bet: parseFloat(betAmt) };
    setResult(res);
    setHistory(h => [res, ...h.slice(0, 11)]);
    if (didWin) {
      setWinOverlay(true);
      setTimeout(() => setWinOverlay(false), 900);
      spawnLightning(5);
      spawnCoins(16);
    }
    rBal();
  }, [bet, rBal, spawnLightning, spawnCoins]);

  useWatchContractEvent({
    address: DICE_ADDRESS, abi: DICE_ABI, eventName: "DiceResult",
    chainId: CHAIN_ID, pollingInterval: 1_000,
    onLogs(logs) {
      const log = logs.find(l => l.args?.player?.toLowerCase() === address?.toLowerCase());
      if (log) processResult(log.args);
    },
  });

  const startPoll = useCallback((fromBlock) => {
    clearInterval(pollRef.current); handled.current = false;
    pollRef.current = setInterval(async () => {
      if (handled.current) { clearInterval(pollRef.current); return; }
      try {
        const logs = await publicClient.getLogs({
          address: DICE_ADDRESS,
          event: { type:"event", name:"DiceResult", inputs:[
            {name:"player",type:"address",indexed:true},{name:"diceValue",type:"uint8",indexed:false},
            {name:"isHigh",type:"bool",indexed:false},{name:"won",type:"bool",indexed:false},
            {name:"betAmount",type:"uint256",indexed:false},{name:"payoutAmount",type:"uint256",indexed:false},
            {name:"nonce",type:"uint256",indexed:false}
          ]},
          args: { player: address }, fromBlock: fromBlock ?? "latest", toBlock: "latest",
        });
        if (logs.length > 0) processResult(logs[logs.length - 1].args);
      } catch {}
    }, 1_500);
    setTimeout(() => { clearInterval(pollRef.current); if (!handled.current) setBusy(false); }, 30_000);
  }, [publicClient, address, processResult]);

  const handleApprove = async () => {
    setErr(null); setApproving(true);
    try {
      await writeContractAsync({ address: GUSDC_ADDRESS, abi: ERC20_ABI, functionName: "approve", args: [DICE_ADDRESS, MAX_UINT], chainId: CHAIN_ID });
      setTimeout(() => rAllow(), 2000);
    } catch (e) { setErr(e.shortMessage || "Approve failed"); }
    setApproving(false);
  };

  const handleRoll = async () => {
    if (!isConnected || busy || isPending) return;
    if (parseFloat(balance) < bet) { setErr(`Insufficient gUSDC balance (${balance}).`); return; }
    setErr(null); setResult(null); setWon(null); handled.current = false; setBusy(true);
    spawnLightning(2);
    try {
      const curBlock = await publicClient.getBlockNumber();
      const hash = await writeContractAsync({ address: DICE_ADDRESS, abi: DICE_ABI, functionName: "roll", args: [betWei, isHigh], chainId: CHAIN_ID });
      setTxHash(hash);
      startPoll(curBlock - 1n);
    } catch (e) {
      setErr(e.shortMessage || e.message || "Transaction failed");
      setBusy(false);
    }
  };

  const reset = () => { setResult(null); setWon(null); setErr(null); setBusy(false); };

  return (
    <>
      <InjectDiceStyles />
      {winOverlay && <div className="d-win-overlay" />}
      <div ref={lightRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:50 }} />

      <div className="d-bg-wrap" ref={wrapRef}>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
          <DiceStars count={110} />
        </div>

        <div style={{ position:"absolute", top:0, left:"12%", pointerEvents:"none", opacity:.4, zIndex:1 }}>
          <div style={{ width:110, height:280, background:"linear-gradient(180deg,rgba(0,200,255,.1),transparent)", transformOrigin:"top center", animation:"dSpotSway 4.5s ease-in-out infinite" }} />
        </div>
        <div style={{ position:"absolute", top:0, right:"12%", pointerEvents:"none", opacity:.3, zIndex:1 }}>
          <div style={{ width:110, height:280, background:"linear-gradient(180deg,rgba(0,150,255,.08),transparent)", transformOrigin:"top center", animation:"dSpotSway 4.5s 1.8s ease-in-out infinite reverse" }} />
        </div>

        <div style={{ position:"relative", zIndex:10, padding:"24px 16px 40px" }}>
          <div style={{ maxWidth:1060, margin:"0 auto" }}>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:26 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:28 }}>🎲</span>
                <div>
                  <h1 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:32, letterSpacing:5, background:"linear-gradient(180deg,#fff,#00f5ff,#0088ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", margin:0, lineHeight:1 }}>
                   - RIALO Royal Casino -
                  </h1>
                  <p style={{ color:"#94a3b8", fontSize:10, margin:0, letterSpacing:2, fontFamily:"'Rajdhani',sans-serif", marginTop:2 }}>
                    Block Entropy Mix · Hi/Lo d6 · 1.96× · 2% House Edge
                  </p>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ color:"#94a3b8", fontSize:9, margin:"0 0 2px", letterSpacing:2, fontFamily:"'Rajdhani',sans-serif" }}>NET BANKROLL</p>
                <p style={{ fontFamily:"'Orbitron',monospace", color:"#4ade80", fontSize:22, fontWeight:900, margin:0, animation:"dGlow 2s infinite alternate" }}>{Number(bankrollFmt).toLocaleString()} USDC</p>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:18, alignItems:"start" }}>
              <div className="d-machine" style={{ position:"relative" }}>
                <div className="d-chrome-bar" style={{ left:-9 }} />
                <div className="d-chrome-bar" style={{ right:-9, background:"linear-gradient(90deg,#445,#99b,#556,#aac,#334)" }} />

                <div style={{ background:"linear-gradient(180deg,#000d1a,#001828,#000d1a)", borderBottom:"2px solid rgba(0,200,255,.2)", borderRadius:"20px 20px 0 0", padding:"12px 24px 8px", textAlign:"center" }}>
                  <div style={{ overflow:"hidden", marginBottom:8, height:18 }}>
                    <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:11, color:"#00f5ff", letterSpacing:4, whiteSpace:"nowrap", animation:"marqueeScroll 14s linear infinite" }}>
                      ★ PREDICT HIGH OR LOW ★ &nbsp;&nbsp;&nbsp; 🎲 1.96× PAYOUT &nbsp;&nbsp;&nbsp; ⚡ INSTANT RESULT &nbsp;&nbsp;&nbsp; 🔐 ON-CHAIN RNG &nbsp;&nbsp;&nbsp;
                    </div>
                  </div>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:44, letterSpacing:8, background:"linear-gradient(180deg,#fff 0%,#00f5ff 35%,#0088ff 65%,#004488 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", filter:"drop-shadow(0 0 14px rgba(0,200,255,.7))", lineHeight:1 }}>LUCKY DICE</div>
                  <DiceBulbs count={26} />
                </div>

                <div style={{ padding:"20px 24px 26px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                    <div className="d-lcd" style={{ padding:"6px 14px" }}>
                      <span style={{ display:"block", fontSize:9, color:"#4ade80", letterSpacing:2, fontFamily:"'Rajdhani',sans-serif" }}>gUSDC BALANCE</span>
                      <span style={{ fontSize:16, color:"#4ade80", letterSpacing:2, fontFamily:"'Orbitron',monospace", fontWeight:700 }}>{balance}</span>
                    </div>
                    <a href="/faucet" style={{ fontSize:11, color:"#00f5ff", padding:"7px 14px", background:"rgba(0,245,255,.06)", border:"1px solid rgba(0,245,255,.2)", borderRadius:50, textDecoration:"none", fontFamily:"'Rajdhani',sans-serif", fontWeight:700, letterSpacing:1 }}>+ SWAP</a>
                  </div>

                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:20 }}>
                    <div style={{ padding:"24px 32px", borderRadius:20, background:"linear-gradient(180deg,#050e1a,#080f1e,#050e1a)", border:"3px solid", borderColor:"#224 #112 #113 #335", boxShadow:"inset 0 4px 20px rgba(0,0,0,.9),0 4px 20px rgba(0,0,0,.6)" }}>
                      <Dice3D value={diceVal} rolling={busy} won={won} />
                    </div>
                    <div style={{ display:"flex", gap:10, marginTop:16 }}>
                      {[1,2,3,4,5,6].map(n => (
                        <div key={n} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                           <DiceFace value={n} size={38} style={{ 
                               border: diceVal===n && !busy ? (n>=4?"2px solid #4ade80":"2px solid #f87171") : "1px solid #cbd5e1",
                               boxShadow: diceVal===n && !busy ? `0 0 10px ${n>=4?"#4ade80":"#f87171"}` : "none",
                               transform: diceVal===n && !busy ? "scale(1.1)" : "scale(1)",
                               transition: "all 0.2s"
                           }} />
                           <span style={{ fontSize:9, color:n>=4?"#4ade80":"#f87171", fontWeight:900, fontFamily: "'Orbitron', monospace" }}>{n>=4?"HI":"LO"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {busy && (
                    <div style={{ textAlign:"center", marginBottom:12 }}>
                      <span style={{ fontFamily:"'Orbitron',monospace", fontSize:12, fontWeight:700, color:"#00f5ff", letterSpacing:3, animation:"dGlow .6s infinite alternate" }}>⚡ ROLLING...</span>
                    </div>
                  )}

                  {result && !busy && <DiceResultBanner result={result} onReset={reset} />}

                  {err && <div style={{ background:"rgba(248,113,113,.08)", border:"1px solid rgba(248,113,113,.25)", borderRadius:10, padding:"9px 14px", marginBottom:12, color:"#f87171", fontSize:12, fontFamily:"'Rajdhani',sans-serif", fontWeight:600 }}>⚠️ {err}</div>}
                  {isConnected && needApprove && !busy && (
                    <div style={{ background:"rgba(251,191,36,.06)", border:"1px solid rgba(251,191,36,.25)", borderRadius:10, padding:"9px 14px", marginBottom:12, color:"#fbbf24", fontSize:11, fontFamily:"'Rajdhani',sans-serif", fontWeight:600 }}>
                      ⚡ Approve gUSDC to Dice contract before your first roll.
                    </div>
                  )}

                  <div style={{ fontSize:9, color:"#cbd5e1", textTransform:"uppercase", letterSpacing:3, marginBottom:8, fontFamily:"'Rajdhani',sans-serif", fontWeight:600 }}>PREDICT</div>
                  <div style={{ display:"flex", gap:10, marginBottom:18 }}>
                    {[
                      { val:true,  label:"HIGH", sub:"4 · 5 · 6", color:"#4ade80", rgb:"74,222,128" },
                      { val:false, label:"LOW",  sub:"1 · 2 · 3", color:"#f87171", rgb:"248,113,113" },
                    ].map(o => (
                      <button key={o.label} className="d-choice-btn" onClick={() => setIsHigh(o.val)} disabled={busy}
                        style={{ background:isHigh===o.val?`rgba(${o.rgb},.12)`:"rgba(255,255,255,.02)", borderColor:isHigh===o.val?`rgba(${o.rgb},.55)`:"rgba(255,255,255,.07)", color:isHigh===o.val?o.color:"#94a3b8", opacity:busy?.45:1 }}>
                        {o.val?"⬆":"⬇"} {o.label}
                        <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:11, marginTop:2, opacity:.7 }}>{o.sub}</div>
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize:9, color:"#cbd5e1", textTransform:"uppercase", letterSpacing:3, marginBottom:8, fontFamily:"'Rajdhani',sans-serif", fontWeight:600 }}>BET AMOUNT (gUSDC)</div>
                  <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:18 }}>
                    {BETS.map(v => (
                      <button key={v} className={`d-bet-chip${bet===v?" active":""}`} onClick={() => setBet(v)} disabled={busy}>{v}</button>
                    ))}
                  </div>

                  {isConnected ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {needApprove
                        ? <button className="d-approve-btn" onClick={handleApprove} disabled={approving}>{approving?"⏳ APPROVING...":"🔓 APPROVE gUSDC"}</button>
                        : <button className="d-spin-btn" onClick={handleRoll} disabled={busy}>{busy?"⚡ PROCESSING...":`🎲 ROLL ${isHigh?"HIGH":"LOW"} — ${bet} gUSDC`}</button>
                      }
                      {txHash && <a href={`https://sepolia.basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ textAlign:"center", fontSize:10, color:"#94a3b8", textDecoration:"none", fontFamily:"'Rajdhani',sans-serif" }}>↗ View on Basescan</a>}
                    </div>
                  ) : (
                    <div style={{ display:"flex", justifyContent:"center", paddingTop:4 }}><ConnectButton label="Connect Wallet" /></div>
                  )}
                </div>

                <div style={{ height:16, margin:"0 16px", background:"linear-gradient(180deg,#223,#445,#334,#556,#223)", borderRadius:"0 0 20px 20px", borderTop:"2px solid #446", boxShadow:"0 8px 24px rgba(0,0,0,.7)" }} />
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ background:"#080d1a", border:"1px solid rgba(0,245,255,.08)", borderRadius:16, padding:"14px 16px" }}>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:14, color:"#00f5ff", letterSpacing:4, marginBottom:10 }}>★ HOW TO PLAY ★</div>
                  {[
                    ["01","Choose HIGH (4-5-6) or LOW (1-2-3)"],
                    ["02","Set your bet amount in gUSDC"],
                    ["03","Click ROLL — result is instant on-chain"],
                    ["04","Win 1.96× your bet if you predicted right"],
                  ].map(([n, t]) => (
                    <div key={n} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"flex-start" }}>
                      <span style={{ fontFamily:"'Orbitron',monospace", fontSize:9, color:"#00f5ff", fontWeight:700, minWidth:20 }}>{n}</span>
                      <span style={{ fontSize:11, color:"#cbd5e1", fontFamily:"'Rajdhani',sans-serif", lineHeight:1.5 }}>{t}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:"#080d1a", border:"1px solid rgba(255,255,255,.05)", borderRadius:16, padding:"14px 16px" }}>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:14, color:"#fb923c", letterSpacing:4, marginBottom:10 }}>GAME INFO</div>
                  {[["Win Chance","50%"],["Payout","1.96×"],["House Edge","2%"],["Min Bet","1 gUSDC"],["Max Bet","100 gUSDC"],["TX","1 (instant)"]].map(([l,v]) => (
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid rgba(255,255,255,0.1)", fontSize:11, fontFamily:"'Rajdhani',sans-serif" }}>
                      <span style={{ color:"#94a3b8" }}>{l}</span><span style={{ color:"#ffffff", fontWeight:700 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:"#080d1a", border:"1px solid rgba(255,255,255,.05)", borderRadius:16, padding:"14px 16px" }}>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:14, color:"#fb923c", letterSpacing:4, marginBottom:10 }}>ROLL HISTORY</div>
                  {history.length===0 ? (
                    <p style={{ color:"#64748b", fontSize:11, textAlign:"center", padding:"10px 0", fontFamily:"'Rajdhani',sans-serif" }}>No rolls yet</p>
                  ) : history.map((h,i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 10px", borderRadius:10, marginBottom:4, background:h.won?"rgba(74,222,128,.06)":"rgba(248,113,113,.05)", border:`1px solid ${h.won?"rgba(74,222,128,.12)":"rgba(248,113,113,.1)"}` }}>
                      <span style={{ fontSize:11, color:"#cbd5e1", fontFamily:"'Rajdhani',sans-serif" }}>{FACES[h.diceValue-1]} {h.diceValue} · {h.diceValue>=4?"H":"L"} vs {h.isHigh?"H":"L"}</span>
                      <span style={{ fontWeight:700, fontSize:11, fontFamily:"'Orbitron',monospace", color:h.won?"#4ade80":"#f87171" }}>{h.won?`+${Number(h.payout).toFixed(2)}`:`-${h.bet}`}</span>
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