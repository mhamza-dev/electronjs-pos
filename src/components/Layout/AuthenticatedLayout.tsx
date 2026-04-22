import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Truck,
  Settings,
  LogOut,
  ChevronDown,
  Store,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services";
import logo from "../../assets/logo.svg";
import Dropdown from "../Dropdown";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const { profile, refreshProfile, signOut } = useAuth();

  // Current business context
  const currentBusinessMembership = profile?.business_users.find(
    (bu) => bu.business_id === profile.current_business_id,
  );

  const currentRole = currentBusinessMembership?.role?.role_name || "Staff";
  const availableBusinesses = profile?.business_users || [];

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleSwitchBusiness = async (businessId: string) => {
    if (!profile?.id) return;
    try {
      await authService.switchBusiness(profile.id, businessId);
      await refreshProfile();
    } catch (error) {
      console.error("Failed to switch business:", error);
      alert("Could not switch business.");
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      adminOnly: false,
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      path: "/products",
      adminOnly: false,
      icon: Package,
    },
    {
      name: "Procurement",
      path: "/procurement",
      adminOnly: true,
      icon: Truck,
    },
    {
      name: "Settings",
      path: "/settings",
      adminOnly: false,
      icon: Settings,
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || currentRole === "admin",
  );

  const activePageTitle =
    menuItems.find((item) => item.path === path)?.name || "Dashboard";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-poppins">
      {/* Sidebar */}
      <aside className="w-width-sidebar flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo Area */}
        <div className="h-height-header flex items-center px-lg border-b border-gray-100">
          <img src={logo} alt="Vendora" className="w-8 h-8 mr-sm" />
          <span className="text-xl font-black text-gray-800 tracking-tight truncate">
            Vendora<span className="text-primary">PRO</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-md space-y-xs">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-md py-sm rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mr-md transition-colors ${
                    isActive
                      ? "text-primary-700"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-md border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-md py-sm text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-5 h-5 mr-md" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-height-header bg-white border-b border-gray-100 flex items-center justify-between px-lg flex-shrink-0">
          <h1 className="text-xl font-semibold text-gray-800">
            {activePageTitle}
          </h1>

          <div className="flex items-center space-x-md">
            {/* Business Switcher */}
            <Dropdown
              options={availableBusinesses.map((b) => ({
                label: b.business.business_name,
                value: b.business_id,
              }))}
              value={profile?.current_business_id || ""}
              onChange={handleSwitchBusiness}
              renderTrigger={(selected) => (
                <div className="flex items-center gap-xs px-sm py-xs hover:bg-gray-50 rounded-lg transition-colors">
                  <Store className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {selected?.label || "Select Business"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              )}
            />
            {/* User Info */}
            <div className="hidden sm:block text-right">
              <div className="text-sm font-semibold text-gray-800">
                {profile?.full_name || "User"}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {currentRole}
              </div>
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-700 font-semibold flex items-center justify-center shadow-sm border-2 border-white">
              {profile?.full_name?.charAt(0) || "U"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-lg">{children}</main>

        {/* Footer */}
        <footer className="h-height-footer bg-white border-t border-gray-100 flex items-center px-lg text-xs text-gray-400 flex-shrink-0">
          &copy; {new Date().getFullYear()} Vendora PRO. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
