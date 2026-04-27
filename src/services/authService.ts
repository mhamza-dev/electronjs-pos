// authService.ts
// Functional exports – no classes. Uses the existing Supabase client from your project.
// Assumes you have a file that exports `supabase` (e.g. '../lib/supabaseClient').

import { supabase } from "../lib/supabase"; // adjust import path
import type { User, Session, AuthError } from "@supabase/supabase-js";
import type {
  BusinessType,
  UserRole,
  UserProfile,
  Business,
  Branch,
  UserProfileInsert,
  BusinessInsert,
} from "../data/types"; // adjust import path

// ── Public parameter / response types ──────────────────────────

export interface SignUpParams {
  email: string;
  password: string;
  full_name?: string;
  /** Required when creating a new business – ignored if business_id is provided */
  business_name?: string;
  business_type?: BusinessType;
  /** Provide if the user is joining an existing business (invite) */
  business_id?: string;
  branch_id?: string; // optional, only if joining an existing business
  role?: UserRole; // defaults to 'owner' when creating a business, 'staff' otherwise
  phone?: string;
  timezone?: string;
  currency?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  profile?: UserProfile | null;
  business?: Business | null;
  error?: AuthError | Error;
}

export interface UserProfileWithRelations extends UserProfile {
  business?: Business;
  branch?: Branch | null;
}

// ── Internal helpers ───────────────────────────────────────────

function defaultRole(hasBusinessId: boolean, paramRole?: UserRole): UserRole {
  if (paramRole) return paramRole;
  return hasBusinessId ? "staff" : "owner";
}

// authService.ts

async function getProfile(
  userId: string,
): Promise<UserProfileWithRelations | null> {
  // 1. Fetch the raw user profile
  console.log("USERID ->", userId);
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  console.log(error);
  console.log("profile 1", profile);
  if (error || !profile) {
    if (error) console.error("Error fetching user profile:", error);
    return null;
  }
  console.log("profile 2", profile);

  const result: UserProfileWithRelations = {
    ...profile,
  } as UserProfileWithRelations;

  // 2. Fetch related business (if any)
  if (profile.business_id) {
    const { data: business } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", profile.business_id)
      .is("deleted_at", null)
      .maybeSingle();
    result.business = business ?? undefined;
  }

  // 3. Fetch related branch (if any)
  if (profile.branch_id) {
    const { data: branch } = await supabase
      .from("branches")
      .select("*")
      .eq("id", profile.branch_id)
      .is("deleted_at", null)
      .maybeSingle();
    result.branch = branch ?? undefined;
  }

  return result;
}
// ── Public API functions ───────────────────────────────────────

/**
 * Sign up a new user and optionally set up a business.
 *
 * - If `business_id` is provided the user is attached to that existing business.
 * - If `business_id` is missing a new business is created and the user becomes its owner.
 */
export async function signUpWithBusiness(
  params: SignUpParams,
): Promise<AuthResponse> {
  // 1. Create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        full_name: params.full_name,
        phone: params.phone,
      },
    },
  });

  if (authError) {
    return { user: null, session: null, error: authError };
  }
  if (!authData.user) {
    return {
      user: null,
      session: null,
      error: new Error("Sign-up succeeded but no user returned."),
    };
  }

  const user = authData.user;
  const isJoiningExisting = !!params.business_id;
  let businessId = params.business_id;

  // 2. If no businessId, create a new business
  if (!isJoiningExisting) {
    if (!params.business_name || !params.business_type) {
      return {
        user,
        session: authData.session,
        error: new Error(
          "business_name and business_type are required when creating a new business",
        ),
      };
    }

    const businessInsert: Omit<BusinessInsert, "address"> = {
      name: params.business_name,
      type: params.business_type,
      owner_id: user.id,
      email: params.email,
      phone: params.phone ?? null,
      timezone: params.timezone ?? "Asia/Karachi",
      currency: params.currency ?? "PKR",
      // address left as null – can be updated later
    };

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .insert(businessInsert)
      .select("id")
      .single();

    if (businessError) {
      // Auth user is already created – ideally you would clean up here,
      // but for simplicity we return the error.
      return { user, session: authData.session, error: businessError };
    }
    businessId = business.id;
  }

  // 3. Create the user profile
  const profileInsert: UserProfileInsert = {
    business_id: businessId!,
    branch_id: isJoiningExisting ? (params.branch_id ?? null) : null,
    role: defaultRole(isJoiningExisting, params.role),
    full_name: params.full_name ?? null,
    email: params.email,
    phone: params.phone ?? null,
    is_active: true,
  };

  const { error: profileError } = await supabase
    .from("user_profiles")
    .insert(profileInsert);

  if (profileError) {
    return { user, session: authData.session, error: profileError };
  }

  // 4. Return the full profile (optional – caller might want it)
  const profile = await getProfile(user.id);
  return {
    user,
    session: authData.session,
    profile: profile ?? undefined,
  };
}

/**
 * Sign in an existing user and fetch their profile (with business & branch).
 */
export async function signIn(params: SignInParams): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });

  if (error) {
    return { user: null, session: null, error };
  }

  const { user, session } = data;
  if (!user) {
    return {
      user: null,
      session: null,
      error: new Error("Sign-in succeeded but no user returned."),
    };
  }

  const profile = await getProfile(user.id);
  console.log("In SIGN_IN GET PROFILE", profile);
  return {
    user,
    session,
    profile: profile ?? undefined,
    business: profile?.business ?? undefined,
  };
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get the current session (tokens, user id, etc.).
 */
export async function getSession(): Promise<{
  session: Session | null;
  error: AuthError | null;
}> {
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session ?? null, error };
}

/**
 * Get the currently authenticated user (Supabase auth object).
 */
export async function getUser(): Promise<{
  user: User | null;
  error: AuthError | null;
}> {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user ?? null, error };
}

/**
 * Fetch the full profile of the currently authenticated user,
 * including business and branch information.
 */
export async function getCurrentUserProfile(): Promise<{
  profile: UserProfileWithRelations | null;
  error: Error | null;
}> {
  const { user, error } = await getUser();
  if (error || !user) {
    return { profile: null, error: error ?? new Error("Not authenticated") };
  }
  const profile = await getProfile(user.id);
  return { profile, error: null };
}

/**
 * Update specific fields of the user profile.
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, "id" | "created_at">>,
): Promise<{
  profile: UserProfileWithRelations | null;
  error: Error | null;
}> {
  const { error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", userId)
    .is("deleted_at", null);

  if (error) {
    return { profile: null, error };
  }
  const profile = await getProfile(userId);
  return { profile, error: null };
}

/**
 * Send a password reset email to the given address.
 */
export async function resetPasswordForEmail(
  email: string,
  redirectTo?: string,
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  return { error };
}

/**
 * Update the password for the currently logged-in user.
 * (Requires a recent login – Supabase enforces this.)
 */
export async function updatePassword(
  newPassword: string,
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { error };
}

/**
 * Refresh the current session (useful when tokens are about to expire).
 */
export async function refreshSession(): Promise<{
  session: Session | null;
  error: AuthError | null;
}> {
  const { data, error } = await supabase.auth.refreshSession();
  return { session: data?.session ?? null, error };
}
