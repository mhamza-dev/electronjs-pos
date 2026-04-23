import React, { useState } from "react";
import { Truck, Package } from "lucide-react";
import SuppliersTab from "./SuppliersTab";
import PurchaseOrdersTab from "./PurchaseOrdersTab";
import { useAuth } from "../../contexts/AuthContext";

const Tabs: React.FC<{
  tabs: { name: string; icon: React.ReactNode }[];
  active: number;
  onChange: (idx: number) => void;
}> = ({ tabs, active, onChange }) => (
  <div className="border-b border-gray-200 dark:border-gray-700">
    <nav className="flex space-x-1">
      {tabs.map((tab, idx) => (
        <button
          key={idx}
          onClick={() => onChange(idx)}
          className={`flex items-center gap-sm px-lg py-md text-sm font-medium transition-all border-b-2 -mb-px ${
            active === idx
              ? "border-primary dark:border-primary-400 text-primary dark:text-primary-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
          }`}
        >
          {tab.icon}
          {tab.name}
        </button>
      ))}
    </nav>
  </div>
);

const ProcurementPage: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const businessId = profile?.current_business_id;

  const tabs = [
    { name: "Suppliers", icon: <Truck className="w-4 h-4" /> },
    { name: "Purchase Orders", icon: <Package className="w-4 h-4" /> },
  ];

  if (!businessId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Truck className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-md" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-xs">
            No business selected
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please select a business to continue
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header with Title and Tabs */}
      <div className="flex-shrink-0 space-y-md pb-md">
        <div className="space-y-xs">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-sm">
            <Truck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            Procurement
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage suppliers and purchase orders
          </p>
        </div>
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-lg">
          {activeTab === 0 && <SuppliersTab businessId={businessId} />}
          {activeTab === 1 && <PurchaseOrdersTab businessId={businessId} />}
        </div>
      </div>
    </div>
  );
};

export default ProcurementPage;
