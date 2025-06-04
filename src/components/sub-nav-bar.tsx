'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from '@/ui';

interface Props {
  children: any;
}

export function SubNavBar(props: Props) {
  return (
    <NavigationMenu className="bg-white p-2 w-full border border-neutral-200 rounded-lg">
      <NavigationMenuList>
        {props.children}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

interface NavLinkProps {
  to: string;
  label: string;
}

export function NavLink(props: NavLinkProps) {
  const pathname = usePathname();

  return (
    <NavigationMenuItem>
      <Link href={props.to} legacyBehavior passHref>
        <NavigationMenuLink data-active={pathname === props.to} className={navigationMenuTriggerStyle()}>
          {props.label}
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  );

}
