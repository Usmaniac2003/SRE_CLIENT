'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUIStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';
import { usePathname } from 'next/navigation';

// Icons
import {
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  Boxes,
  Users,
  BadgeCheck,
  TicketPercent,
  LogOut
} from 'lucide-react';

const menu = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Sales', path: '/dashboard/sales', icon: Receipt },
  { label: 'Rentals', path: '/dashboard/rentals', icon: ShoppingCart },
  { label: 'Inventory', path: '/dashboard/inventory', icon: Boxes },
  { label: 'Users', path: '/dashboard/users', icon: Users },
  { label: 'Employees', path: '/dashboard/employees', icon: BadgeCheck },
  { label: 'Coupons', path: '/dashboard/coupons', icon: TicketPercent },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const { logout } = useAuthStore();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <aside
      className="h-full border-r border-[#D9E6DF] bg-[#FFFFFF] shadow-sm flex flex-col"
      style={{ width: sidebarOpen ? 256 : 64 }}
    >
      {/* LOGO */}
      <div className="h-16 flex items-center justify-center text-xl font-bold text-[#1B9C6F]">
        {sidebarOpen ? 'POS System' : 'POS'}
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto">
        {menu.map((item) => {
          const active = pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${
                active
                  ? 'bg-[#E7F5EF] text-[#1B9C6F] font-semibold'
                  : 'text-[#4A5A52] hover:bg-[#F0F5F2]'
              }`}
            >
              <Icon size={20} />

              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="m-4 flex items-center gap-3 px-4 py-2 rounded-md bg-[#1B9C6F] text-white hover:bg-[#149161] transition"
      >
        <LogOut size={20} />
        {sidebarOpen && 'Logout'}
      </button>
    </aside>
  );
}
