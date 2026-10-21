import React, { useEffect, useState } from 'react';
import {
  NavLink,
  useNavigate
} from 'react-router-dom';

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
  ChevronDown
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Chatbot from '../components/chatbot/Chatbot';

const items = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'STAFF', 'CLIENT']
  },
  {
    label: 'Clients',
    path: '/clients',
    icon: UsersRound,
    roles: ['ADMIN', 'STAFF']
  },
  {
    label: 'Products & Services',
    path: '/products',
    icon: Package,
    roles: ['ADMIN', 'STAFF']
  },
  {
    label: 'Invoices',
    path: '/invoices',
    icon: ReceiptText,
    roles: ['ADMIN', 'STAFF', 'CLIENT']
  },
  {
    label: 'Payments',
    path: '/payments',
    icon: CreditCard,
    roles: ['ADMIN', 'STAFF', 'CLIENT']
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: ChartNoAxesCombined,
    roles: ['ADMIN', 'STAFF']
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    roles: ['ADMIN']
  }
];

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteOpen, setNoteOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/notifications')
      .then(response => {
        setNotes(response.data.data || []);
      })
      .catch(() => {});
  }, []);

  const unread = notes.filter(note => !note.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAsRead = async note => {
    try {
      if (!note.read) {
        await api.put(`/notifications/${note._id}/read`);

        setNotes(current =>
          current.map(item =>
            item._id === note._id
              ? { ...item, read: true }
              : item
          )
        );
      }
    } catch {}
  };

  return (
    <div className="app-shell">

      {/* SIDEBAR */}
      <aside className={open ? 'sidebar mobile-open' : 'sidebar'}>

        <div className="brand">
          <div className="brand-mark">
            B
          </div>

          <div>
            <strong>BillFlow</strong>
            <small>Billing Suite</small>
          </div>

          <button
            className="mobile-close icon-btn"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav>
          {items
            .filter(item => item.roles.includes(user?.role))
            .map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? 'nav-item active'
                    : 'nav-item'
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
        </nav>

        <div className="sidebar-bottom">

          <div className="user-mini">
            <div className="avatar">
              {getInitials(user?.name)}
            </div>

            <div>
              <strong>{user?.name}</strong>
              <span>{user?.role}</span>
            </div>
          </div>

          <button
            className="logout"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Sign out
          </button>

        </div>
      </aside>

      {/* MAIN */}
      <main className="main">

        {/* TOPBAR */}
        <header className="topbar">

          <div style={{
            display: 'flex',
            alignItems: 'center'
          }}>

            <button
              className="menu-btn icon-btn"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div className="crumb">
              Billing workspace
            </div>

          </div>

          <div className="top-actions">

            {/* NOTIFICATIONS */}
            <div className="notification-wrap">

              <button
                className="notification-btn icon-btn"
                onClick={() => {
                  setNoteOpen(value => !value);
                  setProfileOpen(false);
                }}
              >
                <Bell size={19} />

                {unread > 0 && (
                  <span>{unread > 9 ? '9+' : unread}</span>
                )}
              </button>

              {noteOpen && (
                <div className="notification-menu">

                  <div className="notification-menu-head">
                    <strong>Notifications</strong>
                    <span>
                      {unread} unread
                    </span>
                  </div>

                  {notes.length ? (
                    notes
                      .slice(0, 6)
                      .map(note => (
                        <button
                          key={note._id}
                          className={
                            note.read
                              ? 'notification-item'
                              : 'notification-item unread'
                          }
                          onClick={() => markAsRead(note)}
                        >
                          <strong>
                            {note.title}
                          </strong>

                          <span>
                            {note.message}
                          </span>

                          <small>
                            {new Date(
                              note.createdAt
                            ).toLocaleString('en-IN')}
                          </small>
                        </button>
                      ))
                  ) : (
                    <div className="notification-empty">
                      You're all caught up.
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* USER */}
            <div
              style={{ position: 'relative' }}
              onClick={() =>
                setProfileOpen(value => !value)
              }
            >

              <button
                className="top-user"
                style={{
                  border: 0,
                  background: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <div className="avatar">
                  {getInitials(user?.name)}
                </div>

                <span>{user?.name}</span>

                <ChevronDown size={14} />
              </button>

              {profileOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 10px)',
                    width: 190,
                    background: '#fff',
                    border: '1px solid #e7eaf0',
                    borderRadius: 13,
                    boxShadow:
                      '0 20px 50px rgba(15,23,42,.12)',
                    padding: 8,
                    zIndex: 300
                  }}
                >

                  <div
                    style={{
                      padding: '10px 11px',
                      borderBottom:
                        '1px solid #eef0f4',
                      marginBottom: 5
                    }}
                  >
                    <strong
                      style={{
                        display: 'block',
                        fontSize: 11
                      }}
                    >
                      {user?.name}
                    </strong>

                    <span
                      style={{
                        display: 'block',
                        fontSize: 9,
                        color: '#94a3b8',
                        marginTop: 3
                      }}
                    >
                      {user?.email}
                    </span>
                  </div>

                  <button
                    className="logout"
                    style={{
                      color: '#ef4444'
                    }}
                    onClick={handleLogout}
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>

                </div>
              )}

            </div>

          </div>

        </header>

        <section className="content">
          {children}
        </section>

      </main>

      <Chatbot />

    </div>
  );
}