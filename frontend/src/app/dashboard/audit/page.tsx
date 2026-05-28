'use client';

import { FileText } from "lucide-react";

export default function SuperAdminPage() {
  const auditLogs = [
    {
      timestamp: "2026-05-28 10:00",
      user: "intake_user",
      entity: "lots",
      action: "INSERT",
      oldValue: "-",
      newValue: "PENDING_QC",
    },
    {
      timestamp: "2026-05-28 11:30",
      user: "qc_user",
      entity: "lots",
      action: "STATUS_UPDATE",
      oldValue: "PENDING_QC",
      newValue: "APPROVED",
    },
    {
      timestamp: "2026-05-28 14:00",
      user: "ppic_user",
      entity: "lots",
      action: "STATUS_UPDATE",
      oldValue: "APPROVED",
      newValue: "IN_PRODUCTION",
    },
    {
      timestamp: "2026-05-28 09:45",
      user: "intake_user",
      entity: "lots",
      action: "INSERT",
      oldValue: "-",
      newValue: "PENDING_QC",
    },
    {
      timestamp: "2026-05-28 12:15",
      user: "qc_user",
      entity: "lots",
      action: "STATUS_UPDATE",
      oldValue: "PENDING_QC",
      newValue: "REJECTED",
    },
    {
      timestamp: "2026-05-28 08:30",
      user: "intake_user",
      entity: "lots",
      action: "INSERT",
      oldValue: "-",
      newValue: "PENDING_QC",
    },
    {
      timestamp: "2026-05-28 10:45",
      user: "qc_user",
      entity: "lots",
      action: "STATUS_UPDATE",
      oldValue: "PENDING_QC",
      newValue: "APPROVED",
    },
    {
      timestamp: "2026-05-28 15:20",
      user: "ppic_user",
      entity: "lots",
      action: "WAREHOUSE_ASSIGNMENT",
      oldValue: "-",
      newValue: "A-12",
    },
    {
      timestamp: "2026-05-28 16:00",
      user: "ppic_user",
      entity: "lots",
      action: "STATUS_UPDATE",
      oldValue: "APPROVED",
      newValue: "IN_PRODUCTION",
    },
    {
      timestamp: "2026-05-28 13:10",
      user: "qc_user",
      entity: "lots",
      action: "STATUS_UPDATE",
      oldValue: "PENDING_QC",
      newValue: "APPROVED",
    },
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case "INSERT": return "text-primary";
      case "STATUS_UPDATE": return "text-amber-600";
      case "WAREHOUSE_ASSIGNMENT": return "text-green-600";
      default: return "text-foreground";
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4 sm:mb-6 bg-white rounded-xl border border-border p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">Audit Trail</h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Complete history of all system activities and changes
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Timestamp</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Entity</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Action</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Old Value</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">New Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditLogs.map((log, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{log.timestamp}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-900 text-xs font-bold">
                      {log.user}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{log.entity}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-medium">{log.oldValue}</td>
                  <td className="px-6 py-4 text-sm text-foreground font-bold">{log.newValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
