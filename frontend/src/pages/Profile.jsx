import { LogOut, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from '../components/Avatar.jsx';

export default function Profile() {
  const { user, logout } = useAuth();
  return (
    <div className="max-w-xl space-y-5">
      <h1 className="text-2xl font-bold">Profile</h1>
      <section className="card space-y-5">
        <div className="flex items-center gap-4">
          <Avatar user={user} size="h-20 w-20" />
          <div>
            <p className="text-xl font-semibold">{user.name}</p>
            <p className="flex items-center gap-1.5 text-sm text-navy-500"><Mail className="h-4 w-4" aria-hidden="true" /> {user.email}</p>
          </div>
        </div>
        <p className="text-sm text-navy-500">Your name, email and picture come from your Google account and are managed there.</p>
        <button className="btn-secondary" onClick={logout}><LogOut className="h-4 w-4" /> Sign out</button>
      </section>
    </div>
  );
}
