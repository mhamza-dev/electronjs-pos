import React, { useState } from "react";
import SuppliersTab from "./SuppliersTab";
import PurchaseOrdersTab from "./PurchaseOrdersTab";
import { useAuth } from "../../contexts/AuthContext";

// Tabs component (reused from Settings)
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

const ProcurementPage: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const businessId = profile?.current_business_id;

  if (!businessId)
    return <div className="p-8 text-center">No business selected</div>;

  return (
    <div className="mx-auto py-8">
      <Tabs
        tabs={["Suppliers", "Purchase Orders"]}
        active={activeTab}
        onChange={setActiveTab}
      />
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {activeTab === 0 && <SuppliersTab businessId={businessId} />}
        {activeTab === 1 && <PurchaseOrdersTab businessId={businessId} />}
      </div>
    </div>
  );
};

export default ProcurementPage;
