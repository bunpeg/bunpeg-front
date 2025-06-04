import { type Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';

import { Toaster } from '@/ui';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Meal tracker',
  description: 'A simple meal tracker application',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

const font = JetBrains_Mono({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={font.className}>
        {children}
        <Toaster />
        {/*{process.env.NODE_ENV === 'development' && <ScreenSize />}*/}
      </body>
    </html>
  );
}
