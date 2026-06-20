'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function DesktopNavbar() {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Anime List', href: '/anime-list' },
    { label: 'Komik', href: '/komik' },
    { label: 'Movies', href: '/movies' },
  ];

  return (
    <nav className="hidden md:flex items-center gap-8">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.label}
            href={link.href}
            className={`font-body-md text-decoration-none transition-colors duration-300 ${
              isActive
                ? 'text-primary font-bold border-b-2 border-primary pb-1'
                : 'text-on-surface-variant font-medium hover:text-primary'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNavbar() {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Home', href: '/', icon: 'home' },
    { label: 'Movies', href: '/movies', icon: 'movie' },
    { label: 'Komik', href: '/komik', icon: 'menu_book' },
    { label: 'Profile', href: '#', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-margin-mobile py-3 bg-surface-container/80 backdrop-blur-lg border-t border-white/5 shadow-lg md:hidden">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.label}
            href={link.href}
            className={`flex flex-col items-center gap-1 active:scale-95 transition-transform duration-200 text-decoration-none ${
              isActive
                ? 'text-primary font-bold'
                : 'text-on-surface-variant hover:text-secondary'
            }`}
          >
            <span 
              className="material-symbols-outlined" 
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}
            >
              {link.icon}
            </span>
            <span className="font-label-sm text-[10px]">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
