import React, { useEffect } from "react";
import { listAppointmentsByBusiness } from "../../services/appointmentService";
import { Appointment } from "../../data/types";
import Table, { Column } from "../../components/Table";
import { useApi } from "../../hooks";
import { useActiveBusinessId } from "../../contexts/ActiveBusinessContext";

const AppointmentsPage: React.FC = () => {
  const businessId = useActiveBusinessId();
  const { data, error, loading, request } = useApi<Appointment[]>(
    listAppointmentsByBusiness,
  );

  useEffect(() => {
    if (businessId) request(businessId);
  }, [businessId, request]);

  const columns: Column<Appointment>[] = [
    { header: "Customer", accessor: "customer_id" },
    {
      header: "Scheduled",
      accessor: (row) => new Date(row.scheduled_at).toLocaleString(),
    },
    { header: "Status", accessor: "status" },
    { header: "Notes", accessor: (row) => row.notes || "—" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Appointments</h2>
      <Table
        columns={columns}
        data={data || []}
        error={error}
        loading={loading}
      />
    </div>
  );
};

export default AppointmentsPage;
