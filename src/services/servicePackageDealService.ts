// services/servicePackageDealService.ts
import { supabase } from "../lib/supabase";
import type {
  ServiceInsert,
  Service,
  PackageInsert,
  Package,
  DealInsert,
  Deal,
  DealServiceInsert,
  DealService,
} from "../data/types";

// ── Services ────────────────────────────────────────────────────
export async function getServiceById(id: string) {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as Service | null, error };
}

export async function listServicesByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null);
  return { data: data as Service[] | null, error };
}

export async function createService(service: ServiceInsert) {
  const { data, error } = await supabase
    .from("services")
    .insert(service)
    .select()
    .single();
  return { data: data as Service | null, error };
}

export async function updateService(
  id: string,
  updates: Partial<ServiceInsert>,
) {
  const { data, error } = await supabase
    .from("services")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as Service | null, error };
}

export async function softDeleteService(id: string) {
  const { error } = await supabase
    .from("services")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}

// ── Packages ────────────────────────────────────────────────────
export async function getPackageById(id: string) {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as Package | null, error };
}

export async function listPackagesByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null);
  return { data: data as Package[] | null, error };
}

export async function createPackage(pkg: PackageInsert) {
  const { data, error } = await supabase
    .from("packages")
    .insert(pkg)
    .select()
    .single();
  return { data: data as Package | null, error };
}

export async function updatePackage(
  id: string,
  updates: Partial<PackageInsert>,
) {
  const { data, error } = await supabase
    .from("packages")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as Package | null, error };
}

export async function softDeletePackage(id: string) {
  const { error } = await supabase
    .from("packages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}

// ── Deals ───────────────────────────────────────────────────────
export async function getDealById(id: string) {
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as Deal | null, error };
}

export async function listDealsByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null);
  return { data: data as Deal[] | null, error };
}

export async function createDeal(deal: DealInsert) {
  const { data, error } = await supabase
    .from("deals")
    .insert(deal)
    .select()
    .single();
  return { data: data as Deal | null, error };
}

export async function updateDeal(id: string, updates: Partial<DealInsert>) {
  const { data, error } = await supabase
    .from("deals")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as Deal | null, error };
}

export async function softDeleteDeal(id: string) {
  const { error } = await supabase
    .from("deals")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}

// ── Deal Services ───────────────────────────────────────────────
export async function listServicesOfDeal(dealId: string) {
  const { data, error } = await supabase
    .from("deal_services")
    .select("*")
    .eq("deal_id", dealId)
    .is("deleted_at", null);
  return { data: data as DealService[] | null, error };
}

export async function addServiceToDeal(ds: DealServiceInsert) {
  const { data, error } = await supabase
    .from("deal_services")
    .insert(ds)
    .select()
    .single();
  return { data: data as DealService | null, error };
}

export async function updateDealService(
  dealId: string,
  serviceId: string,
  updates: Partial<DealServiceInsert>,
) {
  const { data, error } = await supabase
    .from("deal_services")
    .update(updates)
    .eq("deal_id", dealId)
    .eq("service_id", serviceId)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as DealService | null, error };
}

export async function removeServiceFromDeal(dealId: string, serviceId: string) {
  const { error } = await supabase
    .from("deal_services")
    .update({ deleted_at: new Date().toISOString() })
    .eq("deal_id", dealId)
    .eq("service_id", serviceId);
  return { error };
}
