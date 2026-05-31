'use client';

import { useState, useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function SuperAdminPage() {
  const { token } = useAuth();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        if (!token) return;

        const data = await apiRequest("/audit-logs/", "GET", undefined, token);
        setAuditLogs(data);
      } catch (error: any) {
        console.error("Failed to fetch audit logs:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [token]);

  const getActionColor = (action: string) => {
    if (action.startsWith("STATUS_UPDATE")) return "text-amber-600";
    if (action === "CREATE") return "text-blue-600";
    if (action === "SLOT_ASSIGNED") return "text-green-600";
    return "text-slate-600";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 bg-white rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Audit Trail</h2>
            <p className="text-sm text-muted-foreground">Complete history of system activities — Immutable Records</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
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
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground italic">No audit records found.</td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-foreground">
                      {log.user?.username || "System"}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-tight">
                        {log.entity_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold uppercase tracking-wide ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-mono text-muted-foreground max-w-[200px] truncate">
                      {(() => {
                        const oldObj = log.old_value;
                        const newObj = log.new_value;
                        if (!oldObj) return "-";
                        const changes = Object.keys(oldObj).filter(k => oldObj[k] !== newObj?.[k]);
                        if (changes.length === 0) return "-";
                        return changes.map((k, i) => (
                          <span key={k}>
                            {i > 0 && ", "}
                            {k}: <span className="px-1 py-0.5 rounded bg-red-50 text-red-600 line-through">{String(oldObj[k])}</span>
                          </span>
                        ));
                      })()}
                    </td>
                    <td className="px-6 py-4 text-[11px] font-mono text-foreground font-medium max-w-[200px] truncate">
                      {(() => {
                        const oldObj = log.old_value;
                        const newObj = log.new_value;
                        if (!newObj) return "-";
                        const changes = Object.keys(newObj).filter(k => newObj[k] !== oldObj?.[k]);
                        if (changes.length === 0) return "-";
                        return changes.map((k, i) => (
                          <span key={k}>
                            {i > 0 && ", "}
                            {k}: <span className="px-1 py-0.5 rounded bg-green-50 text-green-700">{String(newObj[k])}</span>
                          </span>
                        ));
                      })()}
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
