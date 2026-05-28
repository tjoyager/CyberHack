'use client';

import { useQuery } from "@tanstack/react-query";
import { Clock, CheckCircle, Package, XCircle } from "lucide-react";
import { getLots } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { SkeletonLotTable } from "@/components/ui/skeleton-lot-table";
import { formatDistanceToNow } from "date-fns";

export default function DashboardOverview() {
  const { token, user } = useAuth();

  const { data: lots, isLoading, error } = useQuery({
    queryKey: ["lots"],
    queryFn: () => getLots(token as string),
    enabled: !!token,
    refetchInterval: 30000, // auto refresh every 30s
  });

  if (isLoading) {
    return <SkeletonLotTable />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-lg">
        Error loading dashboard data. Please try again.
      </div>
    );
  }

  const safeLots = lots || [];

  // Calculate summary stats
  const pendingCount = safeLots.filter((lot: any) => lot.status === "PENDING_QC").length;
  const approvedCount = safeLots.filter((lot: any) => lot.status === "APPROVED").length;
  const productionCount = safeLots.filter((lot: any) => lot.status === "IN_PRODUCTION").length;
  const rejectedCount = safeLots.filter((lot: any) => lot.status === "REJECTED").length;

  const summaryCards = [
    {
      title: "Pending QC",
      value: pendingCount.toString(),
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-100/50",
    },
    {
      title: "Approved Lots",
      value: approvedCount.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100/50",
    },
    {
      title: "In Production",
      value: productionCount.toString(),
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Rejected Lots",
      value: rejectedCount.toString(),
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_QC": return "bg-amber-100 text-amber-700 border-amber-200";
      case "APPROVED": return "bg-green-100 text-green-700 border-green-200";
      case "IN_PRODUCTION": return "bg-blue-100 text-blue-700 border-blue-200";
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Sort by created_at descending
  const recentActivity = [...safeLots].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 10);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Welcome back, {user?.username || 'User'}!</h2>
        <p className="text-muted-foreground">Here is the latest overview of the warehouse operations.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1 text-foreground">{card.value}</div>
              <div className="text-sm font-medium text-muted-foreground">{card.title}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border bg-slate-50/50">
          <h2 className="text-base sm:text-lg font-bold text-foreground">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Lot Number</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Material</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No lots found in the system.
                  </td>
                </tr>
              ) : (
                recentActivity.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">{item.lot_number}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{item.material_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(item.status)}`}>
                        {item.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
