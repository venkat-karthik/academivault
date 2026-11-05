import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, LogOut, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab, onOpenAuth }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#fffdf6]/90 backdrop-blur-md border-b border-[#ffe9a9] transition-all duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => onSelectTab('marketplace')}
          className="flex items-center gap-2.5 text-left group shrink-0 transition-transform active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff933e] to-[#ffcb56] text-white flex items-center justify-center font-bold text-sm shadow-xs border border-[#ff933e]/60 group-hover:rotate-3 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#1e1915] whitespace-nowrap">
            AcademiaVault
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#645548]">
          <button
            onClick={() => onSelectTab('marketplace')}
            className={`hover:text-[#ea6510] transition-all whitespace-nowrap shrink-0 pb-1 ${
              currentTab === 'marketplace'
                ? 'text-[#ea6510] font-bold border-b-2 border-[#ea6510]'
                : ''
            }`}
          >
            Study Notes
          </button>
          <button
            onClick={() => onSelectTab('colleges')}
            className={`hover:text-[#ea6510] transition-all whitespace-nowrap shrink-0 pb-1 ${
              currentTab === 'colleges'
                ? 'text-[#ea6510] font-bold border-b-2 border-[#ea6510]'
                : ''
            }`}
          >
            Institutions
          </button>
          <button
            onClick={() => onSelectTab('drm-info')}
            className={`hover:text-[#ea6510] transition-all whitespace-nowrap shrink-0 pb-1 ${
              currentTab === 'drm-info'
                ? 'text-[#ea6510] font-bold border-b-2 border-[#ea6510]'
                : ''
            }`}
          >
            DRM & Rights
          </button>
          <button
            onClick={() => onSelectTab('professor-portal')}
            className={`hover:text-[#ea6510] transition-all whitespace-nowrap shrink-0 pb-1 ${
              currentTab === 'professor-portal'
                ? 'text-[#ea6510] font-bold border-b-2 border-[#ea6510]'
                : ''
            }`}
          >
            Faculty Review
          </button>
          {user && (
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`hover:text-[#ea6510] transition-all whitespace-nowrap shrink-0 pb-1 ${
                currentTab === 'dashboard'
                  ? 'text-[#ea6510] font-bold border-b-2 border-[#ea6510]'
                  : ''
              }`}
            >
              Workspace
            </button>
          )}
        </nav>

        {/* Zone 3: Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('dashboard')}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#1e1915] bg-[#ffe9a9] hover:bg-[#ffcb56]/60 border border-[#ffcb56] rounded-xl transition-all shadow-2xs whitespace-nowrap"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#ea6510]" />
                <span>{user.name.split(' ')[0]}</span>
                <span className="text-[#645548] text-[11px] capitalize">({user.role})</span>
              </button>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-[#645548] hover:text-[#ea6510] hover:bg-[#ffe9a9]/60 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-bold text-white bg-[#ea6510] hover:bg-[#d45707] rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap shadow-xs"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
