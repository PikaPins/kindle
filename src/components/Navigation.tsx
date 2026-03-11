'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/library', label: 'Books', icon: '📚' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:fixed md:bottom-0 md:left-0 md:right-0 h-16 border-t flex items-center justify-around safe-area-bottom"
         style={{ backgroundColor: 'var(--kindle-bg)', borderColor: 'var(--kindle-gray)' }}>
      <div className="max-w-4xl mx-auto w-full flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/' && pathname === '/kindle/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive ? 'text-gray-800' : 'text-gray-400'
              }`}
              style={{ 
                color: isActive ? 'var(--kindle-text)' : 'var(--kindle-gray)',
                opacity: isActive ? 1 : 0.5 
              }}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
