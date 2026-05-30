'use client';

import { useQuery } from "@tanstack/react-query";
import { Clock, CheckCircle, Package, XCircle, Warehouse, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { SkeletonLotTable } from "@/components/ui/skeleton-lot-table";
import { useRouter } from "next/navigation";

export default function DashboardOverview() {
  const { token, user } = useAuth();
  const router = useRouter();

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

  const { data: recentLots, isLoading: loadingRecent } = useQuery({
    queryKey: ["lots", "recent"],
    queryFn: () => apiRequest("/lots?limit=5", "GET", undefined, token as string),
    enabled: !!token,
  });

  const isLoading = loadingStatus || loadingQC || loadingWH || loadingRecent;

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
      bgColor: "bg-amber-50",
      path: "/dashboard/qc"
    },
    {
      title: "Approved / Ready",
      value: approvedCount.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      path: "/dashboard/ppic"
    },
    {
      title: "In Production",
      value: productionCount.toString(),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      path: "/dashboard/ppic"
    },
    {
      title: "Rejected Lots",
      value: rejectedCount.toString(),
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      path: "/dashboard/qc"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_QC": return "bg-amber-100 text-amber-700 border-amber-200";
      case "APPROVED": return "bg-green-100 text-green-700 border-green-200";
      case "IN_PRODUCTION": return "bg-blue-100 text-blue-700 border-blue-200";
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
      case "DELIVERED": return "bg-slate-100 text-slate-700 border-slate-200";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">Welcome, {user?.username || 'User'}!</h2>
        <p className="text-muted-foreground mt-1">Sima Arome ERP Lite — Enterprise Control Center</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <button 
              key={card.title} 
              onClick={() => router.push(card.path)}
              className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-3xl font-bold mb-1 text-foreground">{card.value}</div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{card.title}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* QC Rejection Analytics */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Rejection Rates</h2>
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Current Month</span>
          </div>
          <div className="p-6 flex-1">
            {rejectionRates && rejectionRates.length > 0 ? (
              <div className="space-y-6">
                {rejectionRates.map((item: any) => (
                  <div key={item.material}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold text-foreground">{item.material}</span>
                      <span className={`font-bold ${item.rejection_rate_pct > 15 ? 'text-red-600' : 'text-slate-600'}`}>
                        {item.rejection_rate_pct}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-1000 ${item.rejection_rate_pct > 15 ? 'bg-red-500' : 'bg-primary'}`} 
                        style={{ width: `${Math.min(item.rejection_rate_pct, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                        {item.total_lots} lots inspected
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-10 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mb-3 text-green-500/20" />
                <p className="font-medium">No rejections recorded.</p>
              </div>
            )}
          </div>
        </div>

        {/* Warehouse Utilization */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Warehouse className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Storage Capacity</h2>
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Real-time</span>
          </div>
          <div className="p-6 flex flex-col items-center justify-center flex-1">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke="currentColor" strokeWidth="10" fill="transparent" 
                  className="text-slate-100" 
                />
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke="currentColor" strokeWidth="10" fill="transparent" 
                  strokeDasharray={`${(warehouseUtil?.occupied_slots || 0) * 5} 251.2`} 
                  className="text-primary transition-all duration-1000 ease-out" 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-foreground tracking-tighter">{warehouseUtil?.occupied_slots || 0}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Slots Used</span>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-8 w-full">
              <div className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-bold text-foreground">{productionCount}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">In Production</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-bold text-foreground">{deliveredCount}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Dispatched</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-slate-600" />
              </div>
            <h2 className="text-lg font-bold text-foreground">Recent Material Inflow</h2>
          </div>
          <button 
            onClick={() => router.push("/dashboard/intake")}
            className="text-xs font-bold text-primary hover:underline uppercase tracking-widest"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-slate-50/30">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Lot Number</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Material</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentLots && recentLots.length > 0 ? (
                recentLots.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-foreground">{item.lot_number}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{item.material?.name || "Unknown"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tight ${getStatusColor(item.status)}`}>
                        {item.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-medium text-right">{formatDate(item.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground italic font-medium">No recent activity found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
