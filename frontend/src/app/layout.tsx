import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'AgencyFlow | B2B Project & Client Management Portal',
  description: 'Full-stack software agency management portal powered by Django REST Framework & Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 lg:p-10 max-w-7xl">
          {children}
        </main>
      </body>
    </html>
  );
}
