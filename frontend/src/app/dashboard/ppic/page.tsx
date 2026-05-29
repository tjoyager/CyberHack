'use client';

import { useState } from "react";
import { MapPin, X } from "lucide-react";

interface Lot {
  lotNumber: string;
  material: string;
  quantity: string;
  status: string;
  warehouseSlot: string;
}

export default function PPICManagerPage() {
  const [lots, setLots] = useState<Lot[]>([
    {
      lotNumber: "LOT-2026-003",
      material: "Rose Essential Oil",
      quantity: "100 L",
      status: "APPROVED",
      warehouseSlot: "-",
    },
    {
      lotNumber: "LOT-2026-005",
      material: "Citrus Blend",
      quantity: "450 L",
      status: "APPROVED",
      warehouseSlot: "-",
    },
    {
      lotNumber: "LOT-2026-006",
      material: "Sandalwood Oil",
      quantity: "200 L",
      status: "IN_PRODUCTION",
      warehouseSlot: "A-12",
    },
    {
      lotNumber: "LOT-2026-007",
      material: "Jasmine Extract",
      quantity: "150 L",
      status: "IN_PRODUCTION",
      warehouseSlot: "B-05",
    },
  ]);

  const [assignmentModal, setAssignmentModal] = useState<{ open: boolean; lot: Lot | null }>({
    open: false,
    lot: null,
  });

  const [assignmentData, setAssignmentData] = useState({
    warehouseSlot: "",
    productionNotes: "",
  });

  const openAssignment = (lot: Lot) => {
    setAssignmentModal({ open: true, lot });
    setAssignmentData({ warehouseSlot: "", productionNotes: "" });
  };

  const handleAssign = () => {
    if (assignmentModal.lot && assignmentData.warehouseSlot) {
      setLots(
        lots.map((lot) =>
          lot.lotNumber === assignmentModal.lot!.lotNumber
            ? { ...lot, status: "IN_PRODUCTION", warehouseSlot: assignmentData.warehouseSlot }
            : lot
        )
      );
      setAssignmentModal({ open: false, lot: null });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-success/20 text-success border-success/30";
      case "IN_PRODUCTION": return "bg-primary/20 text-primary border-primary/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border">
        <h2 className="text-base sm:text-lg text-foreground">Warehouse Routing</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-background">
            <tr>
              <th className="text-left px-6 py-3 text-sm text-muted-foreground">Lot Number</th>
              <th className="text-left px-6 py-3 text-sm text-muted-foreground">Material</th>
              <th className="text-left px-6 py-3 text-sm text-muted-foreground">Quantity</th>
              <th className="text-left px-6 py-3 text-sm text-muted-foreground">Status</th>
              <th className="text-left px-6 py-3 text-sm text-muted-foreground">Warehouse Slot</th>
              <th className="text-left px-6 py-3 text-sm text-muted-foreground text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {lots.map((lot, index) => (
              <tr key={index} className="border-t border-border">
                <td className="px-6 py-4 text-foreground font-medium">{lot.lotNumber}</td>
                <td className="px-6 py-4 text-foreground">{lot.material}</td>
                <td className="px-6 py-4 text-foreground">{lot.quantity}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(lot.status)}`}>
                    {lot.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-6 py-4 text-foreground font-semibold">{lot.warehouseSlot}</td>
                <td className="px-6 py-4 text-center">
                  {lot.status === "APPROVED" ? (
                    <button
                      onClick={() => openAssignment(lot)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs"
                    >
                      <MapPin className="w-3 h-3" />
                      Assign Slot
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">In Production</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assignmentModal.open && assignmentModal.lot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl text-foreground">Assign Warehouse Slot</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {assignmentModal.lot.lotNumber} • {assignmentModal.lot.material}
                </p>
              </div>
              <button
                onClick={() => setAssignmentModal({ open: false, lot: null })}
                className="w-8 h-8 rounded-lg hover:bg-background transition-colors flex items-center justify-center text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-2 text-sm text-muted-foreground">Warehouse Slot</label>
                <input
                  type="text"
                  value={assignmentData.warehouseSlot}
                  onChange={(e) => setAssignmentData({ ...assignmentData, warehouseSlot: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., A-12, B-05, C-18"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm text-muted-foreground">Production Notes</label>
                <textarea
                  value={assignmentData.productionNotes}
                  onChange={(e) => setAssignmentData({ ...assignmentData, productionNotes: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={4}
                  placeholder="Add any special handling instructions or production notes..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex flex-col gap-3">
              <button
                onClick={handleAssign}
                disabled={!assignmentData.warehouseSlot}
                className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Move to Production
              </button>
              <button
                onClick={() => setAssignmentModal({ open: false, lot: null })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-foreground"
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
