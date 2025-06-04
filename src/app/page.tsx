import { redirect } from 'next/navigation';

import SignInForm from '@/app/sign-in-form';
import { getServerAuthSession } from '@/server/auth';

export default async function Home() {
  const session = await getServerAuthSession();

  if (session?.user) {
    redirect('/intake');
  }

  return (
    <section className="w-screen h-screen flex flex-col justify-center items-center px-4 md:px-0">
      <div className="mx-auto flex flex-col md:w-[480px] gap-10">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl md:text-3xl font-bold">Welcome to Meal Tracker</h1>
          <p className="text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <SignInForm/>
      </div>
    </section>
  )
}
