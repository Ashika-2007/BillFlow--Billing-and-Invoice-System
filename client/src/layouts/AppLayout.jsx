import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UsersRound,
  Package,
  ReceiptText,
  CreditCard,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Menu,
  Bell,
  X,
  ChevronDown,
  BellOff
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Chatbot from '../components/chatbot/Chatbot';
import Brand from '../components/Brand';
import Avatar from '../components/Avatar';
import usePresence from '../hooks/usePresence';
import useClickOutside from '../hooks/useClickOutside';

const items = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'STAFF', 'CLIENT'] },
  { label: 'Clients', path: '/clients', icon: UsersRound, roles: ['ADMIN', 'STAFF'] },
  { label: 'Products & Services', path: '/products', icon: Package, roles: ['ADMIN', 'STAFF'] },
  { label: 'Invoices', path: '/invoices', icon: ReceiptText, roles: ['ADMIN', 'STAFF', 'CLIENT'] },
  { label: 'Payments', path: '/payments', icon: CreditCard, roles: ['ADMIN', 'STAFF', 'CLIENT'] },
  { label: 'Reports', path: '/reports', icon: ChartNoAxesCombined, roles: ['ADMIN', 'STAFF'] },
  { label: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] }
];

const titleFor = (pathname) => {
  if (pathname === '/invoices/new') return 'New invoice';
  if (/^\/invoices\/[^/]+\/edit$/.test(pathname)) return 'Edit invoice';
  if (/^\/invoices\/[^/]+$/.test(pathname)) return 'Invoice details';
  if (/^\/clients\/[^/]+$/.test(pathname)) return 'Client profile';
  return items.find((i) => pathname.startsWith(i.path))?.label || 'Workspace';
};

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteOpen, setNoteOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const noteRef = useRef(null);
  const profileRef = useRef(null);
  const navRef = useRef(null);
  const [indicator, setIndicator] = useState({ top: 0, height: 0, visible: false });

  const notePresence = usePresence(noteOpen, 160);
  const profilePresence = usePresence(profileOpen, 160);

  useEffect(() => {
    api
      .get('/notifications')
      .then((response) => setNotes(response.data.data || []))
      .catch(() => {});
  }, []);

  // Close transient UI on navigation
  useEffect(() => {
    setOpen(false);
    setNoteOpen(false);
    setProfileOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  // Topbar elevation on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobile drawer: lock scroll + Escape to close
  useEffect(() => {
    document.body.classList.toggle('no-scroll', open);
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [open]);

  useClickOutside(noteRef, () => setNoteOpen(false), noteOpen);
  useClickOutside(profileRef, () => setProfileOpen(false), profileOpen);

  // Sliding active-item indicator
  useLayoutEffect(() => {
    const measure = () => {
      const active = navRef.current?.querySelector('.nav-item.active');
      if (!active) return setIndicator((i) => ({ ...i, visible: false }));
      setIndicator({ top: active.offsetTop, height: active.offsetHeight, visible: true });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [location.pathname, user?.role]);

  const unread = notes.filter((note) => !note.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAsRead = async (note) => {
    try {
      if (!note.read) {
        await api.put(`/notifications/${note._id}/read`);
        setNotes((current) => current.map((item) => (item._id === note._id ? { ...item, read: true } : item)));
      }
    } catch {
      /* non-critical */
    }
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {/* Mobile drawer scrim */}
      <div className={`scrim ${open ? 'is-open' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />

      <aside className={open ? 'sidebar mobile-open' : 'sidebar'} aria-label="Primary">
        <div className="sidebar-head">
          <Brand subtitle="Billing Suite" />
          <button className="mobile-close icon-btn on-dark" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className="nav-label">Workspace</div>
        <nav ref={navRef} className="nav">
          <span
            className="nav-indicator"
            style={{
              transform: `translateY(${indicator.top}px)`,
              height: indicator.height,
              opacity: indicator.visible ? 1 : 0
            }}
            aria-hidden="true"
          />
          {items
            .filter((item) => item.roles.includes(user?.role))
            .map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-mini">
            <Avatar name={user?.name} tone="mint" />
            <div className="user-mini-text">
              <strong>{user?.name}</strong>
              <span>{user?.role}</span>
            </div>
          </div>
          <button className="logout" onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="main">
        <header className={`topbar ${scrolled ? 'is-scrolled' : ''}`}>
          <div className="topbar-left">
            <button className="menu-btn icon-btn" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
              <Menu size={20} />
            </button>
            <div className="crumb">
              <span>Workspace</span>
              <i aria-hidden="true">/</i>
              <strong>{titleFor(location.pathname)}</strong>
            </div>
          </div>

          <div className="top-actions">
            {/* Notifications */}
            <div className="menu-wrap" ref={noteRef}>
              <button
                className="notification-btn icon-btn"
                onClick={() => {
                  setNoteOpen((v) => !v);
                  setProfileOpen(false);
                }}
                aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
                aria-haspopup="true"
                aria-expanded={noteOpen}
              >
                <Bell size={19} />
                {unread > 0 && <span className="badge-dot">{unread > 9 ? '9+' : unread}</span>}
              </button>

              {notePresence.mounted && (
                <div className="dropdown notification-menu" data-state={notePresence.state}>
                  <div className="dropdown-head">
                    <strong>Notifications</strong>
                    <span>{unread} unread</span>
                  </div>
                  <div className="dropdown-scroll">
                    {notes.length ? (
                      notes.slice(0, 6).map((note) => (
                        <button
                          key={note._id}
                          className={note.read ? 'notification-item' : 'notification-item unread'}
                          onClick={() => markAsRead(note)}
                        >
                          <span className={`note-dot ${note.type ? note.type.toLowerCase() : 'info'}`} aria-hidden="true" />
                          <span className="note-text">
                            <strong>{note.title}</strong>
                            <span>{note.message}</span>
                            <small>{new Date(note.createdAt).toLocaleString('en-IN')}</small>
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="notification-empty">
                        <BellOff size={20} />
                        You’re all caught up.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="menu-wrap" ref={profileRef}>
              <button
                className="top-user"
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setNoteOpen(false);
                }}
                aria-haspopup="true"
                aria-expanded={profileOpen}
              >
                <Avatar name={user?.name} size="sm" />
                <span className="top-user-name">{user?.name}</span>
                <ChevronDown size={14} className={profileOpen ? 'chev open' : 'chev'} aria-hidden="true" />
              </button>

              {profilePresence.mounted && (
                <div className="dropdown profile-menu" data-state={profilePresence.state}>
                  <div className="dropdown-head stacked">
                    <strong>{user?.name}</strong>
                    <span>{user?.email}</span>
                    <em className="role-chip">{user?.role}</em>
                  </div>
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={15} aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content" id="main" tabIndex={-1}>
          {/* Keyed so each route plays its entrance transition */}
          <div className="page-enter" key={location.pathname}>
            {children}
          </div>
        </main>
      </div>

      <Chatbot />
    </div>
  );
}
