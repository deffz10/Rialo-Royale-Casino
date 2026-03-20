"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Rialo Hub",
  projectId: "22f4683a3d9613502ad1e923d2f377eb", // replace with your WalletConnect project ID
  chains: [baseSepolia],
  ssr: true,
});

export const CHAIN = baseSepolia;
export const CHAIN_ID = baseSepolia.id; // 84532
