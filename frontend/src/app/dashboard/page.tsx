'use client';

import { useQuery } from "@tanstack/react-query";
import { Clock, CheckCircle, Package, XCircle, Warehouse, TrendingUp, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { SkeletonLotTable } from "@/components/ui/skeleton-lot-table";

export default function DashboardOverview() {
  const { token, user } = useAuth();

  const { data: statusSummary, isLoading: loadingStatus } = useQuery({
    queryKey: ["analytics", "lot-status-summary"],
    queryFn: () => apiRequest("/analytics/lot-status-summary", "GET", undefined, token as string),
    enabled: !!token,
  });

  const { data: rejectionRates, isLoading: loadingQC } = useQuery({
    queryKey: ["analytics", "qc-rejection-rate"],
    queryFn: () => apiRequest("/analytics/qc-rejection-rate", "GET", undefined, token as string),
    enabled: !!token,
  });

  const { data: warehouseUtil, isLoading: loadingWH } = useQuery({
    queryKey: ["analytics", "warehouse-utilization"],
    queryFn: () => apiRequest("/analytics/warehouse-utilization", "GET", undefined, token as string),
    enabled: !!token,
  });

  const isLoading = loadingStatus || loadingQC || loadingWH;

  if (isLoading) {
    return <SkeletonLotTable />;
  }

  // Parse Status Summary
  const statusDict: Record<string, number> = {};
  if (statusSummary) {
    statusSummary.forEach((item: any) => {
      statusDict[item.status] = item.total_lots;
    });
  }

  const pendingCount = statusDict["PENDING_QC"] || 0;
  const approvedCount = statusDict["APPROVED"] || 0;
  const productionCount = statusDict["IN_PRODUCTION"] || 0;
  const rejectedCount = statusDict["REJECTED"] || 0;
  const deliveredCount = statusDict["DELIVERED"] || 0;

  const summaryCards = [
    {
      title: "Pending QC",
      value: pendingCount.toString(),
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-100/50",
    },
    {
      title: "Approved / Ready",
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

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Welcome back, {user?.username || 'User'}!</h2>
        <p className="text-muted-foreground">Here is the latest overview of the warehouse and production operations.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QC Rejection Analytics */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 border-b border-border bg-slate-50/50 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-base sm:text-lg font-bold text-foreground">QC Rejection Rates (This Month)</h2>
          </div>
          <div className="p-6 flex-1">
            {rejectionRates && rejectionRates.length > 0 ? (
              <div className="space-y-4">
                {rejectionRates.map((item: any) => (
                  <div key={item.material}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">{item.material}</span>
                      <span className="font-bold text-muted-foreground">{item.rejection_rate_pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.rejection_rate_pct > 10 ? 'bg-red-500' : 'bg-primary'}`} 
                        style={{ width: `${Math.min(item.rejection_rate_pct, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {item.total_lots} total lots checked
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <CheckCircle className="w-8 h-8 mb-2 text-green-500/50" />
                <p>No rejections recorded this month.</p>
              </div>
            )}
          </div>
        </div>

        {/* Warehouse Utilization */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 border-b border-border bg-slate-50/50 flex items-center gap-3">
            <Warehouse className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-foreground">Warehouse Utilization</h2>
          </div>
          <div className="p-6 flex flex-col items-center justify-center flex-1">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke="currentColor" strokeWidth="12" fill="transparent" 
                  className="text-slate-100" 
                />
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke="currentColor" strokeWidth="12" fill="transparent" 
                  strokeDasharray={`${(warehouseUtil?.occupied_slots || 0) * 10} 251.2`} 
                  className="text-blue-500 transition-all duration-1000 ease-out" 
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-foreground">{warehouseUtil?.occupied_slots || 0}</span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">Slots Used</span>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between w-full px-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{productionCount}</p>
                <p className="text-xs font-medium text-muted-foreground uppercase">Lots in Production</p>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{deliveredCount}</p>
                <p className="text-xs font-medium text-muted-foreground uppercase">Lots Delivered</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
