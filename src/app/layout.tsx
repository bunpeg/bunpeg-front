import { type Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';

import { Toaster } from '@/ui';
import ClientProviders from '@/components/client-providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Bunpeg Dashboard',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

const font = JetBrains_Mono({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${font.className} text-primary selection:text-primary selection:bg-blue-100`}>
        <ClientProviders session={null}>
          {children}
          <Toaster />
          {/*{process.env.NODE_ENV === 'development' && <ScreenSize />}*/}
        </ClientProviders>
      </body>
    </html>
  );
}
