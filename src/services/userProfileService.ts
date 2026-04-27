// services/userProfileService.ts
import { supabase } from "../lib/supabase";
import type { UserProfile, UserProfileInsert } from "../data/types";

export async function getUserProfileById(userId: string) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .is("deleted_at", null)
    .single();
  return { data: data as UserProfile | null, error };
}

export async function listUserProfilesByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null);
  return { data: data as UserProfile[] | null, error };
}

export async function createUserProfile(profile: UserProfileInsert) {
  const { data, error } = await supabase
    .from("user_profiles")
    .insert(profile)
    .select()
    .single();
  return { data: data as UserProfile | null, error };
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfileInsert, "id" | "created_at">>,
) {
  const { data, error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", userId)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as UserProfile | null, error };
}

export async function softDeleteUserProfile(userId: string) {
  const { error } = await supabase
    .from("user_profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", userId);
  return { error };
}
