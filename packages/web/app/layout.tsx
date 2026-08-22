import type { Metadata } from "next";
import React from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import CommandPalette from "@/components/CommandPalette";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/providers"; // <-- Added import
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Unweave",
  description: "Extract UI components from any website",
};

/**
 * Root layout for the entire application.
 * @param props - component props
 * @param props.children - child elements
 * @returns root HTML markup
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>
            <Navbar />
            <main className="flex-1">{children}</main>
            <CommandPalette />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
