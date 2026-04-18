"use client";

import { useAccount, useBalance, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CHAIN_ID } from "@/lib/wagmi";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://pbenkyplyfvgnmrvcasy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZW5reXBseWZ2Z25tcnZjYXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDAzODIsImV4cCI6MjA5MjA3NjM4Mn0.gnTWu1Lmrn2DkTBUzgDFCCGMTz8LDGQwXuvwBnbGMGU"
);

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

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.041.033.051a19.85 19.85 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function SocialRow({ icon, label, placeholder, value, onChange, color, href }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}33`, color }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-white placeholder-gray-600 outline-none"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "4px" }}
        />
      </div>
      {value && href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded-lg transition-all" style={{ background: `${color}18`, color, border: `1px solid ${color}22` }}>
          ↗
        </a>
      ) : null}
    </div>
  );
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address, chainId: CHAIN_ID });
  const { disconnect } = useDisconnect();
  const fileInputRef = useRef(null);

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [socials, setSocials] = useState({ x: "", discord: "", telegram: "" });
  const [drafts, setDrafts] = useState({ x: "", discord: "", telegram: "" });

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    supabase
      .from("profiles")
      .select("avatar_url, x_handle, discord_handle, telegram_handle")
      .eq("wallet_address", address.toLowerCase())
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setAvatarUrl(data.avatar_url || null);
          const s = {
            x: data.x_handle || "",
            discord: data.discord_handle || "",
            telegram: data.telegram_handle || "",
          };
          setSocials(s);
          setDrafts(s);
        }
        setLoading(false);
      });
  }, [address]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !address) return;
    if (!file.type.startsWith("image/")) { alert("File harus berupa gambar."); return; }
    if (file.size > 2 * 1024 * 1024) { alert("Ukuran file max 2MB."); return; }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `avatars/${address.toLowerCase()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("profiles").getPublicUrl(path);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      await supabase.from("profiles").upsert(
        { wallet_address: address.toLowerCase(), avatar_url: publicUrl, updated_at: new Date().toISOString() },
        { onConflict: "wallet_address" }
      );

      setAvatarUrl(publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Gagal upload foto. Pastikan bucket 'profiles' sudah dibuat di Supabase Storage.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSocials = async () => {
    if (!address) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          wallet_address: address.toLowerCase(),
          x_handle: drafts.x.replace("@", "").trim(),
          discord_handle: drafts.discord.trim(),
          telegram_handle: drafts.telegram.replace("@", "").trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "wallet_address" }
      );
      if (error) throw error;
      setSocials({ ...drafts });
      setEditMode(false);
      setSaveMsg("Tersimpan! ✓");
      setTimeout(() => setSaveMsg(""), 2500);
    } catch (err) {
      console.error("Save error:", err);
      alert("Gagal menyimpan. Cek console untuk detail.");
    } finally {
      setSaving(false);
    }
  };

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

  const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <div
      className="min-h-screen grid-bg px-8 py-10"
      style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,245,255,0.04), transparent)" }}
    >
      <div className="max-w-4xl mx-auto">

        <div className="mb-10">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: "'Orbitron', monospace", color: "#00f5ff" }}>
            MY PROFILE
          </h1>
          <p className="text-gray-500">Your wallet stats on Base Sepolia.</p>
        </div>

        {/* Wallet Card */}
        <div
          className="rounded-2xl p-8 mb-8 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0a1228, #0d1832)",
            border: "1px solid rgba(0,245,255,0.15)",
            boxShadow: "0 0 40px rgba(0,245,255,0.06)",
          }}
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #00f5ff, transparent)" }} />

          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0 group">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-200 relative"
                style={{
                  background: "linear-gradient(135deg, rgba(0,245,255,0.15), rgba(0,102,255,0.15))",
                  border: "2px solid rgba(0,245,255,0.2)",
                  boxShadow: "0 0 20px rgba(0,245,255,0.12)",
                }}
                onClick={() => fileInputRef.current?.click()}
                title="Klik untuk ganti foto"
              >
                {uploading ? (
                  <div className="text-xs text-center text-gray-400 px-1">
                    <div className="animate-spin text-xl mb-1">⟳</div>
                  </div>
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl"
                  style={{ background: "rgba(0,0,0,0.6)" }}
                >
                  <span className="text-xs text-white font-bold">📷 Edit</span>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Wallet Address</p>
              <p className="text-xl font-bold font-mono" style={{ color: "#00f5ff" }}>{short}</p>
              <p className="text-xs text-gray-600 mt-1 font-mono break-all">{address}</p>

              {!editMode && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {socials.x ? (
                    <a href={`https://x.com/${socials.x}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105" style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}>
                      <XIcon /> @{socials.x}
                    </a>
                  ) : null}
                  {socials.discord ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(88,101,242,0.15)", color: "#7289da", border: "1px solid rgba(88,101,242,0.25)" }}>
                      <DiscordIcon /> {socials.discord}
                    </span>
                  ) : null}
                  {socials.telegram ? (
                    <a href={`https://t.me/${socials.telegram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105" style={{ background: "rgba(0,136,204,0.15)", color: "#29a9e0", border: "1px solid rgba(0,136,204,0.25)" }}>
                      <TelegramIcon /> @{socials.telegram}
                    </a>
                  ) : null}
                  {!socials.x && !socials.discord && !socials.telegram && !loading ? (
                    <span className="text-xs text-gray-600 italic">Belum ada social links</span>
                  ) : null}
                </div>
              )}
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

          {/* Network */}
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
              <a href={`https://sepolia.basescan.org/address/${address}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold transition-colors hover:text-white" style={{ color: "#00f5ff" }}>
                View on Basescan ↗
              </a>
            </div>
          </div>
        </div>

        {/* Social Links Card */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            background: "linear-gradient(135deg, #0a1228, #0d1832)",
            border: "1px solid rgba(0,245,255,0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: "#00f5ff", fontFamily: "'Orbitron', monospace" }}>
                Social Links
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">Hubungkan akun sosialmu</p>
            </div>
            <div className="flex items-center gap-2">
              {saveMsg ? <span className="text-xs font-semibold text-green-400">{saveMsg}</span> : null}
              {editMode ? (
                <>
                  <button
                    onClick={() => { setDrafts({ ...socials }); setEditMode(false); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveSocials}
                    disabled={saving}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 disabled:opacity-50"
                    style={{ background: "rgba(0,245,255,0.15)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.3)" }}
                  >
                    {saving ? "Saving..." : "Simpan"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                  style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.2)" }}
                >
                  ✎ Edit
                </button>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <SocialRow
              icon={<XIcon />}
              label="X (Twitter)"
              placeholder="username (tanpa @)"
              value={editMode ? drafts.x : socials.x}
              onChange={(v) => setDrafts((d) => ({ ...d, x: v }))}
              color="#ffffff"
              href={socials.x ? `https://x.com/${socials.x}` : null}
            />
            <SocialRow
              icon={<DiscordIcon />}
              label="Discord"
              placeholder="username#0000 atau username"
              value={editMode ? drafts.discord : socials.discord}
              onChange={(v) => setDrafts((d) => ({ ...d, discord: v }))}
              color="#7289da"
              href={null}
            />
            <SocialRow
              icon={<TelegramIcon />}
              label="Telegram"
              placeholder="username (tanpa @)"
              value={editMode ? drafts.telegram : socials.telegram}
              onChange={(v) => setDrafts((d) => ({ ...d, telegram: v }))}
              color="#29a9e0"
              href={socials.telegram ? `https://t.me/${socials.telegram}` : null}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Games Played" value="—" sub="All games" />
          <StatCard label="Total Wagered" value="—" sub="ETH" color="#a78bfa" />
          <StatCard label="Total Won" value="—" sub="ETH" color="#4ade80" />
          <StatCard label="Win Rate" value="—" sub="%" color="#fb923c" />
        </div>

        {/* Note */}
        <div className="card p-5 mb-8" style={{ background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.08)" }}>
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
            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}
          >
            Disconnect Wallet
          </button>
        </div>

      </div>
    </div>
  );
}
