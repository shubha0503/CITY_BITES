import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const sans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const serif = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
export const metadata: Metadata = { title: 'CityBites | Local, beautifully close', description: 'Hyperlocal commerce for the cities that deserve more.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" suppressHydrationWarning><body className={`${sans.variable} ${serif.variable}`}><Providers>{children}</Providers></body></html>; }
