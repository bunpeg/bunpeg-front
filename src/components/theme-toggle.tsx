'use client';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from 'lucide-react';

import { Button } from '@/ui';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDarkTheme = theme === 'dark';

  const switchTheme = () => {
    setTheme(isDarkTheme ? 'light' : 'dark');
  }

  return (
    <Button size="sm" variant="ghost" className="absolute top-2 right-4" onClick={switchTheme}>
      {theme === 'dark' && <MoonIcon className="size-5" />}
      {theme === 'light' && <SunIcon className="size-5" />}
    </Button>
  );
}
