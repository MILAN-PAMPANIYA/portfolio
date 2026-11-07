import type { Metadata, Viewport } from "next";
import { Anton, Caveat_Brush, Geist, Geist_Mono } from "next/font/google";
import { AgentRuntime } from "@/components/agent-runtime";
import "./globals.css";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const caveat = Caveat_Brush({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Milan Pampaniya — Portfolio",
  description:
    "Portfolio of Milan Pampaniya, a B.Tech Information Technology student at LJ Institute of Engineering in Ahmedabad and an aspiring software engineer.",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

const BOOT_JS = `
(function () {
  try {
    var q = new URLSearchParams(location.search).get("agents");
    var stored = null;
    try { stored = localStorage.getItem("portfolio-agents"); } catch (e) {}
    var reduce = false;
    try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
    var on = true;
    if (q === "on") on = true;
    else if (q === "off") on = false;
    else if (stored === "off") on = false;
    else if (stored === "on") on = true;
    else if (reduce) on = false;
    window.__AGENTS_ON = on;
    window.__BOOT_AT = performance.now();
    document.documentElement.classList.toggle("build-mode", on);
    document.documentElement.classList.toggle("agents-off", !on);
    document.documentElement.dataset.agents = on ? "on" : "off";
  } catch (err) {
    window.__AGENTS_ON = true;
    window.__BOOT_AT = performance.now();
    document.documentElement.classList.add("build-mode");
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${geist.variable} ${geistMono.variable} ${caveat.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_JS }} />
      </head>
      <body suppressHydrationWarning>
        <div id="boot-screen" role="status">
          <p className="mono">Build crew</p>
          <p className="boot-title">Stand by</p>
          <p className="boot-sub">
            Scout, Layout, Typeset, Motion, QA, and Deploy are clocking in.
          </p>
          <div className="boot-bar" aria-hidden="true">
            <span />
          </div>
          <div className="boot-crew" aria-hidden="true">
            <span>Scout</span>
            <span>Layout</span>
            <span>Typeset</span>
            <span>Motion</span>
            <span>QA</span>
            <span>Deploy</span>
          </div>
        </div>
        <noscript>
          <style>{`[data-build]{visibility:visible !important}#boot-screen{display:none !important}`}</style>
        </noscript>
        {children}
        <AgentRuntime />
      </body>
    </html>
  );
}
