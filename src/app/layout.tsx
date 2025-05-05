import "@/styles/globals.css";

import { type Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { Preferences } from "@/components/ui/preferences";
import { ReactLenis } from "lenis/react";

import { Toaster } from "@/components/ui/sonner";

const ingramMono = localFont({
  src: "../../public/fonts/IngramMono-Regular.ttf",
  variable: "--font-ingram",
});

const Inter = localFont({
  src: "../../public/fonts/InterVariable.ttf",
  variable: "--font-inter",
  fallback: ["sans-serif"],
});

export const metadata: Metadata = {
  title: "Dataweb Group",
  description: "Dataweb Group",
  icons: { icon: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en antialiased"
      suppressHydrationWarning
      className={`${Inter.variable} ${ingramMono.variable} font-inter antialiased`}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ReactLenis
            root
            options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}
          >
            <Preferences />
            {children}
            <Toaster />
          </ReactLenis>
        </ThemeProvider>
      </body>
    </html>
  );
}
