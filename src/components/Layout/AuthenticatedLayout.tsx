import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Truck,
  Settings,
  LogOut,
  ChevronDown,
  Store,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services";
import logo from "../../assets/logo.svg";
import Dropdown from "../Dropdown";
import { Button } from "../Buttons";

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

  // ----- Theme toggling logic -----
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);
  // ----- End theme logic -----

  // ----- Sidebar collapse logic -----
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true";
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarCollapsed", String(next));
      return next;
    });
  };
  // ----- End sidebar logic -----

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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-poppins">
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "w-[72px]" : "w-width-sidebar"
        }`}
      >
        {/* Logo Area & Collapse Toggle */}
        <div
          className={`h-height-header flex items-center border-b border-gray-100 dark:border-gray-700 ${
            sidebarCollapsed ? "justify-center px-0" : "px-lg justify-between"
          }`}
        >
          <div
            className="flex items-center overflow-hidden cursor-pointer"
            onClick={toggleSidebar}
          >
            <img
              src={logo}
              alt="Vendora"
              className={`w-8 h-8 ${sidebarCollapsed ? "mr-0" : "mr-sm"}`}
            />
            {!sidebarCollapsed && (
              <span className="text-xl font-black text-gray-800 dark:text-gray-100 tracking-tight truncate">
                Vendora<span className="text-primary">PRO</span>
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={sidebarCollapsed ? item.name : undefined}
                className={`group flex items-center rounded-lg font-medium transition-all ${
                  sidebarCollapsed
                    ? "flex-col justify-center px-1 py-3 gap-1"
                    : "px-md py-sm gap-sm"
                } ${
                  isActive
                    ? "bg-primary-50 dark:bg-primary-100/20 text-primary-700 dark:text-primary-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    sidebarCollapsed ? "" : "mr-0"
                  } ${
                    isActive
                      ? "text-primary-700 dark:text-primary-300"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                  }`}
                />
                {!sidebarCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
                {isActive && !sidebarCollapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="h-height-footer border-t border-gray-100 dark:border-gray-700 flex items-center justify-center px-md">
          {sidebarCollapsed ? (
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <Button variant="dangerText" onClick={handleLogout} size="md">
              <LogOut className="w-5 h-5 mr-md" />
              <span>Logout</span>
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-height-header bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-lg flex-shrink-0">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
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
                <div className="flex items-center gap-xs px-sm py-xs hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Store className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                    {selected?.label || "Select Business"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            />

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {/* User Info */}
            <div className="hidden sm:block text-right">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {profile?.full_name || "User"}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {currentRole}
              </div>
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-700 font-semibold flex items-center justify-center shadow-sm border-2 border-white dark:border-gray-700">
              {profile?.full_name?.charAt(0) || "U"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-lg">{children}</main>

        {/* Footer */}
        <footer className="h-height-footer bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center px-lg text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
          &copy; {new Date().getFullYear()} Vendora PRO. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
