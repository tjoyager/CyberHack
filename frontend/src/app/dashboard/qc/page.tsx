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
      case "PENDING_QC": return "bg-warning/20 text-warning border-warning/30";
      case "APPROVED": return "bg-success/20 text-success border-success/30";
      case "REJECTED": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border">
        <h2 className="text-base sm:text-lg text-foreground">Quality Control Queue</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-background">
            <tr>
              <th className="text-left px-6 py-3 text-sm text-muted-foreground">Lot Number</th>
              <th className="text-left px-6 py-3 text-sm text-muted-foreground">Material</th>
              <th className="text-left px-6 py-3 text-sm text-muted-foreground">Supplier</th>
              <th className="text-left px-6 py-3 text-sm text-muted-foreground">Quantity</th>
              <th className="text-left px-6 py-3 text-sm text-muted-foreground">Expiry Date</th>
              <th className="text-left px-6 py-3 text-sm text-muted-foreground">Status</th>
              <th className="text-left px-6 py-3 text-sm text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {lots.map((lot, index) => (
              <tr key={index} className="border-t border-border">
                <td className="px-6 py-4 text-foreground font-medium">{lot.lotNumber}</td>
                <td className="px-6 py-4 text-foreground">{lot.material}</td>
                <td className="px-6 py-4 text-foreground">{lot.supplier}</td>
                <td className="px-6 py-4 text-foreground">{lot.quantity}</td>
                <td className="px-6 py-4 text-foreground">{lot.expiryDate}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(lot.status)}`}>
                    {lot.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {lot.status === "PENDING_QC" ? (
                    <button
                      onClick={() => openInspection(lot)}
                      className="px-3 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs"
                    >
                      Inspect
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {inspectionModal.open && inspectionModal.lot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl text-foreground">QC Inspection</h2>
                <p className="text-sm text-muted-foreground mt-1">
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
                <label className="block mb-2 text-sm text-muted-foreground">Purity (%)</label>
                <input
                  type="number"
                  value={inspectionData.purity}
                  onChange={(e) => setInspectionData({ ...inspectionData, purity: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., 99.5"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm text-muted-foreground">Color Index</label>
                <input
                  type="text"
                  value={inspectionData.colorIndex}
                  onChange={(e) => setInspectionData({ ...inspectionData, colorIndex: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., 1.5"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm text-muted-foreground">Moisture Content (%)</label>
                <input
                  type="number"
                  value={inspectionData.moistureContent}
                  onChange={(e) => setInspectionData({ ...inspectionData, moistureContent: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., 0.8"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm text-muted-foreground">QC Notes</label>
                <textarea
                  value={inspectionData.notes}
                  onChange={(e) => setInspectionData({ ...inspectionData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={3}
                  placeholder="Additional observations..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={handleApprove}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-success text-white hover:opacity-90 transition-opacity"
              >
                <CheckCircle className="w-5 h-5" />
                Approve Lot
              </button>
              <button
                onClick={handleReject}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-destructive text-white hover:opacity-90 transition-opacity"
              >
                <XCircle className="w-5 h-5" />
                Reject Lot
              </button>
            </div>
            <div className="p-6 pt-0 flex justify-center">
              <button
                onClick={() => setInspectionModal({ open: false, lot: null })}
                className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-foreground"
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
