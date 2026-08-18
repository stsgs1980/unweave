import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

/**
 * Корневой layout для всего приложения.
 * @param props - свойства компонента
 * @param props.children - дочерние элементы
 * @returns корневая разметка HTML
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}

/**
 * Метаданные приложения.
 */
export const metadata: Metadata = {
  title: "Unweave",
  description: "Extract UI components from any website",
};
