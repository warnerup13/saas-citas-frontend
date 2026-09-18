import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { BusinessProvider } from "./context/BusinessContext";
import AppRoutes from "./routes/AppRoutes";
import Toast from "./components/common/Toast";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <BusinessProvider>
            <AppRoutes />
            <Toast />
          </BusinessProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

