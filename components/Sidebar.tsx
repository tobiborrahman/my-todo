'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from './Button';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-64 bg-[#0D224A] h-screen flex flex-col fixed left-0 top-0 pt-16">
      <div className="p-6 border-b border-[#2C388E] flex-shrink-0">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-blue-300 flex items-center justify-center mb-3 overflow-hidden">
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.first_name}
                className="w-full h-full rounded-full object-cover border-[1px] border-white"
              />
            ) : (
              <span className="text-2xl font-bold text-[#1A237E]">
                {user?.first_name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <h3 className="text-white font-medium text-center mb-1">
            {user ? `${user.first_name} ${user.last_name}` : 'User'}
          </h3>
          <p className="text-gray-300 text-sm text-center">
            {user?.email || 'user@example.com'}
          </p>
        </div>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <Link
          href="/todos"
          className={`
            flex items-center space-x-3 py-3 px-6 transition-colors
            ${isActive('/todos')
              ? 'bg-gradient-to-r from-[#1D3474] to-[#D9D9D900] text-white'
              : 'text-gray-300 hover:bg-[#2C388E]/50 hover:text-white'
            }
          `}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">Todos</span>
        </Link>

        <Link
          href="/profile"
          className={`
            flex items-center space-x-3 px-6 py-3 transition-colors
            ${isActive('/profile')
              ? 'bg-gradient-to-r from-[#1D3474] to-[#D9D9D900] text-white'
              : 'text-white'
            }
          `}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="font-medium">Account Information</span>
        </Link>
      </div>

      <div className="p-4 border-t border-[#2C388E] flex-shrink-0 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-6 py-3 mx-2 w-[calc(100%-1rem)] rounded-lg text-gray-300 hover:bg-[#2C388E]/50 hover:text-white transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

