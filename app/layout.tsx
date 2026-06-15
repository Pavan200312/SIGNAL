import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SnapMarket Pulse — Real Estate Intelligence",
  description: "AI-powered USA real estate intelligence dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Public+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/pulse.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
