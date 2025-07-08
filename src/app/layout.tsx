import "@/styles/globals.css";

import { type Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { Preferences } from "@/components/ui/preferences";
import { ReactLenis } from "lenis/react";
import { Toaster as SonnerToaster } from "sonner";
import { DM_Sans } from "next/font/google";

// Update: Font now loaded from src/app/fonts/ingram instead of public/fonts/ingram
const ingram = localFont({
  src: "./fonts/ingram/IngramMono-Regular.ttf",
  variable: "--font-ingram",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dmSans",
});
// Update: Font now loaded from src/app/fonts/Inter instead of public/fonts/inter

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
      className={`${dmSans.variable} ${ingram.variable} font-dmSans antialiased`}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ReactLenis
            root
            options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}
          >
            <Preferences />
            {children}
          </ReactLenis>
          <SonnerToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
