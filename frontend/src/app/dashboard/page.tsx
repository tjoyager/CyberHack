'use client';

import { Clock, CheckCircle, Package, XCircle } from "lucide-react";

export default function DashboardOverview() {
  const summaryCards = [
    {
      title: "Pending QC",
      value: "24",
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Approved Lots",
      value: "156",
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
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
      case "PENDING_QC": return "bg-warning/20 text-warning border-warning/30";
      case "APPROVED": return "bg-success/20 text-success border-success/30";
      case "IN_PRODUCTION": return "bg-primary/20 text-primary border-primary/30";
      case "REJECTED": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
              <div className="text-3xl mb-1 text-foreground">{card.value}</div>
              <div className="text-sm text-muted-foreground">{card.title}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-border">
        <div className="p-4 sm:p-6 border-b border-border">
          <h2 className="text-base sm:text-lg text-foreground">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-background">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-muted-foreground">Lot Number</th>
                <th className="text-left px-6 py-3 text-sm text-muted-foreground">Material</th>
                <th className="text-left px-6 py-3 text-sm text-muted-foreground">Status</th>
                <th className="text-left px-6 py-3 text-sm text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((item, index) => (
                <tr key={index} className="border-t border-border">
                  <td className="px-6 py-4 text-foreground">{item.lot}</td>
                  <td className="px-6 py-4 text-foreground">{item.material}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(item.status)}`}>
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
