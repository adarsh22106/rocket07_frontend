import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/SiteNavbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rocket07 Delivery Service',
  description: 'Online Delivery System for Stationary, Grocery & Fruits',
  icons: {
    icon: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen bg-[var(--background)]` }>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="mx-auto w-full max-w-[1280px] flex-1 overflow-y-auto px-4 py-5 sm:px-5 md:px-8 md:py-6 lg:px-12">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
