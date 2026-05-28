'use client';

import { useState } from "react";
import { Eye, CheckCircle, XCircle, X } from "lucide-react";

interface Lot {
  lotNumber: string;
  material: string;
  supplier: string;
  quantity: string;
  expiryDate: string;
  status: string;
}

export default function QCInspectorPage() {
  const [lots, setLots] = useState<Lot[]>([
    {
      lotNumber: "LOT-2026-001",
      material: "Vanilla Extract",
      supplier: "Natural Essence Ltd",
      quantity: "500 L",
      expiryDate: "2027-05-28",
      status: "PENDING_QC",
    },
    {
      lotNumber: "LOT-2026-002",
      material: "Lavender Oil",
      supplier: "Herbal Solutions Inc",
      quantity: "250 L",
      expiryDate: "2027-06-15",
      status: "PENDING_QC",
    },
    {
      lotNumber: "LOT-2026-003",
      material: "Rose Essential Oil",
      supplier: "Floral Extracts Co",
      quantity: "100 L",
      expiryDate: "2027-04-20",
      status: "APPROVED",
    },
    {
      lotNumber: "LOT-2026-004",
      material: "Peppermint Oil",
      supplier: "Mint Fresh Ltd",
      quantity: "300 L",
      expiryDate: "2027-07-10",
      status: "REJECTED",
    },
  ]);

  const [inspectionModal, setInspectionModal] = useState<{ open: boolean; lot: Lot | null }>({
    open: false,
    lot: null,
  });

  const [inspectionData, setInspectionData] = useState({
    purity: "",
    colorIndex: "",
    moistureContent: "",
    notes: "",
  });

  const openInspection = (lot: Lot) => {
    setInspectionModal({ open: true, lot });
    setInspectionData({ purity: "", colorIndex: "", moistureContent: "", notes: "" });
  };

  const handleApprove = () => {
    if (inspectionModal.lot) {
      setLots(
        lots.map((lot) =>
          lot.lotNumber === inspectionModal.lot!.lotNumber ? { ...lot, status: "APPROVED" } : lot
        )
      );
      setInspectionModal({ open: false, lot: null });
    }
  };

  const handleReject = () => {
    if (inspectionModal.lot) {
      setLots(
        lots.map((lot) =>
          lot.lotNumber === inspectionModal.lot!.lotNumber ? { ...lot, status: "REJECTED" } : lot
        )
      );
      setInspectionModal({ open: false, lot: null });
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
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Supplier</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Quantity</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Expiry Date</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lots.map((lot, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-foreground">{lot.lotNumber}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{lot.material}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{lot.supplier}</td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{lot.quantity}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-medium">{lot.expiryDate}</td>
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
                        <Eye className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-[100] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">QC Inspection</h2>
                <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                  {inspectionModal.lot.lotNumber} • {inspectionModal.lot.material}
                </p>
              </div>
              <button
                onClick={() => setInspectionModal({ open: false, lot: null })}
                className="w-8 h-8 rounded-lg hover:bg-background transition-colors flex items-center justify-center text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Purity (%)</label>
                <input
                  type="number"
                  value={inspectionData.purity}
                  onChange={(e) => setInspectionData({ ...inspectionData, purity: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium"
                  placeholder="e.g., 99.5"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Color Index</label>
                <input
                  type="text"
                  value={inspectionData.colorIndex}
                  onChange={(e) => setInspectionData({ ...inspectionData, colorIndex: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium"
                  placeholder="e.g., 1.5"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Moisture Content (%)</label>
                <input
                  type="number"
                  value={inspectionData.moistureContent}
                  onChange={(e) => setInspectionData({ ...inspectionData, moistureContent: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium"
                  placeholder="e.g., 0.8"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">QC Notes</label>
                <textarea
                  value={inspectionData.notes}
                  onChange={(e) => setInspectionData({ ...inspectionData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm font-medium"
                  rows={3}
                  placeholder="Additional observations..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleApprove}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-bold text-sm shadow-sm shadow-green-200"
              >
                <CheckCircle className="w-5 h-5" />
                Approve Lot
              </button>
              <button
                onClick={handleReject}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-bold text-sm shadow-sm shadow-red-200"
              >
                <XCircle className="w-5 h-5" />
                Reject Lot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
