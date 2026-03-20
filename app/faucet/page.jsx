"use client";
import React, { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { CHAIN_ID } from "@/lib/wagmi";
import {
  USDC_ADDRESS,
  GUSDC_ADDRESS,
  TREASURY_ADDRESS,
  ERC20_ABI,
  TREASURY_ABI,
  MAX_UINT,
} from "@/lib/contracts";

export default function SwapPage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [tab, setTab] = useState("deposit"); // deposit | withdraw
  const [amount, setAmount] = useState("12");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  // --- Contract Reads ---
  const { data: usdcBal, refetch: refetchUsdc } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
    query: { enabled: !!address },
    chainId: CHAIN_ID,
  });
  const { data: gusdcBal, refetch: refetchGusdc } = useReadContract({
    address: GUSDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
    query: { enabled: !!address },
    chainId: CHAIN_ID,
  });
  const { data: usdcAllow, refetch: refetchAllow } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address, TREASURY_ADDRESS],
    query: { enabled: !!address },
    chainId: CHAIN_ID,
  });
  const { data: stats } = useReadContract({
    address: TREASURY_ADDRESS,
    abi: TREASURY_ABI,
    functionName: "getStats",
    chainId: CHAIN_ID,
  });
  const { data: depFee } = useReadContract({
    address: TREASURY_ADDRESS,
    abi: TREASURY_ABI,
    functionName: "depositFeeBps",
    chainId: CHAIN_ID,
  });
  const { data: witFee } = useReadContract({
    address: TREASURY_ADDRESS,
    abi: TREASURY_ABI,
    functionName: "withdrawFeeBps",
    chainId: CHAIN_ID,
  });

  // --- Derived State ---
  const usdcBalance = usdcBal ? parseFloat(formatUnits(usdcBal, 6)).toFixed(2) : "0.00";
  const gusdcBalance = gusdcBal ? parseFloat(formatUnits(gusdcBal, 6)).toFixed(2) : "0.00";
  const bankroll = stats ? parseFloat(formatUnits(stats[1], 6)).toFixed(2) : "0.00";

  const dFee = depFee ? Number(depFee) / 100 : 1;
  const wFee = witFee ? Number(witFee) / 100 : 1;
  const currentFee = tab === "deposit" ? dFee : wFee;
  
  const amt = parseFloat(amount || "0");
  const feeDeduction = (amt * currentFee) / 100;
  const receiveAmount = (amt - feeDeduction).toFixed(4);

  const amtWei = parseUnits(amount || "0", 6);
  const needApprove = tab === "deposit" && (!usdcAllow || usdcAllow < amtWei);

  const refetchAll = () => {
    setTimeout(() => {
      refetchUsdc();
      refetchGusdc();
      refetchAllow();
    }, 2000);
  };

  // --- Handlers ---
  const handleAction = async () => {
    if (!isConnected) return setMsg({ type: "err", text: "Please connect your wallet first." });
    setMsg(null);
    setBusy(true);
    try {
      if (tab === "deposit" && needApprove) {
        await writeContractAsync({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [TREASURY_ADDRESS, MAX_UINT],
          chainId: CHAIN_ID,
        });
        setMsg({ type: "ok", text: "✅ USDC Approved!" });
        refetchAllow();
      } else {
        await writeContractAsync({
          address: TREASURY_ADDRESS,
          abi: TREASURY_ABI,
          functionName: tab === "deposit" ? "deposit" : "withdraw",
          args: [amtWei],
          chainId: CHAIN_ID,
        });
        setMsg({ type: "ok", text: `✅ ${tab === "deposit" ? "Deposit" : "Withdrawal"} successful!` });
        refetchAll();
      }
    } catch (e) {
      setMsg({ type: "err", text: e.shortMessage || "Transaction failed" });
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen text-slate-200 p-6 md:p-12"
      style={{ background: "radial-gradient(circle at 50% -20%, rgba(0, 245, 255, 0.05), transparent 70%)" }}>
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">💎</span>
            <h1 className="text-3xl font-black tracking-tighter text-cyan-400" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              RIALO EXCHANGE
            </h1>
          </div>
          <p className="text-white/80 text-sm font-medium">Convert your USDC to gUSDC chips to start playing across the ecosystem.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: QUICK START GUIDE */}
          <aside className="lg:col-span-5 bg-slate-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
            <h2 className="text-[10px] font-bold text-orange-400 tracking-[0.2em] uppercase mb-8" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Quick Start Guide
            </h2>
            
            <div className="space-y-8">
              {/* Step 01 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black border border-cyan-500/20 bg-cyan-500/10 text-cyan-400" style={{ fontFamily: "'Orbitron', sans-serif" }}>01</div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">Get Base Sepolia ETH & USDC (Base Sepolia)</p>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">Used for all transactions (gas fees):</p>
                  <a href="https://www.alchemy.com/faucets/base-sepolia" target="_blank" className="text-cyan-400 text-[10px] block hover:underline">→ Base Sepolia Faucet</a>
                  <p className="text-xs text-slate-300 leading-relaxed mt-3 mb-2">Used to swap into gUSDC:</p>
                  <a href="https://faucet.circle.com/" target="_blank" className="text-cyan-400 text-[10px] block hover:underline">→ USDC Base Sepolia Faucet</a>
                </div>
              </div>

              {/* Step 02 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black border border-green-500/20 bg-green-500/10 text-green-400" style={{ fontFamily: "'Orbitron', sans-serif" }}>02</div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">Get Test USDC</p>
                  <p className="text-xs text-slate-300">Use our community faucet to get play tokens.</p>
                </div>
              </div>

              {/* Step 03 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black border border-purple-500/20 bg-purple-500/10 text-purple-400" style={{ fontFamily: "'Orbitron', sans-serif" }}>03</div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">Deposit to gUSDC</p>
                  <p className="text-xs text-slate-300">Approve once, then deposit. You will receive gUSDC chips (1% fee).</p>
                </div>
              </div>

              {/* Step 04 - KEMBALI ADA */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black border border-orange-500/20 bg-orange-500/10 text-orange-400" style={{ fontFamily: "'Orbitron', sans-serif" }}>04</div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">Ready to Play</p>
                  <p className="text-xs text-slate-300">Each game will deduct chips directly from your balance based on your bet.</p>
                </div>
              </div>

              {/* Step 05 - KEMBALI ADA */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black border border-cyan-500/20 bg-cyan-500/10 text-cyan-400" style={{ fontFamily: "'Orbitron', sans-serif" }}>05</div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">Withdraw Wins</p>
                  <p className="text-xs text-slate-300">Convert gUSDC back to USDC instantly (1% fee).</p>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT: SWAP INTERFACE */}
          <main className="lg:col-span-7">
            {/* Stats Row - Teks Putih Terang */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Your USDC", value: usdcBalance, color: "#4ade80" },
                { label: "Your gUSDC", value: gusdcBalance, color: "#00f5ff" },
                { label: "Bankroll", value: `${bankroll} USDC`, color: "#a78bfa" },
              ].map((s) => (
                <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                  <span className="block text-[9px] uppercase tracking-widest text-white font-bold mb-1">
                    {s.label}
                  </span>
                  <span className="text-lg font-black" style={{ color: s.color, fontFamily: "'Orbitron', sans-serif" }}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Swap Card */}
            <div className="bg-[#0b1222] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
              <div className="flex p-2 bg-black/20">
                {["deposit", "withdraw"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all ${
                      tab === t 
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    {t === "deposit" ? "⬇️ Deposit" : "⬆️ Withdraw"}
                  </button>
                ))}
              </div>

              <div className="p-10">
                <div className="flex items-center justify-center gap-8 mb-10">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-2xl mb-2 border border-white/5">
                      {tab === "deposit" ? "💵" : "🎮"}
                    </div>
                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">{tab === "deposit" ? "USDC" : "gUSDC"}</span>
                  </div>
                  <span className="text-white/20 text-3xl">→</span>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-cyan-500/5 rounded-2xl flex items-center justify-center text-2xl mb-2 border border-cyan-500/10">
                      {tab === "deposit" ? "🎮" : "💵"}
                    </div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-tighter">{tab === "deposit" ? "gUSDC" : "USDC"}</span>
                  </div>
                </div>

                {/* Input */}
                <div className="mb-8">
                  <label className="text-[10px] font-bold text-white uppercase tracking-widest mb-3 block">Amount to Swap</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-6 text-2xl font-black text-white outline-none focus:border-cyan-500/40 transition-all"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-white/50">{tab === "deposit" ? "USDC" : "gUSDC"}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {[10, 50, 100, 500].map((v) => (
                      <button 
                        key={v} 
                        onClick={() => setAmount(v.toString())} 
                        className="flex-1 py-2 rounded-lg text-[10px] font-bold bg-white/5 border border-white/5 text-white hover:bg-white/10 transition-all"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 mb-8 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/80 font-medium">You Send</span>
                    <span className="text-white font-bold">{amount || "0"} {tab === "deposit" ? "USDC" : "gUSDC"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/80 font-medium">Service Fee (1%)</span>
                    <span className="text-red-400 font-bold">-{feeDeduction.toFixed(4)}</span>
                  </div>
                  <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-sm font-bold text-white">You Receive</span>
                    <span className="text-xl font-black text-green-400" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                      {receiveAmount} {tab === "deposit" ? "gUSDC" : "USDC"}
                    </span>
                  </div>
                </div>

                {msg && (
                  <div className={`mb-6 p-4 rounded-xl text-xs border ${msg.type === "ok" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                    {msg.text}
                  </div>
                )}

                <button
                  onClick={handleAction}
                  disabled={busy}
                  className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {busy ? "Processing..." : tab === "deposit" && needApprove ? "🔓 Approve USDC" : `Confirm ${tab}`}
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}