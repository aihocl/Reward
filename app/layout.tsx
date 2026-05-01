import type {Metadata} from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'HMPL Rewards',
  description: 'Retail chain performance platform',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased text-tx bg-bg-prime transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
