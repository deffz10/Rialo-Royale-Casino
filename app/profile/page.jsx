"use client";

import { useAccount, useBalance, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CHAIN_ID } from "@/lib/wagmi";

function StatCard({ label, value, sub, color = "#00f5ff" }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-black" style={{ color, fontFamily: "'Orbitron', monospace" }}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address, chainId: CHAIN_ID });
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center px-8">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-6">👤</div>
          <h1 className="text-2xl font-black mb-3" style={{ fontFamily: "'Orbitron', monospace" }}>
            Connect Wallet
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            Connect your wallet to see your profile, stats, and transaction history.
          </p>
          <ConnectButton label="Connect Wallet" />
        </div>
      </div>
    );
  }

  const short = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return (
    <div className="min-h-screen grid-bg px-8 py-10"
      style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,245,255,0.04), transparent)" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: "'Orbitron', monospace", color: "#00f5ff" }}>
            MY PROFILE
          </h1>
          <p className="text-gray-500">Your wallet stats on Base Sepolia.</p>
        </div>

        {/* Wallet card */}
        <div
          className="rounded-2xl p-8 mb-8 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0a1228, #0d1832)",
            border: "1px solid rgba(0,245,255,0.15)",
            boxShadow: "0 0 40px rgba(0,245,255,0.06)",
          }}
        >
          {/* Glow blob */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #00f5ff, transparent)" }} />

          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,245,255,0.15), rgba(0,102,255,0.15))",
                border: "2px solid rgba(0,245,255,0.2)",
                boxShadow: "0 0 20px rgba(0,245,255,0.12)",
              }}
            >
              👤
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Wallet Address</p>
              <p className="text-xl font-bold font-mono" style={{ color: "#00f5ff" }}>
                {short}
              </p>
              <p className="text-xs text-gray-600 mt-1 font-mono break-all">{address}</p>
            </div>

            {/* Balance */}
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Balance</p>
              <p className="text-3xl font-black" style={{ color: "#00f5ff", fontFamily: "'Orbitron', monospace" }}>
                {balance ? parseFloat(balance.formatted).toFixed(4) : "—"}
              </p>
              <p className="text-sm text-gray-500">ETH (Testnet)</p>
            </div>
          </div>

          {/* Network info */}
          <div className="mt-6 pt-6 border-t flex flex-wrap gap-6" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div>
              <p className="text-xs text-gray-600 mb-1">Network</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-semibold text-green-400">Base Sepolia</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Chain ID</p>
              <p className="text-sm font-semibold text-white">84532</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Explorer</p>
              <a
                href={`https://sepolia.basescan.org/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold transition-colors hover:text-white"
                style={{ color: "#00f5ff" }}
              >
                View on Basescan ↗
              </a>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Games Played" value="—" sub="All games" />
          <StatCard label="Total Wagered" value="—" sub="ETH" color="#a78bfa" />
          <StatCard label="Total Won" value="—" sub="ETH" color="#4ade80" />
          <StatCard label="Win Rate" value="—" sub="%" color="#fb923c" />
        </div>

        {/* Note about stats */}
        <div className="card p-5 mb-8"
          style={{ background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.08)" }}>
          <p className="text-xs text-gray-500">
            📊 <strong style={{ color: "#00f5ff" }}>Note:</strong> Game stats akan tersimpan secara on-chain setelah smart contract VRF diintegrasikan. 
            Saat ini stats disimpan per sesi browser saja.
          </p>
        </div>

        {/* Disconnect */}
        <div className="flex justify-end">
          <button
            onClick={() => disconnect()}
            className="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105"
            style={{
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.2)",
              color: "#f87171",
            }}
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
