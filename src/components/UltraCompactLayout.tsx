import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Shield, X, Home, ClipboardList } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const UltraCompactLayout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, email } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user initials for avatar
  const getUserInitials = (email: string) => {
    return email.substring(0, 1).toUpperCase();
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/sessions', label: 'Sessions', icon: ClipboardList },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className='flex flex-col h-full bg-gray-50'>
      {/* Ultra Compact Floating Header */}
      <header className='absolute top-0 left-0 right-0 z-40 safe-top'>
        <div className='px-4 py-3'>
          <div className='bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-200/50 px-3 py-2 flex items-center justify-between'>
            {/* Left - Logo */}
            <div className='flex items-center gap-2'>
              <div className='w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center'>
                <Shield className='w-4 h-4 text-white' />
              </div>
              <span className='text-sm font-semibold text-gray-900 hidden sm:block'>
                SR
              </span>
            </div>

            {/* Center - Current Page */}
            <div className='flex-1 text-center'>
              <p className='text-sm font-medium text-gray-700'>
                {navItems.find(item => item.path === location.pathname)?.label || 'Social Recovery'}
              </p>
            </div>

            {/* Right - Menu/Avatar */}
            <div className='relative' ref={menuRef}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className='w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors'
              >
                {isMobileMenuOpen ? (
                  <X className='w-4 h-4 text-gray-700' />
                ) : (
                  <span className='text-xs font-semibold text-gray-700'>
                    {email ? getUserInitials(email) : 'M'}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isMobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden'
                  >
                    {/* User info */}
                    <div className='px-3 py-2 bg-gray-50 border-b border-gray-200'>
                      <p className='text-xs font-medium text-gray-600'>Signed in as</p>
                      <p className='text-xs text-gray-900 truncate font-semibold'>{email}</p>
                    </div>

                    {/* Navigation */}
                    <div className='py-1'>
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        
                        return (
                          <button
                            key={item.path}
                            onClick={() => {
                              navigate(item.path);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm flex items-center gap-3 transition-colors ${
                              isActive 
                                ? 'bg-primary-50 text-primary-700' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Icon className='w-4 h-4' />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className='border-t border-gray-200 py-1'>
                      <button
                        onClick={handleLogout}
                        className='w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3'
                      >
                        <LogOut className='w-4 h-4' />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with padding for floating header */}
      <main className='flex-1 overflow-y-auto px-4 py-6 pt-20'>{children}</main>

      {/* Floating Bottom Navigation */}
      <nav className='absolute bottom-0 left-0 right-0 z-40 safe-bottom'>
        <div className='px-4 pb-4'>
          <div className='bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50'>
            <div className='flex justify-around py-2'>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-all ${
                      isActive 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className='w-5 h-5' />
                    <span className='text-[10px] mt-0.5 font-medium'>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};