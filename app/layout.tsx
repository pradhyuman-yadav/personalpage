import type { Metadata } from "next";
import { Inconsolata } from 'next/font/google';
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"

const inconsolata = Inconsolata({
  subsets: ['latin'],
  variable: '--font-inconsolata',
});

export const metadata: Metadata = {
  title: "Pradhyuman",
  description: "Pradhyuman's public space",
};


export default function RootLayout({children,}: {children: React.ReactNode;}) {
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
          {children}
        </ThemeProvider>
      </body>
    </html>
    </>
  )
}
