import "@/styles/globals.css";

import { type Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { Preferences } from "@/components/ui/preferences";
import { ReactLenis } from "lenis/react";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const ingram = localFont({
  src: "../../public/fonts/ingram/IngramMono-Regular.ttf",
  variable: "--font-ingram",
});

const inter = localFont({
  src: "../../public/fonts/inter/InterVariable.ttf",
  variable: "--font-inter",
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
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${ingram.variable} font-inter antialiased`}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ReactLenis
            root
            options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}
          >
            <Preferences />
            {children}
            <Toaster position={"bottom-center"} richColors />
          </ReactLenis>
        </ThemeProvider>
      </body>
    </html>
  );
}
