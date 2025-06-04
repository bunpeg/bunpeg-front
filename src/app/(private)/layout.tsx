import { redirect } from 'next/navigation';

import { getServerAuthSession } from '@/server/auth';
import ClientProviders from '@/components/client-providers';
import { AppLayout } from '@/components/app-layout';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect('/');
  }

  return (
    <ClientProviders session={session}>
      <AppLayout session={session}>
        {children}
      </AppLayout>
    </ClientProviders>
  );
}
