import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, LogOut, User as UserIcon, Menu, X } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab, onOpenAuth }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE4DC] transition-all">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">
        {/* Brand Wordmark & Icon */}
        <button
          onClick={() => handleTabChange('marketplace')}
          className="flex items-center gap-2.5 text-left group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C06A28] rounded-lg cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#C06A28] text-white flex items-center justify-center font-bold text-sm shadow-xs transition-transform group-hover:scale-105">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#1C1917] whitespace-nowrap font-sans">
            AcademiaVault
          </span>
        </button>

        {/* Center Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 h-full text-[13px] font-medium text-[#78716C]">
          <button
            onClick={() => handleTabChange('marketplace')}
            className={`h-full flex items-center transition-colors relative cursor-pointer ${
              currentTab === 'marketplace'
                ? 'text-[#1C1917] font-semibold'
                : 'hover:text-[#1C1917]'
            }`}
          >
            <span>Study Notes</span>
            {currentTab === 'marketplace' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C06A28] rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('colleges')}
            className={`h-full flex items-center transition-colors relative cursor-pointer ${
              currentTab === 'colleges'
                ? 'text-[#1C1917] font-semibold'
                : 'hover:text-[#1C1917]'
            }`}
          >
            <span>Institutions</span>
            {currentTab === 'colleges' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C06A28] rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('drm-info')}
            className={`h-full flex items-center transition-colors relative cursor-pointer ${
              currentTab === 'drm-info'
                ? 'text-[#1C1917] font-semibold'
                : 'hover:text-[#1C1917]'
            }`}
          >
            <span>DRM & Rights</span>
            {currentTab === 'drm-info' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C06A28] rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('professor-portal')}
            className={`h-full flex items-center transition-colors relative cursor-pointer ${
              currentTab === 'professor-portal'
                ? 'text-[#1C1917] font-semibold'
                : 'hover:text-[#1C1917]'
            }`}
          >
            <span>Faculty Review</span>
            {currentTab === 'professor-portal' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C06A28] rounded-full" />
            )}
          </button>

          {user && (
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`h-full flex items-center transition-colors relative cursor-pointer ${
                currentTab === 'dashboard' || currentTab === 'admin'
                  ? 'text-[#1C1917] font-semibold'
                  : 'hover:text-[#1C1917]'
              }`}
            >
              <span>Workspace</span>
              {(currentTab === 'dashboard' || currentTab === 'admin') && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C06A28] rounded-full" />
              )}
            </button>
          )}
        </nav>

        {/* Right Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTabChange('dashboard')}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#1C1917] bg-white hover:bg-[#FAF8F5] border border-[#E8E2D9] rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#C06A28]" />
                <span>{user.name.split(' ')[0]}</span>
                <span className="text-[#A8A29E] text-[11px] capitalize hidden sm:inline">({user.role})</span>
              </button>
              <button
                onClick={logout}
                title="Sign Out"
                aria-label="Sign Out"
                className="p-2 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F0E8] rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="bg-[#1C1917] text-white hover:bg-black rounded-lg px-4 py-2 text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-[#FAFAFA] px-5 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => handleTabChange('marketplace')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
              currentTab === 'marketplace' ? 'bg-[#FEF3C7] text-[#D97706]' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Study Notes
          </button>
          <button
            onClick={() => handleTabChange('colleges')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
              currentTab === 'colleges' ? 'bg-[#FEF3C7] text-[#D97706]' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Institutions
          </button>
          <button
            onClick={() => handleTabChange('drm-info')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
              currentTab === 'drm-info' ? 'bg-[#FEF3C7] text-[#D97706]' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            DRM & Rights
          </button>
          <button
            onClick={() => handleTabChange('professor-portal')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
              currentTab === 'professor-portal' ? 'bg-[#FEF3C7] text-[#D97706]' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Faculty Review
          </button>
          {user && (
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                currentTab === 'dashboard' ? 'bg-[#FEF3C7] text-[#D97706]' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              My Workspace ({user.role})
            </button>
          )}
        </div>
      )}
    </header>
  );
};
