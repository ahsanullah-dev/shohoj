import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import UniversityBadge from '../common/UniversityBadge';
import CampusMapModal from '../map/CampusMapModal';
import { api, resolveImageUrl } from '../../api/client';
import { 
  Compass, 
  MessageSquare, 
  User as UserIcon, 
  Plus, 
  Sun, 
  Moon, 
  LogOut, 
  Menu, 
  X,
  Bell,
  MapPin
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Poll for unread notifications / messages
  useEffect(() => {
    if (!isAuthenticated) return;
    async function checkNotifications() {
      try {
        const res = await api.get('/api/notifications');
        const unread = (res.notifications || []).filter((n) => !n.read).length;
        setUnreadCount(unread);
      } catch (err) {
        // ignore background poll errors
      }
    }
    checkNotifications();
    const interval = setInterval(checkNotifications, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass-nav transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 via-cyan-500 to-brand-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              S
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              Shohoj
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/feed"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 flex items-center gap-1.5 transition-colors"
            >
              <Compass className="w-4 h-4" />
              Explore Feed
            </Link>

            <button
              onClick={() => setMapModalOpen(true)}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 flex items-center gap-1.5 transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-500" />
              Campus Map
            </button>

            {isAuthenticated && (
              <Link
                to="/inbox"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 flex items-center gap-1.5 transition-colors relative"
              >
                <MessageSquare className="w-4 h-4" />
                Inbox
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Dark/Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Create Post Button */}
            <Link
              to={isAuthenticated ? '/create-post' : '/login?next=/create-post'}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 shadow-sm shadow-brand-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Post Gig / Item
            </Link>

            {/* Auth status */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-dark-border">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 group text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center text-xs font-bold uppercase overflow-hidden">
                    {user?.avatarUrl ? (
                      <img
                        src={resolveImageUrl(user.avatarUrl)}
                        alt={user?.name || 'Profile photo'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name?.[0] || 'U'
                    )}
                  </div>
                  <span className="group-hover:text-brand-400 transition-colors font-semibold max-w-[110px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-400 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-dark-card border border-slate-300 dark:border-dark-border text-slate-800 dark:text-slate-200 hover:border-brand-500 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <Link
            to="/feed"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-card"
          >
            <Compass className="w-4 h-4 text-brand-500" />
            Explore Campus Feed
          </Link>

          <button
            onClick={() => {
              setMobileOpen(false);
              setMapModalOpen(true);
            }}
            className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-card"
          >
            <MapPin className="w-4 h-4 text-emerald-500" />
            Interactive Campus Map
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/inbox"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-card"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  Messages &amp; Inbox
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold text-white bg-rose-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-card"
              >
                <UserIcon className="w-4 h-4 text-cyan-500" />
                My Profile &amp; Listings
              </Link>
              <Link
                to="/create-post"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500"
              >
                <Plus className="w-4 h-4" />
                + Post New Gig / Item
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                Log Out ({user?.name})
              </button>
            </>
          ) : (
            <div className="pt-2 space-y-2">
              <Link
                to="/login"
                className="block text-center py-2.5 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-dark-card border border-slate-300 dark:border-dark-border"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="block text-center py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-600"
              >
                Create Student Account
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Campus Map Discovery Modal */}
      <CampusMapModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        initialUniTag={user?.universityTag || (user?.isRuetVerified ? 'RUET' : 'RUET')}
      />
    </nav>
  );
}
