// services/appointmentService.ts
import { supabase } from "../lib/supabase";
import type { Appointment, AppointmentInsert } from "../data/types";

export async function getAppointmentById(id: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as Appointment | null, error };
}

export async function listAppointmentsByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null);
  return { data: data as Appointment[] | null, error };
}

export async function listAppointmentsByCustomer(customerId: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("customer_id", customerId)
    .is("deleted_at", null);
  return { data: data as Appointment[] | null, error };
}

export async function createAppointment(appointment: AppointmentInsert) {
  const { data, error } = await supabase
    .from("appointments")
    .insert(appointment)
    .select()
    .single();
  return { data: data as Appointment | null, error };
}

export async function updateAppointment(
  id: string,
  updates: Partial<AppointmentInsert>,
) {
  const { data, error } = await supabase
    .from("appointments")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as Appointment | null, error };
}

export async function softDeleteAppointment(id: string) {
  const { error } = await supabase
    .from("appointments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}
