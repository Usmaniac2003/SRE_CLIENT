'use client';

import Link from 'next/link';
import { useUIStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';
import { usePathname } from 'next/navigation';

const menu = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Sales', path: '/dashboard/sales' },
  { label: 'Rentals', path: '/dashboard/rentals' },
  { label: 'Returns', path: '/dashboard/returns' },
  { label: 'Inventory', path: '/dashboard/inventory' },
  { label: 'Users', path: '/dashboard/users' },
  { label: 'Employees', path: '/dashboard/employees' },
  { label: 'Coupons', path: '/dashboard/coupons' },
  { label: 'Reports', path: '/dashboard/reports' },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const { logout } = useAuthStore();

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

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-4 py-3 rounded-r-lg transition-all ${
                active
                  ? 'bg-[#E7F5EF] text-[#1B9C6F] font-semibold'
                  : 'text-[#4A5A52] hover:bg-[#F0F5F2]'
              }`}
            >
              {sidebarOpen ? item.label : item.label[0]}
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <button
        onClick={logout}
        className="m-4 px-4 py-2 rounded-md bg-[#1B9C6F] text-white hover:bg-[#149161] transition"
      >
        {sidebarOpen ? 'Logout' : '⎋'}
      </button>
    </aside>
  );
}
