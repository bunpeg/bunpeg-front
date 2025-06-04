import { redirect } from 'next/navigation';

import { getServerAuthSession } from '@/server/auth';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect('/');
  }

  if (!session.user.isSetup) {
    redirect('/onboarding');
  }

  return (
    <>
      {children}
    </>
  );
}
