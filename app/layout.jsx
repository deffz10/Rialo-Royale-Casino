import "../styles/globals.css";
import { Providers } from "@/components/Providers";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

export const metadata = {
  title: "Rialo Royal Casino ",
  description: "Play Dice, Slots, CoinFlip on Base Testnet. Connect once, play everything.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin:0, padding:0, background:"#020610" }}>
        <Providers>
          <div style={{ display:"flex", minHeight:"100vh" }}>

            {/* Sidebar — fixed width, does NOT grow/shrink */}
            <div style={{ width:"220px", flexShrink:0 }}>
              <Sidebar />
            </div>

            {/* Main content — fills remaining space, clips overflow */}
            <div style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}>
              <Navbar />
              <main style={{ flex:1 }}>
                {children}
              </main>
            </div>

          </div>
        </Providers>
      </body>
    </html>
  );
}
