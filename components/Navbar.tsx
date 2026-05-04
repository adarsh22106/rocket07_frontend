'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === path ? 'text-primary-600' : 'text-gray-600';

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <Image
              src="/logo.jpg"
              alt="Rocket07 Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="font-bold text-lg sm:text-xl text-gray-900">
              Rocket07
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`hover:text-primary-600 transition-colors ${isActive(
                '/'
              )}`}
            >
              New Order
            </Link>
            <Link
              href="/orders"
              className={`hover:text-primary-600 transition-colors ${isActive(
                '/orders'
              )}`}
            >
              Your Orders
            </Link>

            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  Hi, {user.name}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-colors"
            aria-expanded={isOpen}
          >
            <svg
              className={`w-6 h-6 transition-transform duration-300 ${
                isOpen ? 'rotate-90' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu (Animated) */}
        <div
          className={`md:hidden border-t border-gray-200 bg-white transform transition-all duration-300 ease-in-out origin-top
          ${
            isOpen
              ? 'opacity-100 scale-y-100 translate-y-0'
              : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
          }`}
        >
          <div
            className={`px-2 pt-2 pb-3 space-y-1 transition-all duration-300 delay-75
            ${
              isOpen
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-2'
            }`}
          >
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/') === 'text-primary-600'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
              } transition-colors`}
              onClick={() => setIsOpen(false)}
            >
              New Order
            </Link>

            <Link
              href="/orders"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/orders') === 'text-primary-600'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
              } transition-colors`}
              onClick={() => setIsOpen(false)}
            >
              Your Orders
            </Link>

            <div className="border-t border-gray-200 mt-2 pt-2">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm text-gray-600">
                    Hi, {user.name}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="block px-3 py-2 text-base font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors text-center"
                  onClick={() => setIsOpen(false)}
                >
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