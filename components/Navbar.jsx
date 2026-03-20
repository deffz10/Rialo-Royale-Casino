"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";
import { usePathname } from "next/navigation";
import { CHAIN_ID } from "@/lib/wagmi";

const PAGE_TITLES = {
  "/": "Home",
  "/games/dice": "Lucky Dice",
  "/games/coinflip": "Coin Flip",
  "/games/slots": "Lucky Slots",
  "/faucet": "Swap gUSDC",
  "/profile": "My Profile",
};

export function Navbar() {
  const path = usePathname();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address,
    chainId: CHAIN_ID,
    query: { enabled: isConnected },
  });
  const title = PAGE_TITLES[path] || "Rialo Hub";

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 32px", height: "64px", minHeight: "64px",
      background: "rgba(5,8,16,0.95)",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(0,245,255,0.07)",
      overflow: "visible", boxSizing: "border-box",
    }}>
      {/* Left breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {/* SEBELUMNYA: #475569 (Gelap) | SEKARANG: #cbd5e1 (Terang) */}
        <span style={{ color: "#cbd5e1", fontSize: 13 }}>Rialo Hub</span>
        {/* SEBELUMNYA: #334155 (Gelap) | SEKARANG: #64748b (Terang) */}
        <span style={{ color: "#64748b", fontSize: 13 }}>/</span>
        <span style={{ color: "#00f5ff", fontSize: 13, fontWeight: 700, letterSpacing: "0.04em" }}>
          {title}
        </span>
      </div>

      {/* Right — balance + wallet button, never clipped */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {isConnected && balance && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 10,
            background: "rgba(0,245,255,0.05)",
            border: "1px solid rgba(0,245,255,0.12)",
            whiteSpace: "nowrap",
          }}>
            {/* SEBELUMNYA: #64748b (Gelap) | SEKARANG: #cbd5e1 (Terang) */}
            <span style={{ color: "#cbd5e1", fontSize: 13 }}>Balance:</span>
            <span style={{ fontWeight: 700, color: "#00f5ff", fontFamily: "'Orbitron',monospace", fontSize: 12 }}>
              {parseFloat(balance.formatted).toFixed(4)} ETH
            </span>
          </div>
        )}
        <div style={{ position: "relative", zIndex: 200 }}>
          <ConnectButton chainStatus="icon" showBalance={false} accountStatus="full" />
        </div>
      </div>
    </header>
  );
}