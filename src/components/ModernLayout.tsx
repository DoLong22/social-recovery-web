import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Shield, ChevronDown, Home, ClipboardList } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const ModernLayout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, email } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user initials for avatar
  const getUserInitials = (email: string) => {
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: Home,
    },
    {
      path: '/sessions',
      label: 'Sessions',
      icon: ClipboardList,
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <div className='flex flex-col h-full bg-gray-50'>
      {/* Modern Compact Header */}
      <header className='bg-white border-b border-gray-200 safe-top flex-shrink-0'>
        <div className='px-4 h-14 flex items-center justify-between'>
          {/* Left side - Logo and brand */}
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center'>
              <Shield className='w-5 h-5 text-white' />
            </div>
            <h1 className='text-lg font-semibold text-gray-900 hidden sm:block'>
              Social Recovery
            </h1>
          </div>

          {/* Right side - User menu */}
          <div className='relative' ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className='flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors'
            >
              <div className='w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium'>
                {email ? getUserInitials(email) : 'U'}
              </div>
              <div className='hidden sm:block text-left'>
                <p className='text-sm font-medium text-gray-900 truncate max-w-[150px]'>
                  {email?.split('@')[0]}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className='absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50'
                >
                  <div className='px-4 py-3 border-b border-gray-100'>
                    <p className='text-sm font-medium text-gray-900'>Signed in as</p>
                    <p className='text-sm text-gray-600 truncate'>{email}</p>
                  </div>
                  
                  <div className='py-1'>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/profile');
                      }}
                      className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3'
                    >
                      <User className='w-4 h-4' />
                      Profile Settings
                    </button>
                    
                    <div className='border-t border-gray-100 mt-1 pt-1'>
                      <button
                        onClick={handleLogout}
                        className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3'
                      >
                        <LogOut className='w-4 h-4' />
                        Sign out
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto ${location.pathname === '/setup' ? '' : 'sm:px-4 sm:py-6'}`}>{children}</main>

      {/* Modern Bottom Navigation */}
      <nav className='bg-white border-t border-gray-200 safe-bottom flex-shrink-0'>
        <div className='flex justify-around h-16'>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center px-6 transition-colors relative ${
                  isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className='absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary-600'
                  />
                )}
                
                <Icon className='w-5 h-5' />
                <span className='text-xs mt-1 font-medium'>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};