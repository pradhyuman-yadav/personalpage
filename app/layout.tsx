import type { Metadata } from "next";
import Link from "next/link";
import { Inconsolata } from 'next/font/google';
import "./globals.css";
import NavMenu from "@/components/NavMenu"; // Adjust the path as necessary
import { ThemeProvider } from "@/components/theme-provider"




const inconsolata = Inconsolata({
  subsets: ['latin'],
  variable: '--font-inconsolata',
});


export const metadata: Metadata = {
  title: "Pradhyuman",
  description: "Pradhyuman's public space",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const header = (
    <header>
      <div className="text-right bg-slate-800 p-8 my-6 rounded-md">
        <Link href="/">
          <h1 className="text-9xl text-white font-bold mt-4">Pradhyuman</h1>
        </Link>
        <NavMenu/>
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
          <div className="mx-auto  max-w-7xl px-6">
            {header}
            {children}
            {footer}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
