import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DemoBanner } from './DemoBanner.tsx';
import { Btn } from './Btn.tsx';

interface NavbarProps {
  isAuthenticated: boolean;
  unreadCount?: number;
  pendingCount?: number;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, unreadCount = 0, pendingCount = 0, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    onLogout?.();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-bg border-b-2 border-border">
      {/* Top accent stripe */}
      <div className="h-[3px] bg-yellow w-full" />

      <div className="max-w-[1400px] mx-auto px-6 py-0 flex items-stretch justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 py-3 pr-6 border-r border-border hover:opacity-80 transition-opacity"
        >
          <img src="/favicon.svg" alt="heart" className="w-9 h-9" />
          <span className="font-bold text-yellow tracking-wide uppercase text-sm" style={{ fontFamily: 'var(--font-ui)', letterSpacing: '0.08em' }}>
            Match-Me
          </span>
          <span className="text-[10px] text-muted font-normal ml-1 self-end mb-[5px]" style={{ fontFamily: 'var(--font-ui)' }}>
            v3.0
          </span>
        </button>

        <DemoBanner />

        {isAuthenticated ? (
          <>
            {/* Desktop nav */}
            <div className="hidden md:flex items-stretch">
              <NavTab src="/discover.svg" label="Discover" active={isActive('/recommendations')} onClick={() => navigate('/recommendations')} />
              <NavTab src="/messages.png" label="Messages" active={isActive('/chat')} badge={unreadCount} onClick={() => navigate('/chats')} />
              <NavTab
                src="/connections.svg"
                label="Connections"
                active={isActive('/connections')}
                badge={pendingCount}
                onClick={() => navigate('/connections')}
              />
              <NavTab src="/profile.svg" label="Profile" active={isActive('/profile')} onClick={() => navigate('/profile')} />
            </div>

            {/* Right side */}
            <div className="flex items-center ml-auto pl-4 border-l border-border">
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1 px-4 py-3 text-red hover:bg-red/10 text-xs font-bold uppercase transition-colors"
                style={{ fontFamily: 'var(--font-ui)', letterSpacing: '0.06em' }}
              >
                <span>✕</span>
                <span>Logout</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden relative flex items-center gap-1 px-4 py-3 text-text hover:bg-surface text-xs font-bold transition-colors"
                style={{ fontFamily: 'var(--font-ui)' }}
                aria-label="Open menu"
              >
                MENU {mobileMenuOpen ? '▲' : '▼'}
                {(unreadCount > 0 || pendingCount > 0) && <span className="absolute top-2 right-1 w-2 h-2 bg-yellow" />}
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-stretch ml-auto border-l border-border">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-3 text-text hover:bg-surface text-xs font-bold uppercase border-r border-border transition-colors"
              style={{ fontFamily: 'var(--font-ui)', letterSpacing: '0.06em' }}
            >
              Sign In
            </button>
            <Btn variant="chat" onClick={() => navigate('/register')}>
              Register ▶
            </Btn>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden border-t-2 border-border bg-panel">
          <MobileNavItem
            src="/discover.svg"
            label="Discover"
            active={isActive('/recommendations')}
            onClick={() => {
              navigate('/recommendations');
              setMobileMenuOpen(false);
            }}
          />
          <MobileNavItem
            src="/messages.png"
            label="Messages"
            active={isActive('/chat')}
            badge={unreadCount}
            onClick={() => {
              navigate('/chats');
              setMobileMenuOpen(false);
            }}
          />
          <MobileNavItem
            src="/connections.svg"
            label="Connections"
            active={isActive('/connections')}
            badge={pendingCount}
            onClick={() => {
              navigate('/connections');
              setMobileMenuOpen(false);
            }}
          />
          <MobileNavItem
            src="/profile.svg"
            label="Profile"
            active={isActive('/profile')}
            onClick={() => {
              navigate('/profile');
              setMobileMenuOpen(false);
            }}
          />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-3 text-red hover:bg-red/10 border-t-2 border-border text-xs font-bold uppercase transition-colors"
            style={{ fontFamily: 'var(--font-ui)', letterSpacing: '0.06em' }}
          >
            <span>✕</span> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

// Desktop tab ───────────────────────────────────────────────────────────────

interface NavTabProps {
  src: string;
  label: string;
  badge?: number;
  active?: boolean;
  onClick: () => void;
}

const NavTab: React.FC<NavTabProps> = ({ src, label, badge, active, onClick }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase border-r border-border transition-colors group ${
      active ? 'text-yellow bg-surface' : 'text-muted hover:text-yellow hover:bg-surface'
    }`}
    style={{ fontFamily: 'var(--font-ui)', letterSpacing: '0.06em' }}
  >
    {/* Bottom active/hover rule */}
    <span
      className={`absolute bottom-0 left-0 right-0 h-[2px] bg-yellow transition-transform origin-left ${
        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
      }`}
    />
    <img src={src} alt={label} className="w-8 h-8" />
    <span>{label}</span>
    {badge && badge > 0 ? <span className="bg-red text-bg text-[10px] font-black px-1.5 py-px leading-none tabular-nums">{badge}</span> : null}
  </button>
);

// Mobile nav item ───────────────────────────────────────────────────────────

interface MobileNavItemProps {
  src: string;
  label: string;
  badge?: number;
  active?: boolean;
  onClick: () => void;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ src, label, badge, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-3 border-b border-border text-xs font-bold uppercase transition-colors ${
      active ? 'text-yellow bg-surface border-l-2 border-l-yellow' : 'text-muted hover:text-yellow hover:bg-surface'
    }`}
    style={{ fontFamily: 'var(--font-ui)', letterSpacing: '0.06em' }}
  >
    <img src={src} alt={label} className="w-8 h-8" />
    <span className="flex-1 text-left">{label}</span>
    {badge && badge > 0 ? <span className="bg-red text-bg text-[10px] font-black px-1.5 py-px leading-none tabular-nums">{badge}</span> : null}
  </button>
);
