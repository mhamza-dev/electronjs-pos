import React, { useEffect } from "react";
import { listMedicalRecordsByBusiness } from "../../services/medicalService";
import { MedicalRecord } from "../../data/types";
import Table, { Column } from "../../components/Table";
import { useApi } from "../../hooks";
import { useActiveBusinessId } from "../../contexts/ActiveBusinessContext";

const MedicalPage: React.FC = () => {
  const businessId = useActiveBusinessId();
  const { data, error, loading, request } = useApi<MedicalRecord[]>(
    listMedicalRecordsByBusiness,
  );

  useEffect(() => {
    if (businessId) request(businessId);
  }, [businessId, request]);

  const columns: Column<MedicalRecord>[] = [
    { header: "Customer", accessor: "customer_id" },
    { header: "Doctor", accessor: "doctor_id" },
    { header: "Diagnosis", accessor: (row) => row.diagnosis || "—" },
    {
      header: "Created",
      accessor: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Medical Records</h2>
      <Table
        columns={columns}
        data={data || []}
        error={error}
        loading={loading}
      />
    </div>
  );
};

export default MedicalPage;
