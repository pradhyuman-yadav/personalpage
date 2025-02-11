"use client"
import { Inconsolata } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { DesktopIcon } from "@radix-ui/react-icons";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Link from "next/link";
import CpuLoadChart from "@/components/LoadChart";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/NavMenu";
import { Toaster } from "@/components/ui/toaster";

const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
});

const info = (
  <div className="flex items-center">
    <div className="">
      <Button variant="link" className="p-4">
        <Link href="/">
          <div>
            <div className="">Pradhyuman</div>
          </div>
        </Link>
      </Button>
    </div>
    <div className="p-4">
      <ModeToggle />
    </div>
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inconsolata.variable}>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className=" top-2 right-4 absolute z-50">{info}</div>
          <div className="">
            <main>
              {children}
              <Toaster />
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
