import { useAppDispatch } from '../app/hooks';
import { logout, type AuthUser } from '../app/authSlice';

interface HeaderProps {
  user: AuthUser;
}

export default function Header({ user }: HeaderProps) {
  const dispatch = useAppDispatch();

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Salon Management System</h1>
        <p className="text-xs text-slate-500">Role: {user.role}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-700">{user.name}</span>
        <button
          type="button"
          onClick={() => dispatch(logout())}
          className="rounded-md bg-rose-500 px-3 py-2 text-sm text-white hover:bg-rose-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
