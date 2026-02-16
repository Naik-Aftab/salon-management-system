import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { login, type UserRole } from '../app/authSlice';
import { useEffect, useState } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('owner');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (event: any) => {
    event.preventDefault();
    dispatch(login({ role, name }));
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Salon Login</h1>
        <p className="text-sm text-slate-600 mt-1">Choose role to simulate access levels.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-cyan-600 px-4 py-2 text-white font-medium hover:bg-cyan-700"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600 flex justify-between">
          <Link to="/forgot-password" className="text-cyan-700 hover:underline">
            Forgot password?
          </Link>
          <Link to="/register" className="text-cyan-700 hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
