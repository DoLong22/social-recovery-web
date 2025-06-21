import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, email } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: (
        <svg
          className='w-6 h-6'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
          />
        </svg>
      ),
    },
    {
      path: '/sessions',
      label: 'Sessions',
      icon: (
        <svg
          className='w-6 h-6'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
          />
        </svg>
      ),
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: (
        <svg
          className='w-5 h-5'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
          />
        </svg>
      ),
    },
  ];

  return (
    <div className='flex flex-col h-full bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm safe-top flex-shrink-0'>
        <div className='px-4 py-4 flex items-center justify-between'>
          <h1 className='text-xl font-semibold text-gray-900'>
            Social Recovery
          </h1>
          <button
            onClick={handleLogout}
            className='p-2 text-gray-600 hover:text-gray-900 transition-colors'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
              />
            </svg>
          </button>
        </div>
        {email && (
          <div className='px-4 pb-3'>
            <p className='text-sm text-gray-600'>{email}</p>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className='flex-1 overflow-y-auto px-4 py-6'>{children}</main>

      {/* Bottom Navigation */}
      <nav className='bg-white border-t border-gray-200 safe-bottom flex-shrink-0'>
        <div className='flex justify-around'>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-3 px-6 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                {item.icon}
                <span className='text-xs mt-1'>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
