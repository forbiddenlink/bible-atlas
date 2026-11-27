import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  title: "Bible Atlas",
  description: "A free atlas of biblical places, the people tied to them, and the passages that name them.",
  openGraph: {
    type: "website",
    siteName: "Bible Atlas",
    title: "Bible Atlas",
    description: "A free atlas of biblical places, the people tied to them, and the passages that name them.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bible Atlas",
    description: "A free atlas of biblical places, the people tied to them, and the passages that name them.",
  },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

const themeInit = `try{var t=localStorage.getItem("theme");if(!t){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://tiles.openfreemap.org" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
