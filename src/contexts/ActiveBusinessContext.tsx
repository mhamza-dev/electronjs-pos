// contexts/ActiveBusinessContext.tsx
import React, { createContext, useContext } from "react";

const ActiveBusinessContext = createContext<string | undefined>(undefined);

export const ActiveBusinessProvider: React.FC<{
  businessId: string;
  children: React.ReactNode;
}> = ({ businessId, children }) => (
  <ActiveBusinessContext.Provider value={businessId}>
    {children}
  </ActiveBusinessContext.Provider>
);

export const useActiveBusinessId = () => {
  const id = useContext(ActiveBusinessContext);
  if (id === undefined) {
    throw new Error(
      "useActiveBusinessId must be used within an ActiveBusinessProvider",
    );
  }
  return id;
};
