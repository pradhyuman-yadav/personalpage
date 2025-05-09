import type { Metadata } from "next";
import { Inconsolata } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { DesktopIcon } from "@radix-ui/react-icons";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import NavMenu from "@/components/NavMenu";
import Link from "next/link";
import CpuLoadChart from "@/components/LoadChart";
import { Toaster } from "@/components/ui/toaster";
import { Shadows_Into_Light_Two } from "next/font/google";

const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
});

const Shadows2 = Shadows_Into_Light_Two({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-shadows2",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Pradhyuman",
  description: "Pradhyuman's public space",
};

const info = (
  <div className="flex items-center">
    <div className="p-4">
      <HoverCard>
        <HoverCardTrigger asChild>
          <DesktopIcon />
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between">
            <div className="space-y-1">
              <CpuLoadChart />
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  </div>
);

const header = (
  <header>
    <div className="text-right p-8 my-6 rounded-md ">
      <div className="hidden sm:block">
        <Link href="/">
          <h1 className="scroll-m-20 sm:text-4xl md:text-6xl lg:text-9xl font-bold mt-4">
            Pradhyuman
          </h1>
        </Link>
      </div>

      <div className="justify-items-end py-5">
        <NavMenu />
      </div>
    </div>
  </header>
);

const footer = (
  <footer>
    <div className="border-t border-slate-400 mt-12 py-6 text-center text-slate-400">
      <h3 className="justify-self-end">- by Pradhyuman</h3>
    </div>
  </footer>
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inconsolata.className} ${Shadows2.className}`}>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="top-2 right-2 absolute">{info}</div>
          <div className="mx-auto  max-w-7xl px-6">
            {header}
            <main>
              {children}
              <Toaster />
            </main>
            {footer}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
