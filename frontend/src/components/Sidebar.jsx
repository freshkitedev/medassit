import { NavLink } from 'react-router-dom';
import { History, LayoutDashboard, LogOut, PlusCircle, Settings, User, X } from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/assessments/new', label: 'New Assessment', icon: PlusCircle },
  { to: '/assessments', label: 'Assessment History', icon: History, end: true },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-navy-700 hover:bg-slate-100'
    }`;

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-navy-950/40 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white p-4 transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        <div className="mb-6 flex items-center justify-between px-1">
          <Logo />
          <button className="btn-ghost !p-1.5 lg:hidden" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass} onClick={onClose}>
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50">
          <LogOut className="h-5 w-5" aria-hidden="true" />
          Logout
        </button>
      </aside>
    </>
  );
}
