import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';

import { Button } from '@/ui';
import FilesList from '@/app/playground/files-list';
import TasksList from '@/app/playground/tasks-list';
import DefaultThemeToggle from '@/components/default-theme-toggle';

export default async function Home() {
  return (
    <section className="w-screen h-screen flex flex-col pt-10 px-4">
      <DefaultThemeToggle />
      <div>
        <Link href="/">
          <Button variant="link" className="group">
            <ArrowLeftIcon className="size-4 mr-2 group-hover:-translate-x-0.5 transition ease-linear" />
            Go Back
          </Button>
        </Link>
      </div>
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
