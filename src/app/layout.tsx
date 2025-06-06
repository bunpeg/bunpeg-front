import { type Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';

import { Toaster } from '@/ui';
import '@/styles/globals.css';
import ClientProviders from '@/components/client-providers';
import { getServerAuthSession } from '@/server/auth';

export const metadata: Metadata = {
  title: 'Meal tracker',
  description: 'A simple meal tracker application',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

const font = JetBrains_Mono({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();
  return (
    <html lang="en">
      <body className={font.className}>
        <ClientProviders session={session}>
          {children}
          <Toaster />
          {/*{process.env.NODE_ENV === 'development' && <ScreenSize />}*/}
        </ClientProviders>
      </body>
    </html>
  );
}
