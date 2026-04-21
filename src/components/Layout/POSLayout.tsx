import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services";
import { HiHome, HiCube, HiCog } from "react-icons/hi";

interface POSLayoutProps {
  children: React.ReactNode;
}

const POSLayout: React.FC<POSLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, refreshProfile, signOut } = useAuth();

  // Find current business from profile using current_business_id
  const currentBusinessMembership = profile?.business_users.find(
    (bu) => bu.business_id === profile.current_business_id,
  );

  const currentBusinessName =
    currentBusinessMembership?.business.business_name || "POS PRO";
  const currentRole = currentBusinessMembership?.role?.role_name || "Staff";

  // Available businesses for switching
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
      // Optionally reload page or just let state update
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
      icon: <HiHome className="w-5 h-5" />,
    },
    {
      name: "Products",
      path: "/products",
      adminOnly: false,
      icon: <HiCube className="w-5 h-5" />,
    },
    {
      name: "Settings",
      path: "/settings",
      adminOnly: false,
      icon: <HiCog className="w-5 h-5" />,
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || currentRole === "admin",
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-poppins">
      {/* Sidebar */}
      <aside className="w-width-sidebar flex-shrink-0 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="h-height-header flex items-center px-lg border-b border-gray-200">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white mr-sm">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 118 0m-4 8a2 2 0 110-4 2 2 0 010 4zm-8 8a2 2 0 110-4 2 2 0 010 4zm-4-8a2 2 0 110-4 2 2 0 010 4zm0 0V7a4 4 0 018 0v4m-8 8a2 2 0 110-4 2 2 0 010 4z"
              />
            </svg>
          </div>
          <span className="text-xl font-black text-gray-800 tracking-tight truncate max-w-[180px]">
            {currentBusinessName === "POS PRO" ? (
              <>
                POS<span className="text-primary">PRO</span>
              </>
            ) : (
              currentBusinessName
            )}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto p-md space-y-sm mt-md">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`p-sm rounded-xl font-bold flex items-center space-x-md transition-all ${
                location.pathname === item.path
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }`}
            >
              <div
                className={
                  location.pathname === item.path
                    ? "text-white"
                    : "text-gray-400"
                }
              >
                {item.icon}
              </div>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-md border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full p-sm text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all flex items-center space-x-md"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-height-header bg-white border-b border-gray-200 flex items-center justify-end px-lg flex-shrink-0">
          <div className="flex items-center space-x-md">
            {/* Business Switcher Dropdown */}
            {availableBusinesses.length > 1 && (
              <div className="relative">
                <select
                  value={profile?.current_business_id || ""}
                  onChange={(e) => handleSwitchBusiness(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {availableBusinesses.map((b) => (
                    <option key={b.business_id} value={b.business_id}>
                      {b.business.business_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-gray-800 leading-none">
                {profile?.full_name || "User"}
              </div>
              <div className="text-xs text-gray-400 capitalize">
                {currentRole}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary font-bold shadow-sm">
              {profile?.full_name?.charAt(0) || "U"}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-lg">{children}</main>

        {/* Footer */}
        <footer className="h-height-footer bg-white border-t border-gray-200 flex items-center px-lg text-sm text-gray-400 flex-shrink-0">
          &copy; 2026 POS PRO v1.0.0
        </footer>
      </div>
    </div>
  );
};

export default POSLayout;
