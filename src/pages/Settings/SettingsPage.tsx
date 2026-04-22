import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ProfileSettings from "./ProfileSettings";
import BusinessSettings from "./BusinessSettings";
import UserManagement from "./UserManagement";
import RoleManagement from "./RoleManagement";
import BusinessesOverview from "./BusinessOverview";
import { User, Building2, Users, Shield, Store, Settings } from "lucide-react";

interface TabItem {
  name: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const Tabs: React.FC<{
  tabs: TabItem[];
  active: number;
  onChange: (idx: number) => void;
}> = ({ tabs, active, onChange }) => (
  <div className="border-b border-gray-200">
    <nav className="flex space-x-1">
      {tabs.map((tab, idx) => (
        <button
          key={idx}
          onClick={() => onChange(idx)}
          className={`flex items-center gap-sm px-lg py-md text-sm font-medium transition-all border-b-2 -mb-px ${
            active === idx
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          {tab.icon}
          {tab.name}
        </button>
      ))}
    </nav>
  </div>
);

const SettingsPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const currentBusinessId = profile?.current_business_id;
  const currentMembership = profile?.business_users.find(
    (bu) => bu.business_id === currentBusinessId,
  );
  const isAdmin = currentMembership?.role?.role_name === "admin";
  const isOwner = currentMembership?.business.owner_user_id === profile?.id;

  // Define all possible tabs
  const allTabs: TabItem[] = [
    { name: "Profile", icon: <User className="w-4 h-4" /> },
    {
      name: "Business",
      icon: <Building2 className="w-4 h-4" />,
      adminOnly: true,
    },
    { name: "Users", icon: <Users className="w-4 h-4" />, adminOnly: true },
    { name: "Roles", icon: <Shield className="w-4 h-4" />, adminOnly: true },
    {
      name: "Businesses",
      icon: <Store className="w-4 h-4" />,
      adminOnly: true,
    },
  ];

  // Filter tabs based on permissions
  const visibleTabs = allTabs.filter((tab) => {
    if (tab.name === "Profile") return true;
    return isAdmin || isOwner;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header */}
      <div className="flex-shrink-0 space-y-md pb-md">
        <div className="space-y-xs">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-sm">
            <Settings className="w-6 h-6 text-primary-600" />
            Settings
          </h2>
          <p className="text-sm text-gray-500">
            Manage your account, business preferences, and team access
          </p>
        </div>
        <Tabs tabs={visibleTabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-lg">
          {visibleTabs[activeTab]?.name === "Profile" && (
            <ProfileSettings profile={profile} onUpdate={refreshProfile} />
          )}
          {visibleTabs[activeTab]?.name === "Business" && isAdmin && (
            <BusinessSettings businessId={currentBusinessId!} />
          )}
          {visibleTabs[activeTab]?.name === "Users" && isAdmin && (
            <UserManagement businessId={currentBusinessId!} />
          )}
          {visibleTabs[activeTab]?.name === "Roles" && isAdmin && (
            <RoleManagement businessId={currentBusinessId!} />
          )}
          {visibleTabs[activeTab]?.name === "Businesses" &&
            (isAdmin || isOwner) && <BusinessesOverview />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
