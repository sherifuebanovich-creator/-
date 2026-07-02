import type { Metadata, Viewport } from 'next';
import { Inter, Syne, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/ui/Providers';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ROVX — AI Navigation',
  description: 'Next-generation AI-powered navigation for drivers, truckers, and travelers',
  keywords: ['navigation', 'GPS', 'AI', 'maps', 'route', 'traffic'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ROVX',
  },
  icons: {
    icon: [{ url: '/logo.png', sizes: '192x192' }, { url: '/logo.png', sizes: '512x512' }],
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0e1a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              var dark = localStorage.getItem('darkMode');
              if (dark === 'false') document.documentElement.classList.remove('dark');
              else document.documentElement.classList.add('dark');
            } catch(e) {}
          `,
        }} />
      </head>
      <body className={`${inter.variable} ${syne.variable} ${jetbrains.variable} font-sans antialiased`} style={{ backgroundColor: 'rgb(var(--dark-bg))', color: 'rgb(var(--dark-text))' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
