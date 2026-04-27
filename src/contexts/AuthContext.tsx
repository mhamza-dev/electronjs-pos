// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { signOut as authSignOut } from "../services/authService";
import type { UserProfile } from "../data/types";

// ── Business with branches tree ──────────────────────────────
interface BusinessBranch {
  id: string;
  name: string;
}

interface BusinessInfo {
  business_id: string;
  name: string;
  branches: BusinessBranch[];
}

// ── Auth context shape ───────────────────────────────────────
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null; // user's current business profile
  businesses: BusinessInfo[]; // businesses user can switch to
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [businesses, setBusinesses] = useState<BusinessInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch user's primary business (from user_profiles) ─────
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch user profile:", error);
      return null;
    }
    return data as UserProfile | null;
  };

  // ── Fetch all businesses the user can access ────────────────
  const fetchBusinesses = async (
    userId: string,
    primaryBusinessId?: string,
  ) => {
    // 1. Get businesses owned by the user
    const { data: ownedBusinesses, error: ownedError } = await supabase
      .from("businesses")
      .select("id, name")
      .eq("owner_id", userId)
      .is("deleted_at", null);

    if (ownedError) {
      console.error("Failed to fetch owned businesses:", ownedError);
      return [];
    }

    const businessIds = ownedBusinesses?.map((b) => b.id) ?? [];

    // Ensure the user's primary business (from profile) is included, even if not owner
    if (primaryBusinessId && !businessIds.includes(primaryBusinessId)) {
      businessIds.push(primaryBusinessId);
      // We'll need the name later; we can fetch it, but for simplicity we'll trust
    }

    if (businessIds.length === 0) return [];

    // 2. For each business, fetch its branches
    const businessInfos: BusinessInfo[] = [];
    for (const bizId of businessIds) {
      let bizName = ownedBusinesses?.find((b) => b.id === bizId)?.name;
      if (!bizName && bizId === primaryBusinessId) {
        // Fetch the primary business name if not in owned list
        const { data: primaryBiz } = await supabase
          .from("businesses")
          .select("name")
          .eq("id", bizId)
          .single();
        bizName = primaryBiz?.name ?? "Unknown Business";
      }
      if (!bizName) continue;

      const { data: branches } = await supabase
        .from("branches")
        .select("id, name")
        .eq("business_id", bizId)
        .is("deleted_at", null);

      businessInfos.push({
        business_id: bizId,
        name: bizName,
        branches: branches ?? [],
      });
    }

    return businessInfos;
  };

  // ── Initialise on mount and auth state change ──────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const prof = await fetchProfile(session.user.id);
        setProfile(prof);
        const bus = await fetchBusinesses(session.user.id, prof?.business_id);
        setBusinesses(bus);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const prof = await fetchProfile(session.user.id);
        setProfile(prof);
        const bus = await fetchBusinesses(session.user.id, prof?.business_id);
        setBusinesses(bus);
      } else {
        setProfile(null);
        setBusinesses([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await authSignOut();
  };

  const refreshProfile = async () => {
    if (!user) return;
    const prof = await fetchProfile(user.id);
    setProfile(prof);
    const bus = await fetchBusinesses(user.id, prof?.business_id);
    setBusinesses(bus);
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    businesses,
    loading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
