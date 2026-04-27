import React, { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingBag,
  Users,
  ClipboardList,
  PackageCheck,
} from "lucide-react";
import Card from "../../components/Card";
import { listSalesByBusiness } from "../../services/saleService";
import { listCustomersByBusiness } from "../../services/customerService";
import { listAppointmentsByBusiness } from "../../services/appointmentService";
import { listProductsByBusiness } from "../../services/productService";
import { useActiveBusinessId } from "../../contexts/ActiveBusinessContext";

const DashboardAnalytics: React.FC = () => {
  const businessId = useActiveBusinessId();
  const [stats, setStats] = useState({
    totalSalesToday: 0,
    ordersToday: 0,
    customers: 0,
    appointments: 0,
    lowStock: 0,
    loading: true,
  });

  useEffect(() => {
    if (!businessId) return;
    const fetch = async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const [salesRes, custRes, apptRes, prodRes] = await Promise.all([
        listSalesByBusiness(businessId),
        listCustomersByBusiness(businessId),
        listAppointmentsByBusiness(businessId),
        listProductsByBusiness(businessId),
      ]);
      const todaySales = (salesRes.data ?? []).filter(
        (s) => s.created_at && new Date(s.created_at) >= todayStart,
      );
      setStats({
        totalSalesToday: todaySales.reduce((sum, s) => sum + (s.total ?? 0), 0),
        ordersToday: todaySales.length,
        customers: (custRes.data ?? []).length,
        appointments: (apptRes.data ?? []).filter(
          (a) => a.scheduled_at && new Date(a.scheduled_at) >= todayStart,
        ).length,
        lowStock: (prodRes.data ?? []).filter(
          (p) => p.is_active && p.stock_quantity <= p.reorder_level,
        ).length,
        loading: false,
      });
    };
    fetch();
  }, [businessId]);

  const cards = [
    {
      title: "Today's Sales",
      value: stats.loading ? "..." : `$${stats.totalSalesToday.toFixed(2)}`,
      icon: <DollarSign className="w-5 h-5" />,
      description: "today",
    },
    {
      title: "Orders",
      value: stats.loading ? "..." : stats.ordersToday,
      icon: <ShoppingBag className="w-5 h-5" />,
      description: "today",
    },
    {
      title: "Customers",
      value: stats.loading ? "..." : stats.customers,
      icon: <Users className="w-5 h-5" />,
      description: "active",
    },
    {
      title: "Appointments",
      value: stats.loading ? "..." : stats.appointments,
      icon: <ClipboardList className="w-5 h-5" />,
      description: "upcoming",
    },
    {
      title: "Low Stock",
      value: stats.loading ? "..." : stats.lowStock,
      icon: <PackageCheck className="w-5 h-5 text-orange-500" />,
      description: "need reorder",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Welcome back 👋</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>
    </div>
  );
};

export default DashboardAnalytics;
