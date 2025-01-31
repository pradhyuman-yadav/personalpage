import type { Metadata } from "next";
import { Inconsolata } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { DesktopIcon, HomeIcon } from "@radix-ui/react-icons";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Link from "next/link";
import CpuLoadChart from "@/components/LoadChart";
import { Button } from "@/components/ui/button";

const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
});

export const metadata: Metadata = {
  title: "Pradhyuman",
  description: "Pradhyuman's public space",
};

const info = (
  <div className="flex self-center">
    <Button variant="link">
      <Link href="/">
        <div className="flex self-center">
          <div className="p-2">Pradhyuman</div>
          <div><HomeIcon /></div>
        </div>
      </Link>
    </Button>
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
          <div className="border top-2 right-2 absolute z-50">{info}</div>
          <div className="">
            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
