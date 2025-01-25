import type { Metadata } from "next";
import { Inconsolata } from "next/font/google";
import "./globals.css";
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

const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
});

export const metadata: Metadata = {
  title: "Pradhyuman",
  description: "Pradhyuman's public space",
};

const info = (
  <>
    <HoverCard>
      <HoverCardTrigger asChild>
        <DesktopIcon />
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <div className="space-y-1">
            <CpuLoadChart />
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  </>
);
const header = (
  <header>
    <div className="text-right p-8 my-6 rounded-md">
      <Link href="/">
        <h1 className="text-9xl font-bold mt-4">Pradhyuman</h1>
      </Link>
      <div className="justify-items-end py-5">
        <NavMenu />
      </div>
    </div>
  </header>
);

const footer = (
  <footer>
    <div className="border-t border-slate-400 mt-12 py-6 text-center text-slate-400">
      <h3>Designed by Pradhyuman and LLM</h3>
    </div>
  </footer>
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <html lang="en" className={inconsolata.variable}>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="border top-2 right-2 absolute">{info}</div>
            <div className="mx-auto  max-w-7xl px-6">
              {header}
              {children}
              {footer}
            </div>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
