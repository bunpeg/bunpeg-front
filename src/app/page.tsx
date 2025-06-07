// import { redirect } from 'next/navigation';

// import { getServerAuthSession } from '@/server/auth';
import FilesList from '@/app/files-list';
import TasksList from '@/app/tasks-list';

export default async function Home() {
  // const session = await getServerAuthSession();
  //
  // if (session?.user) {
  //   redirect('/intake');
  // }

  return (
    <section className="w-screen h-screen flex flex-col pt-10 px-4">
      <div className="mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold  text-center">Files</h1>
          <FilesList />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold  text-center">Tasks</h1>
          <TasksList />
        </div>
      </div>
    </section>
  )
}
