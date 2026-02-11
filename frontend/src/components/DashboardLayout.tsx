import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import MainContent from '../components/MainContent';
import Sidebar from '../components/Sidebar';
import { useAppSelector } from '../app/hooks';

export default function DashboardLayout() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      <Sidebar role={user.role} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header user={user} />
        <MainContent>
          <Outlet />
        </MainContent>
        <Footer />
      </div>
    </div>
  );
}
