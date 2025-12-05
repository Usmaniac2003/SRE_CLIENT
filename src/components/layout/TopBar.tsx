'use client';

import { useUIStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../lib/hooks/useTheme';

export function TopBar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const { mode, toggleTheme } = useTheme();

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[#D9E6DF] bg-[#FFFFFF] shadow-sm">
      {/* LEFT: Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="text-[#1B9C6F] font-bold text-xl hover:opacity-75"
      >
        ☰
      </button>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="text-[#4A5A52] hover:text-[#1B9C6F]"
        >
          {mode === 'light' ? '🌙' : '🌞'}
        </button>

        {/* User info */}
        {user && (
          <div className="text-sm text-[#4A5A52]">
            {user.username} ({user.position})
          </div>
        )}
      </div>
    </header>
  );
}
