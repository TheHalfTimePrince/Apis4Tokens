import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { UserProvider } from '@/lib/auth';
import { getUser } from '@/lib/db/queries';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'AI Push | Developer-Friendly API Solutions',
  description: 'Powerful, scalable API endpoints for developers. Pay with tokens per use. Simplify your workflow with our QR code generation and more.',
  icons: {
    icon: './favicon.png',
    shortcut: './favicon.png',
    apple: './favicon.png',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://AI Push.com',
    siteName: 'AI Push',
    title: 'AI Push | Developer-Friendly API Solutions',
    description: 'Powerful, scalable API endpoints for developers. Pay with tokens per use. Simplify your workflow with our QR code generation and more.',
    images: [
      {
        url: './favicon.png',
        width: 1200,
        height: 630,
        alt: 'AI Push',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Push | Developer-Friendly API Solutions',
    description: 'Powerful, scalable API endpoints for developers. Pay with tokens per use. Simplify your workflow with our QR code generation and more.',
    images: ['./favicon.png'],
    creator: '@AI Push',
  },
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userPromise = getUser();

  return (
    <html
      lang="en"
      className={`bg-background dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-background">
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
        <UserProvider userPromise={userPromise}>{children}</UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
