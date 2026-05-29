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
      case "STATUS_UPDATE": return "text-warning";
      case "WAREHOUSE_ASSIGNMENT": return "text-success";
      default: return "text-foreground";
    }
  };

  return (
    <div>
      <div className="mb-6 bg-white rounded-xl border border-border p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg text-foreground">Audit Trail</h2>
            <p className="text-sm text-muted-foreground">Complete history of system activities</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-background">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">Timestamp</th>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">User</th>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">Entity</th>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">Action</th>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">Old Value</th>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">New Value</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, index) => (
                <tr key={index} className="border-t border-border">
                  <td className="px-6 py-4 text-sm text-foreground">{log.timestamp}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{log.user}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{log.entity}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{log.oldValue}</td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{log.newValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
