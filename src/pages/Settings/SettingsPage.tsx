// pages/SettingsPage.tsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ProfileSettings from "./ProfileSettings";
import BusinessSettings from "./BusinessSettings";
import UserManagement from "./UserManagement";
import RoleManagement from "./RoleManagement";
import BusinessesOverview from "./BusinessOverview";

// Tab component
const Tabs: React.FC<{
  tabs: string[];
  active: number;
  onChange: (idx: number) => void;
}> = ({ tabs, active, onChange }) => (
  <div className="border-b border-gray-200 mb-6">
    <nav className="flex space-x-8">
      {tabs.map((tab, idx) => (
        <button
          key={idx}
          onClick={() => onChange(idx)}
          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            active === idx
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          {tab}
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

  // Tabs available to user
  const tabs = ["Profile"];
  if (isAdmin || isOwner) {
    tabs.push("Business", "Users", "Roles", "Businesses");
  }

  return (
    <div className="mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {activeTab === 0 && (
          <ProfileSettings profile={profile} onUpdate={refreshProfile} />
        )}
        {activeTab === 1 && isAdmin && (
          <BusinessSettings businessId={currentBusinessId!} />
        )}
        {activeTab === 2 && isAdmin && (
          <UserManagement businessId={currentBusinessId!} />
        )}
        {activeTab === 3 && isAdmin && (
          <RoleManagement businessId={currentBusinessId!} />
        )}
        {activeTab === 4 && (isAdmin || isOwner) && <BusinessesOverview />}
      </div>
    </div>
  );
};

export default SettingsPage;
