// services/medicalService.ts
import { supabase } from "../lib/supabase";
import type {
  Doctor,
  DoctorInsert,
  MedicalRecord,
  MedicalRecordInsert,
} from "../data/types";

// ── Doctors ─────────────────────────────────────────────────────
export async function getDoctorById(id: string) {
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as Doctor | null, error };
}

export async function listDoctorsByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null);
  return { data: data as Doctor[] | null, error };
}

export async function createDoctor(doctor: DoctorInsert) {
  const { data, error } = await supabase
    .from("doctors")
    .insert(doctor)
    .select()
    .single();
  return { data: data as Doctor | null, error };
}

export async function updateDoctor(id: string, updates: Partial<DoctorInsert>) {
  const { data, error } = await supabase
    .from("doctors")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as Doctor | null, error };
}

export async function softDeleteDoctor(id: string) {
  const { error } = await supabase
    .from("doctors")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}

// ── Medical Records ─────────────────────────────────────────────
export async function getMedicalRecordById(id: string) {
  const { data, error } = await supabase
    .from("medical_records")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as MedicalRecord | null, error };
}

export async function listMedicalRecordsByCustomer(customerId: string) {
  const { data, error } = await supabase
    .from("medical_records")
    .select("*")
    .eq("customer_id", customerId)
    .is("deleted_at", null);
  return { data: data as MedicalRecord[] | null, error };
}

export async function listMedicalRecordsByDoctor(doctorId: string) {
  const { data, error } = await supabase
    .from("medical_records")
    .select("*")
    .eq("doctor_id", doctorId)
    .is("deleted_at", null);
  return { data: data as MedicalRecord[] | null, error };
}

export async function listMedicalRecordsByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("medical_records")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null);
  return { data: data as MedicalRecord[] | null, error };
}

export async function createMedicalRecord(record: MedicalRecordInsert) {
  const { data, error } = await supabase
    .from("medical_records")
    .insert(record)
    .select()
    .single();
  return { data: data as MedicalRecord | null, error };
}

export async function updateMedicalRecord(
  id: string,
  updates: Partial<MedicalRecordInsert>,
) {
  const { data, error } = await supabase
    .from("medical_records")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as MedicalRecord | null, error };
}

export async function softDeleteMedicalRecord(id: string) {
  const { error } = await supabase
    .from("medical_records")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}
