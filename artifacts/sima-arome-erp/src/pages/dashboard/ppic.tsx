import { useState, useEffect } from "react";
import { MapPin, X, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function PPICManagerPage() {
  const { token } = useAuth();
  const [lots, setLots] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [assignmentModal, setAssignmentModal] = useState<{ open: boolean; lot: any | null }>({ open: false, lot: null });
  const [assignmentData, setAssignmentData] = useState({ warehouseSlot: "", productionNotes: "" });

  useEffect(() => { fetchData(); }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!token) return;
      const [lotsData, materialsData] = await Promise.all([
        apiRequest("/lots/", "GET", undefined, token),
        apiRequest("/materials/", "GET", undefined, token),
      ]);
      const relevantLots = lotsData.filter((l: any) => l.status === "APPROVED" || l.status === "IN_PRODUCTION");
      setLots(relevantLots);
      setMaterials(materialsData);
    } catch (error: any) {
      console.error("Failed to fetch PPIC data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const openAssignment = (lot: any) => {
    setAssignmentModal({ open: true, lot });
    setAssignmentData({ warehouseSlot: lot.warehouse_slot || "", productionNotes: "" });
  };

  const handleAssign = async () => {
    if (!assignmentModal.lot || !assignmentData.warehouseSlot) return;
    setSubmitting(true);
    try {
      if (!token) throw new Error("Not authenticated");
      await apiRequest(`/lots/${assignmentModal.lot.id}/warehouse/`, "PATCH", { warehouse_slot: assignmentData.warehouseSlot }, token);
      await fetchData();
      setAssignmentModal({ open: false, lot: null });
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-700 border-green-200";
      case "IN_PRODUCTION": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border bg-slate-50/50">
        <h2 className="text-base sm:text-lg font-bold text-foreground">Warehouse Routing</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Lot Number</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Material</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Quantity</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Warehouse Slot</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lots.map((lot) => (
              <tr key={lot.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-foreground">{lot.lot_number}</td>
                <td className="px-6 py-4 text-sm text-foreground">{materials.find(m => m.id === lot.material_id)?.name || "Unknown"}</td>
                <td className="px-6 py-4 text-sm text-foreground font-medium">{lot.quantity_kg} KG</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(lot.status)}`}>
                    {lot.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-foreground font-bold">{lot.warehouse_slot || "-"}</td>
                <td className="px-6 py-4 text-center">
                  {lot.status === "APPROVED" ? (
                    <button onClick={() => openAssignment(lot)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all font-bold text-xs shadow-sm shadow-primary/20">
                      <MapPin className="w-3.5 h-3.5" />Assign Slot
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground font-medium italic">In Production</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assignmentModal.open && assignmentModal.lot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-foreground">Assign Warehouse Slot</h2>
                <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                  {assignmentModal.lot.lot_number} • {materials.find(m => m.id === assignmentModal.lot.material_id)?.name}
                </p>
              </div>
              <button onClick={() => setAssignmentModal({ open: false, lot: null })} className="w-8 h-8 rounded-lg hover:bg-white transition-colors flex items-center justify-center text-muted-foreground border border-transparent hover:border-border">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-2 text-sm font-bold text-foreground">Warehouse Slot Location</label>
                <input
                  type="text"
                  value={assignmentData.warehouseSlot}
                  onChange={(e) => setAssignmentData({ ...assignmentData, warehouseSlot: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring font-medium"
                  placeholder="e.g., A-12, B-05, C-18"
                />
                <p className="text-xs text-muted-foreground mt-2">Specify the exact row and bin number for this lot.</p>
              </div>
            </div>
            <div className="p-6 border-t border-border flex flex-col gap-3 bg-slate-50/50">
              <button onClick={handleAssign} disabled={!assignmentData.warehouseSlot || submitting} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-bold text-sm shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}Confirm Assignment
              </button>
              <button onClick={() => setAssignmentModal({ open: false, lot: null })} className="w-full px-4 py-2 rounded-lg border border-border bg-white hover:bg-slate-50 transition-colors text-foreground font-semibold text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
