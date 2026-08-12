import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import CyberBackground from '@/components/animations/CyberBackground';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'NextGen SOC | Security Operations Centre Analyst Bootcamp',
  description:
    'Join the NextGen Security Operations Centre Analyst Bootcamp — a two-day hands-on cybersecurity experience focused on SOC operations, threat detection, investigation, and incident response.',
  openGraph: {
    title: 'NextGen SOC | Security Operations Centre Analyst Bootcamp',
    description:
      'Detect. Defend. Respond. Hands-on 2-day SIEM, EDR, and Ransomware War Room Cybersecurity Bootcamp.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen bg-cyber-bg text-cyber-text antialiased font-sans`}>
        <Providers>
          <CyberBackground />
          <div className="relative z-10 flex min-h-screen flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
