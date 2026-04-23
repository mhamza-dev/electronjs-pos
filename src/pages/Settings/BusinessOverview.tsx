import React, { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { authService, businessService } from "../../services";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/Buttons";
import { CreateBusinessModal } from "../../components/Modals";
import { OrgBusiness } from "../../data/type";

const BusinessesOverview: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    data: businesses,
    loading: fetching,
    request: fetchBusinesses,
  } = useAPI(businessService.getUserBusinesses);

  const { request: switchBusiness, loading: switching } = useAPI(
    authService.switchBusiness,
  );

  useEffect(() => {
    if (profile?.id) {
      fetchBusinesses(profile!.id);
    }
  }, [profile?.id]);

  const handleSwitch = async (businessId: string) => {
    if (!profile?.id) return;
    await switchBusiness(profile.id, businessId);
    await refreshProfile();
  };

  // Loading skeleton
  if (fetching && !businesses) {
    return (
      <div className="space-y-lg">
        <div className="space-y-xs">
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
        </div>
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-lg animate-pulse"
            >
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-sm" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-md" />
              <div className="flex justify-between items-center mt-md">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-xs">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Your Businesses
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Switch between your businesses or create a new one
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="shadow-sm"
        >
          <svg
            className="w-4 h-4 mr-xs"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Business
        </Button>
      </div>

      {/* Businesses Grid */}
      {businesses && businesses.length > 0 ? (
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business: OrgBusiness) => {
            const isActive = business.id === profile?.current_business_id;

            return (
              <div
                key={business.id}
                className={`relative bg-white dark:bg-gray-800 border rounded-xl p-lg transition-all hover:shadow-md dark:hover:shadow-gray-900/50 ${
                  isActive
                    ? "border-primary-500 dark:border-primary-400 ring-1 ring-primary-200 dark:ring-primary-800"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                {/* Active indicator badge */}
                {isActive && (
                  <div className="absolute -top-3 left-4 z-10">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium 
                        bg-background dark:bg-surface 
                        text-primary-600 dark:text-primary-300 
                        border border-primary-300 dark:border-primary-700 
                        shadow-sm backdrop-blur`}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Current
                    </span>
                  </div>
                )}

                {/* Business Info */}
                <div className="mb-md">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {business.business_name}
                  </h3>
                  {business.legal_name && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-xs truncate">
                      {business.legal_name}
                    </p>
                  )}
                  <div className="flex items-center gap-sm mt-sm text-xs text-gray-400 dark:text-gray-500">
                    <span className="inline-flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {business.timezone}
                    </span>
                    <span>•</span>
                    <span>{business.currency_code}</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-sm border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {business.status === "active" ? "Active" : business.status}
                  </span>
                  <Button
                    variant={isActive ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => handleSwitch(business.id)}
                    disabled={isActive || switching}
                    loading={switching && isActive === false} // show loading on the one being switched
                  >
                    {isActive ? "Current" : "Switch"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-3xl px-lg text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-lg">
            <svg
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-xs">
            No businesses yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-lg">
            Create your first business to get started
          </p>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <svg
              className="w-4 h-4 mr-xs"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Business
          </Button>
        </div>
      )}

      {/* Create Business Modal */}
      {showCreateModal && (
        <CreateBusinessModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            fetchBusinesses(profile!.id);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default BusinessesOverview;
