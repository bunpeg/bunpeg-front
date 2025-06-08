import Link from 'next/link';
import { FingerprintIcon, PencilIcon, ServerOffIcon, Settings2Icon, SparklesIcon } from 'lucide-react';

import { Button } from '@/ui';
import ThemeToggle from '@/components/theme-toggle';

export default async function Home() {
  return (
    <section className="py-12 md:py-20">
      <ThemeToggle />
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-2xl flex flex-col items-center text-center space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-6xl ">Bunpeg</h2>
          <p>
            Bunpeg is a service for performing FFmpeg operations via http.{' '}
            You can upload media files (video or audio), run FFmpeg commands on them, and download the results.
          </p>
          <div className="hidden md:flex items-center gap-2">
            <Link href="/docs">
              <Button variant="default">Read the docs</Button>
            </Link>
            <Link href="/playground">
              <Button variant="outline">Check the playground</Button>
            </Link>
          </div>
          <div className="flex md:hidden items-center gap-2">
            <Link href="/docs">
              <Button variant="default">Read the docs</Button>
            </Link>
          </div>
        </div>
        <div className="relative mx-auto grid gap-4 md:gap-1 max-w-4xl *:p-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3 border">
            <div className="flex items-center gap-2">
              <ServerOffIcon className="size-4" />
              <h3 className="text-sm font-medium">Serverless</h3>
            </div>
            <p className="text-sm">You can now use FFmpeg from any serverless environment.</p>
          </div>

          <div className="space-y-2 border relative">
            <div className="flex items-center gap-2">
              <Settings2Icon className="size-4" />
              <h3 className="text-sm font-medium">Control</h3>
            </div>
            <p className="text-sm">All operations run sequentially in a queue.</p>
          </div>

          <div className="space-y-2 border relative">
            <div className="flex items-center gap-2">
              <FingerprintIcon className="size-4" />
              <h3 className="text-sm font-medium">Security</h3>
            </div>
            <p className="text-sm">It supports an helping developers businesses.</p>
            <sub className="pl-10 absolute bottom-4 left-0">(placeholder)</sub>
          </div>

          <div className="space-y-2 border relative">
            <div className="flex items-center gap-2">
              <PencilIcon className="size-4" />
              <h3 className="text-sm font-medium">Customization</h3>
            </div>
            <p className="text-sm">It supports helping developers and businesses innovate.</p>
            <sub className="pl-10 absolute bottom-4 left-0">(placeholder)</sub>
          </div>

          <div className="space-y-2 border relative">
            <div className="flex items-center gap-2">
              <Settings2Icon className="size-4" />
              <h3 className="text-sm font-medium">Control</h3>
            </div>
            <p className="text-sm">It supports helping developers and businesses innovate.</p>
            <sub className="pl-10 absolute bottom-4 left-0">(placeholder)</sub>
          </div>

          <div className="space-y-2 border relative">
            <div className="flex items-center gap-2">
              <SparklesIcon className="size-4" />
              <h3 className="text-sm font-medium">Docs for AI</h3>
            </div>
            <p className="text-sm">You can download and feed our docs to our AI of choice.</p>
            <sub className="pl-10 absolute bottom-4 left-0">(placeholder)</sub>
          </div>
        </div>
      </div>
    </section>
  )
}
