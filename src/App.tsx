import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage, SignupPage } from "./pages/Auth";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import EmployeesPage from "./pages/Employees/EmployeesPage";
import ProductsPage from "./pages/Products/ProductsPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import SettingsPage from "./pages/Settings/SettingsPage";
import AuthenticatedLayout from "./components/Layout/AuthenticatedLayout";
import ProcurementPage from "./pages/Procurement/ProcurementPage";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-poppins">
        <div className="flex flex-col items-center space-y-md">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 font-bold">Loading Vendora...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes (Vendora) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <EmployeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/procurement"
            element={
              <ProtectedRoute>
                <ProcurementPage />
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
