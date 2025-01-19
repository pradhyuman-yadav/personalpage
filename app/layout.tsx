import type { Metadata } from "next";
import Link from "next/link";
import { Inconsolata } from 'next/font/google';
import "./globals.css";



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
        <div className="mx-auto  max-w-7xl px-6">
          {header}
          {children}
          {footer}
        </div>
      </body>
    </html>
  );
}
