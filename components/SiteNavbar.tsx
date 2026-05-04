'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const navBase = 'rounded-full px-3 py-2 text-sm font-semibold transition-colors';
const activeClass = 'text-[var(--primary)] bg-[var(--primary-bg)]';
const inactiveClass = 'text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-bg)]';

export default function SiteNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const linkClass = (path: string) => `${navBase} ${pathname === path ? activeClass : inactiveClass}`;

  useEffect(() => {
    setIsOpen(false);

    if (typeof window === 'undefined') return;
    const savedCart = localStorage.getItem('delivery_cart');
    if (!savedCart) {
      setCartCount(0);
      return;
    }

    try {
      const parsed = JSON.parse(savedCart);
      setCartCount(parsed && typeof parsed === 'object' ? Object.keys(parsed).length : 0);
    } catch {
      setCartCount(0);
    }
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 backdrop-blur">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-5 md:px-8 lg:px-12">
        <div className="flex min-h-[68px] items-center justify-between gap-3 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image src="/logo.jpg" alt="Rocket07 Logo" width={44} height={44} className="shrink-0 rounded-md" />
            <span className="text-lg font-extrabold text-[var(--text-primary)] sm:text-2xl">Rocket07</span>
          </Link>

          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            <Link href="/" className={linkClass('/')}>Home</Link>
            <Link href="/cart" className={`${linkClass('/cart')} inline-flex items-center gap-2`}>
              Cart
              {cartCount > 0 && (
                <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold text-white">{cartCount}</span>
              )}
            </Link>
            <Link href="/profile" className={linkClass('/profile')}>Profile</Link>
            {user ? (
              <div className="flex min-w-0 items-center gap-3">
                <span className="max-w-32 truncate text-sm text-[var(--text-muted)]">Hi, {user.name}</span>
                <button
                  onClick={logout}
                  className="rounded-md bg-red-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/auth" className="rounded-md bg-[var(--primary)] px-4 py-2 text-white transition-colors hover:bg-[var(--primary-dark)]">
                Login
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] p-2 text-[var(--text-muted)] hover:bg-[var(--background)] hover:text-[var(--primary)] md:hidden"
            aria-expanded={isOpen}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <div className={`${isOpen ? 'block' : 'hidden'} border-t border-[var(--border)] py-3 md:hidden`}>
          <div className="space-y-2">
            <Link href="/" onClick={() => setIsOpen(false)} className={`block ${navBase} ${pathname === '/' ? activeClass : inactiveClass}`}>
              Home
            </Link>
            <Link href="/cart" onClick={() => setIsOpen(false)} className={`flex items-center justify-between ${navBase} ${pathname === '/cart' ? activeClass : inactiveClass}`}>
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold text-white">{cartCount}</span>
              )}
            </Link>
            <Link href="/profile" onClick={() => setIsOpen(false)} className={`block ${navBase} ${pathname === '/profile' ? activeClass : inactiveClass}`}>
              Profile
            </Link>
            <div className="pt-2">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full rounded-md bg-red-500 px-3 py-2 text-left text-sm text-white transition-colors hover:bg-red-600"
                >
                  Logout
                </button>
              ) : (
                <Link href="/auth" onClick={() => setIsOpen(false)} className="block rounded-md bg-[var(--primary)] px-3 py-2 text-center text-sm text-white transition-colors hover:bg-[var(--primary-dark)]">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
