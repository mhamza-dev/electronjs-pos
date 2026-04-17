// services/auditService.ts
import { supabase } from "../lib/supabase";
import { SysAuditLog } from "../data/type";

export const auditService = {
  async getLogs(
    businessId: string,
    filters?: {
      actorUserId?: string;
      entityType?: string;
      fromDate?: string;
      limit?: number;
    },
  ): Promise<SysAuditLog[]> {
    let query = supabase
      .from("sys_audit_logs")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (filters?.actorUserId)
      query = query.eq("actor_user_id", filters.actorUserId);
    if (filters?.entityType)
      query = query.eq("entity_type", filters.entityType);
    if (filters?.fromDate) query = query.gte("created_at", filters.fromDate);
    if (filters?.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async logAction(
    businessId: string,
    actorUserId: string,
    action: string,
    entityType: string,
    entityId: string,
    beforeData?: any,
    afterData?: any,
  ): Promise<void> {
    const { error } = await supabase.from("sys_audit_logs").insert({
      business_id: businessId,
      actor_user_id: actorUserId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      before_data: beforeData || null,
      after_data: afterData || null,
      request_id: crypto.randomUUID ? crypto.randomUUID() : undefined,
    });
    if (error) throw error;
  },
};
