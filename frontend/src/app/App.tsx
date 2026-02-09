import "../styles/styles.css";
import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import AppRoutes from "./routes";
import { Loader } from "../components/Loader";

export default function App() {
  const { getCurrentUser, isLoading } = useAuth();

  useEffect(() => {
    // TODO: Uncomment when backend is ready
    // Verify token and fetch user data on app load
    // getCurrentUser();
  }, []);

  // TODO: Remove this bypass when backend is ready
  // For now, skip loading check to allow immediate login bypass
  if (isLoading && localStorage.getItem('bypassMode') !== 'true') {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
