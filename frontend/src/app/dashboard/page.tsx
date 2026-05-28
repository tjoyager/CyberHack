'use client';

import { Clock, CheckCircle, Package, XCircle } from "lucide-react";

export default function DashboardOverview() {
  const summaryCards = [
    {
      title: "Pending QC",
      value: "24",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-100/50",
    },
    {
      title: "Approved Lots",
      value: "156",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100/50",
    },
    {
      title: "In Production",
      value: "42",
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Rejected Lots",
      value: "3",
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  const recentActivity = [
    { lot: "LOT-2026-001", material: "Vanilla Extract", status: "PENDING_QC", time: "2 minutes ago" },
    { lot: "LOT-2026-002", material: "Lavender Oil", status: "APPROVED", time: "15 minutes ago" },
    { lot: "LOT-2026-003", material: "Rose Essential Oil", status: "IN_PRODUCTION", time: "1 hour ago" },
    { lot: "LOT-2026-004", material: "Peppermint Oil", status: "APPROVED", time: "2 hours ago" },
    { lot: "LOT-2026-005", material: "Citrus Blend", status: "PENDING_QC", time: "3 hours ago" },
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

  return (
    <div className="animate-in fade-in duration-500">
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
              {recentActivity.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">{item.lot}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{item.material}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(item.status)}`}>
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-medium">{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
