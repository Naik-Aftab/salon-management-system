import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
}
