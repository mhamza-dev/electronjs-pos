import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage, SignupPage } from "./pages/Auth";
import POSPage from "./pages/Dashboard/DashboardPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthenticatedLayout from "./components/Layout/AuthenticatedLayout";

const DashboardPage = React.lazy(
  () => import("./pages/Dashboard/DashboardAnalytics"),
);
const SalesPage = React.lazy(() => import("./pages/Sales/SalesPage"));
const PurchasesPage = React.lazy(
  () => import("./pages/Purchases/PurchasesPage"),
);
const InventoryPage = React.lazy(
  () => import("./pages/Inventory/InventoryPage"),
);
const CustomersPage = React.lazy(
  () => import("./pages/Customers/CustomersPage"),
);
const ServicesPage = React.lazy(() => import("./pages/Services/ServicesPage"));
const PackagesPage = React.lazy(() => import("./pages/Packages/PackagesPage"));
const DealsPage = React.lazy(() => import("./pages/Deals/DealsPage"));
const AppointmentsPage = React.lazy(
  () => import("./pages/Appointments/AppointmentsPage"),
);
const MedicalPage = React.lazy(() => import("./pages/Medical/MedicalPage"));
const RestaurantPage = React.lazy(
  () => import("./pages/Restaurant/RestaurantPage"),
);
const KitchenPage = React.lazy(() => import("./pages/Kitchen/KitchenPage"));
const SuppliersPage = React.lazy(
  () => import("./pages/Suppliers/SuppliersPage"),
);
const EmployeesPage = React.lazy(
  () => import("./pages/Employees/EmployeesPage"),
);
const SettingsPage = React.lazy(() => import("./pages/Settings/SettingsPage"));

// Generic fallback while lazy loading
const PageFallback = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-poppins">
        <div className="flex flex-col items-center space-y-md">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected routes – one per menu item */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pos"
              element={
                <ProtectedRoute>
                  <POSPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <SalesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchases"
              element={
                <ProtectedRoute>
                  <PurchasesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <InventoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <CustomersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/services"
              element={
                <ProtectedRoute>
                  <ServicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/packages"
              element={
                <ProtectedRoute>
                  <PackagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deals"
              element={
                <ProtectedRoute>
                  <DealsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <AppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medical"
              element={
                <ProtectedRoute>
                  <MedicalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/restaurant"
              element={
                <ProtectedRoute>
                  <RestaurantPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kitchen"
              element={
                <ProtectedRoute>
                  <KitchenPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute>
                  <SuppliersPage />
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
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
