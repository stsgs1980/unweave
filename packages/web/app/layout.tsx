import type { Metadata } from 'next';

/**
 * Корневой layout для всего приложения.
 * @param props - свойства компонента
 * @param props.children - дочерние элементы
 * @returns корневая разметка HTML
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

/**
 * Метаданные приложения.
 */
export const metadata: Metadata = {
  title: 'Unweave',
  description: 'Extract UI components from any website',
};
