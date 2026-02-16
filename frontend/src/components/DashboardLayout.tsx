import { Bell, ChevronDown, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MainContent from '../components/MainContent';
import Sidebar from '../components/Sidebar';
import { logout } from '../app/authSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';

const moduleTitleByPath: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customer',
  '/employees': 'Employee',
  '/appointments': 'Appointment',
  '/services': 'Service',
  '/billing': 'Billing',
  '/inventory': 'Inventory',
  '/reports': 'Report',
  '/finance': 'Finance',
  '/marketing': 'Marketing',
  '/furniture-tools': 'Furniture & Tools',
};

export default function DashboardLayout() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  if (!user) {
    return null;
  }

  const activeModuleTitle =
    Object.entries(moduleTitleByPath).find(([path]) => location.pathname === path || location.pathname.startsWith(`${path}/`))?.[1] ??
    'Dashboard';

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .map((namePart) => namePart[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <div className="min-h-screen bg-[#D6D9EC] p-2.5">
      <div className="mx-auto flex h-[calc(100vh-1.25rem)] max-w-[1540px] p-1.5">
        <Sidebar role={user.role} framed />
        <div className="ml-1 flex min-w-0 flex-1 flex-col overflow-hidden rounded-[30px] border border-[#D5D8EC] bg-[#F4F5FD] px-3 pb-3 pt-2.5">
          <header className="rounded-2xl bg-gradient-to-r from-[#313B77] to-[#252E63] px-4 py-3 text-white shadow-[0_12px_24px_rgba(29,36,80,0.32)]">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <p className="text-base font-semibold tracking-wide">{activeModuleTitle}</p>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D2D8EF] bg-white text-[#4A5687] shadow-[0_2px_8px_rgba(17,24,39,0.12)] transition hover:bg-[#F2F4FD]"
                >
                  <Bell size={16} />
                  <span className="absolute -right-0.5 top-0 h-2.5 w-2.5 rounded-full border border-white bg-rose-500" />
                </button>

                <div ref={profileMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full border border-[#D2D8EF] bg-white py-1 pl-1 pr-2 text-left shadow-[0_2px_8px_rgba(17,24,39,0.12)] transition hover:bg-[#F6F7FD]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6E7EBA] text-xs font-semibold text-white">
                      {initials}
                    </div>
                    <div className="leading-tight">
                      <p className="max-w-[120px] truncate text-sm font-semibold text-[#2F3561]">{user.name}</p>
                      <p className="text-[11px] text-[#5C648C]">Salon Admin</p>
                    </div>
                    <ChevronDown size={14} className="ml-1 text-[#6A739C]" />
                  </button>

                  {isProfileMenuOpen ? (
                    <div className="absolute right-0 top-[calc(100%+8px)] z-30 min-w-[140px] overflow-hidden rounded-xl border border-[#D9DFEF] bg-white p-1.5 shadow-[0_10px_20px_rgba(20,24,40,0.18)]">
                      <button
                        type="button"
                        onClick={() => dispatch(logout())}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#3E4A7B] transition hover:bg-[#F3F5FD]"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          <MainContent className="h-full bg-transparent px-0 pb-0 pt-3 md:px-0 md:pb-0 md:pt-3">
            <Outlet />
          </MainContent>
        </div>
      </div>
    </div>
  );
}
