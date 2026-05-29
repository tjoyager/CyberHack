'use client';

import { useState, useEffect } from "react";
import { Eye, CheckCircle, XCircle, X, Loader2 } from "lucide-center";
import { apiRequest } from "@/lib/api";

// Fix icon import if lucide-center is a typo (it should be lucide-react)
import { Eye as EyeIcon, CheckCircle as CheckIcon, XCircle as XIcon, X as CloseIcon, Loader2 as LoaderIcon } from "lucide-react";

export default function QCInspectorPage() {
  const [lots, setLots] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [inspectionModal, setInspectionModal] = useState<{ open: boolean; lot: any | null }>({
    open: false,
    lot: null,
  });

  const [inspectionData, setInspectionData] = useState({
    qc_notes: "",
    rejection_reason: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const [lotsData, materialsData] = await Promise.all([
        apiRequest("/lots", "GET", undefined, token),
        apiRequest("/materials", "GET", undefined, token),
      ]);

      setLots(lotsData);
      setMaterials(materialsData);
    } catch (error: any) {
      console.error("Failed to fetch QC data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const openInspection = (lot: any) => {
    setInspectionModal({ open: true, lot });
    setInspectionData({ qc_notes: "", rejection_reason: "" });
  };

  const handleUpdateStatus = async (status: string) => {
    if (!inspectionModal.lot) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Not authenticated");

      await apiRequest(`/lots/${inspectionModal.lot.id}/qc`, "PATCH", {
        status,
        qc_notes: inspectionData.qc_notes,
        rejection_reason: status === 'REJECTED' ? inspectionData.rejection_reason : undefined,
      }, token);

      // Refresh list
      await fetchData();
      setInspectionModal({ open: false, lot: null });
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_QC": return "bg-amber-100 text-amber-700 border-amber-200";
      case "APPROVED": return "bg-green-100 text-green-700 border-green-200";
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoaderIcon className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border bg-slate-50/50">
          <h2 className="text-base sm:text-lg font-bold text-foreground">Quality Control Queue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Lot Number</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Material</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Quantity</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lots.map((lot) => (
                <tr key={lot.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-foreground">{lot.lot_number}</td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {materials.find(m => m.id === lot.material_id)?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{lot.quantity_kg} KG</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(lot.status)}`}>
                      {lot.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {lot.status === "PENDING_QC" ? (
                      <button
                        onClick={() => openInspection(lot)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all font-bold text-xs shadow-sm shadow-primary/20"
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground font-medium italic">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {inspectionModal.open && inspectionModal.lot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-foreground">QC Inspection</h2>
                <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                  {inspectionModal.lot.lot_number} • {materials.find(m => m.id === inspectionModal.lot.material_id)?.name}
                </p>
              </div>
              <button
                onClick={() => setInspectionModal({ open: false, lot: null })}
                className="w-8 h-8 rounded-lg hover:bg-white transition-colors flex items-center justify-center text-muted-foreground border border-transparent hover:border-border"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">QC Notes</label>
                <textarea
                  value={inspectionData.qc_notes}
                  onChange={(e) => setInspectionData({ ...inspectionData, qc_notes: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm font-medium"
                  rows={3}
                  placeholder="Additional observations..."
                />
              </div>
              <div>
                <label className="block mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider text-red-600">Rejection Reason (If Rejecting)</label>
                <textarea
                  value={inspectionData.rejection_reason}
                  onChange={(e) => setInspectionData({ ...inspectionData, rejection_reason: e.target.value })}
                  className="w-full px-4 py-2 border border-red-100 rounded-lg bg-red-50/30 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none text-sm font-medium"
                  rows={2}
                  placeholder="Why is this lot rejected?"
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3 bg-slate-50/50">
              <button
                onClick={() => handleUpdateStatus('APPROVED')}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-bold text-sm shadow-md shadow-green-200 disabled:opacity-50"
              >
                {submitting ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <CheckIcon className="w-5 h-5" />}
                Approve Lot
              </button>
              <button
                onClick={() => handleUpdateStatus('REJECTED')}
                disabled={submitting || !inspectionData.rejection_reason}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-bold text-sm shadow-md shadow-red-200 disabled:opacity-50"
              >
                {submitting ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <XIcon className="w-5 h-5" />}
                Reject Lot
              </button>
            </div>
            <div className="p-6 pt-0 flex justify-center bg-slate-50/50">
              <button
                onClick={() => setInspectionModal({ open: false, lot: null })}
                className="px-4 py-2 rounded-lg border border-border bg-white hover:bg-slate-50 transition-colors text-foreground font-semibold text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
