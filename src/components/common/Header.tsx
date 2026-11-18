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
    <header className="sticky top-0 z-40 bg-[#fffdf6]/95 backdrop-blur-md border-b border-[#ffe9a9] transition-all duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => handleTabChange('marketplace')}
          className="flex items-center gap-2.5 text-left group shrink-0 transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#ea6510] focus-visible:ring-offset-2 rounded-xl p-1 -m-1"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff933e] to-[#ffcb56] text-white flex items-center justify-center font-bold text-sm shadow-xs border border-[#ff933e]/60 group-hover:rotate-3 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#1e1915] whitespace-nowrap">
            AcademiaVault
          </span>
        </button>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#645548]">
          <button
            onClick={() => handleTabChange('marketplace')}
            className={`hover:text-[#ea6510] transition-all whitespace-nowrap shrink-0 pb-1 focus-visible:ring-2 focus-visible:ring-[#ea6510] rounded px-1 ${
              currentTab === 'marketplace'
                ? 'text-[#ea6510] font-bold border-b-2 border-[#ea6510]'
                : ''
            }`}
          >
            Study Notes
          </button>
          <button
            onClick={() => handleTabChange('colleges')}
            className={`hover:text-[#ea6510] transition-all whitespace-nowrap shrink-0 pb-1 focus-visible:ring-2 focus-visible:ring-[#ea6510] rounded px-1 ${
              currentTab === 'colleges'
                ? 'text-[#ea6510] font-bold border-b-2 border-[#ea6510]'
                : ''
            }`}
          >
            Institutions
          </button>
          <button
            onClick={() => handleTabChange('drm-info')}
            className={`hover:text-[#ea6510] transition-all whitespace-nowrap shrink-0 pb-1 focus-visible:ring-2 focus-visible:ring-[#ea6510] rounded px-1 ${
              currentTab === 'drm-info'
                ? 'text-[#ea6510] font-bold border-b-2 border-[#ea6510]'
                : ''
            }`}
          >
            DRM & Rights
          </button>
          <button
            onClick={() => handleTabChange('professor-portal')}
            className={`hover:text-[#ea6510] transition-all whitespace-nowrap shrink-0 pb-1 focus-visible:ring-2 focus-visible:ring-[#ea6510] rounded px-1 ${
              currentTab === 'professor-portal'
                ? 'text-[#ea6510] font-bold border-b-2 border-[#ea6510]'
                : ''
            }`}
          >
            Faculty Review
          </button>
          {user && (
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`hover:text-[#ea6510] transition-all whitespace-nowrap shrink-0 pb-1 focus-visible:ring-2 focus-visible:ring-[#ea6510] rounded px-1 ${
                currentTab === 'dashboard'
                  ? 'text-[#ea6510] font-bold border-b-2 border-[#ea6510]'
                  : ''
              }`}
            >
              Workspace
            </button>
          )}
        </nav>

        {/* Zone 3: Desktop Actions & Mobile Menu Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTabChange('dashboard')}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#1e1915] bg-[#ffe9a9] hover:bg-[#ffcb56]/60 border border-[#ffcb56] rounded-xl transition-all shadow-2xs whitespace-nowrap min-h-[38px] focus-visible:ring-2 focus-visible:ring-[#ea6510]"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#ea6510]" />
                <span>{user.name.split(' ')[0]}</span>
                <span className="text-[#645548] text-[11px] capitalize hidden sm:inline">({user.role})</span>
              </button>
              <button
                onClick={logout}
                title="Sign Out"
                aria-label="Sign Out"
                className="p-2 text-[#645548] hover:text-[#ea6510] hover:bg-[#ffe9a9]/60 rounded-xl transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#ea6510]"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-bold text-white bg-[#ea6510] hover:bg-[#d45707] rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap shadow-xs min-h-[38px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#ea6510]"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            className="md:hidden p-2 text-[#1e1915] hover:bg-[#ffe9a9]/60 rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center border border-[#ffe9a9] focus-visible:ring-2 focus-visible:ring-[#ea6510]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#ffe9a9] bg-[#fffdf6] px-5 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-md">
          <button
            onClick={() => handleTabChange('marketplace')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              currentTab === 'marketplace'
                ? 'bg-[#ffe9a9] text-[#ea6510]'
                : 'text-[#645548] hover:bg-[#ffe9a9]/40'
            }`}
          >
            Study Notes Catalogue
          </button>
          <button
            onClick={() => handleTabChange('colleges')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              currentTab === 'colleges'
                ? 'bg-[#ffe9a9] text-[#ea6510]'
                : 'text-[#645548] hover:bg-[#ffe9a9]/40'
            }`}
          >
            Institutions & Universities
          </button>
          <button
            onClick={() => handleTabChange('drm-info')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              currentTab === 'drm-info'
                ? 'bg-[#ffe9a9] text-[#ea6510]'
                : 'text-[#645548] hover:bg-[#ffe9a9]/40'
            }`}
          >
            DRM & Copyright Protection
          </button>
          <button
            onClick={() => handleTabChange('professor-portal')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              currentTab === 'professor-portal'
                ? 'bg-[#ffe9a9] text-[#ea6510]'
                : 'text-[#645548] hover:bg-[#ffe9a9]/40'
            }`}
          >
            Faculty Peer Review
          </button>
          {user && (
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-[#ffe9a9] text-[#ea6510]'
                  : 'text-[#645548] hover:bg-[#ffe9a9]/40'
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
