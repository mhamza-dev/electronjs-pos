import React, { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { authService, businessService } from "../../services";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/Buttons";
import { CreateBusinessModal } from "../../components/Modals";

const BusinessesOverview: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const { data: businesses, request: fetchBusinesses } = useAPI(() =>
    businessService.getUserBusinesses(profile!.id),
  );
  const { request: switchBusiness } = useAPI(authService.switchBusiness);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleSwitch = async (businessId: string) => {
    await switchBusiness(profile!.id, businessId);
    await refreshProfile();
    // Optionally navigate to dashboard
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Businesses</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          Create New Business
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {businesses?.map((b) => (
          <div
            key={b.id}
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-medium">{b.business_name}</h3>
              <p className="text-sm text-gray-500">{b.legal_name}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => handleSwitch(b.id)}
              disabled={b.id === profile?.current_business_id}
            >
              {b.id === profile?.current_business_id ? "Current" : "Switch"}
            </Button>
          </div>
        ))}
      </div>
      {showCreateModal && (
        <CreateBusinessModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            fetchBusinesses();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default BusinessesOverview;
