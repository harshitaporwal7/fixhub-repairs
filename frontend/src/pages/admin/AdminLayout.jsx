import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Smartphone,
  Tag,
  Boxes,
  Wrench,
  MapPin,
  Star,
  Mail,
  LogOut,
  Wrench as LogoIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/devices', label: 'Devices', icon: Smartphone },
  { to: '/admin/brands', label: 'Brands', icon: Tag },
  { to: '/admin/models', label: 'Models', icon: Boxes },
  { to: '/admin/repairs', label: 'Repair Services', icon: Wrench },
  { to: '/admin/locations', label: 'Locations', icon: MapPin },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/contact', label: 'Contact Requests', icon: Mail },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-bg">
      <aside className="w-64 flex-shrink-0 bg-ink-900 text-white flex flex-col fixed h-screen">
        <Link to="/" className="flex items-center gap-2 px-6 h-16 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <LogoIcon className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-lg">FixHub</span>
          <span className="text-xs text-white/40 font-medium">Admin</span>
        </Link>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white w-full"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
