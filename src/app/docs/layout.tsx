import type { ReactNode } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';

import { docs } from '@/utils/docs';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={docs.pageTree}
      themeSwitch={{ enabled: false }}
      nav={{ transparentMode: 'none', title: 'Bunpeg' }}
      githubUrl="https://github.com/bunpeg/bunpeg"
    >
      {children}
    </DocsLayout>
  );
}
