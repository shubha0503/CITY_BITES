'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
export function Providers({ children }: { children: React.ReactNode }) { const [client] = useState(() => new QueryClient()); return <ThemeProvider attribute="class" defaultTheme="light"><QueryClientProvider client={client}>{children}<Toaster position="top-right"/></QueryClientProvider></ThemeProvider>; }
