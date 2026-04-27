// services/auditLogService.ts
import { supabase } from "../lib/supabase";
import type { AuditLog, AuditLogInsert } from "../data/types";

export async function getAuditLogById(id: string) {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as AuditLog | null, error };
}

export async function listAuditLogsByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null);
  return { data: data as AuditLog[] | null, error };
}

export async function listAuditLogsByUser(userId: string) {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null);
  return { data: data as AuditLog[] | null, error };
}

export async function createAuditLog(log: AuditLogInsert) {
  const { data, error } = await supabase
    .from("audit_logs")
    .insert(log)
    .select()
    .single();
  return { data: data as AuditLog | null, error };
}

export async function softDeleteAuditLog(id: string) {
  const { error } = await supabase
    .from("audit_logs")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}
