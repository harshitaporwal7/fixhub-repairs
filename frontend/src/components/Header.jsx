import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Wrench, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Repairs' },
  { to: '/devices', label: 'Devices' },
  { to: '/locations', label: 'Locations' },
  { to: '/about', label: 'About' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow ${
        scrolled ? 'bg-white/95 backdrop-blur shadow-card' : 'bg-white/95 backdrop-blur'
      } border-b border-ink-900/5`}
    >
      <div className="section flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-ink-900">
          <span className="w-8 h-8 rounded-lg bg-primary-700 text-white flex items-center justify-center">
            <Wrench className="w-4.5 h-4.5" strokeWidth={2.5} />
          </span>
          FixHub<span className="text-primary-700">Repairs</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-primary-700 bg-primary-50' : 'text-ink-700 hover:text-primary-700 hover:bg-ink-900/5'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-ink-900/5"
              >
                <User className="w-4 h-4" />
                {user.name.split(' ')[0]}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 card p-1.5" onMouseLeave={() => setMenuOpen(false)}>
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-700 hover:bg-ink-900/5"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Admin dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-700 hover:bg-ink-900/5"
                    >
                      <LayoutDashboard className="w-4 h-4" /> My bookings
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-ghost">
              Log in
            </Link>
          )}
          <Link to="/book" className="btn-primary">
            Book a Repair
          </Link>
        </div>

        <button
          className="lg:hidden p-2 -mr-2 text-ink-700"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-ink-900/5 bg-white">
          <nav className="section py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive ? 'text-primary-700 bg-primary-50' : 'text-ink-700'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="border-t border-ink-900/5 my-2" />
            {user ? (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-ink-700"
                >
                  {isAdmin ? 'Admin dashboard' : 'My bookings'}
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-ink-700">
                Log in
              </Link>
            )}
            <Link to="/book" onClick={() => setMobileOpen(false)} className="btn-primary mt-2 w-full">
              Book a Repair
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
