import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';

export default function Header({ onMenu }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
      <button className="btn-ghost !p-2 lg:hidden" onClick={onMenu} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>
      <p className="hidden text-sm text-navy-500 lg:block">Preliminary information only – not a medical diagnosis.</p>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm font-medium sm:block">{user?.name}</span>
        <Avatar user={user} />
      </div>
    </header>
  );
}
