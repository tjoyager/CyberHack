'use client';

import { useState, useEffect } from "react";
import { Truck, X, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function DeliveryStaffPage() {
  const { token } = useAuth();
  const [lots, setLots] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [deliveryModal, setDeliveryModal] = useState<{ open: boolean; lot: any | null }>({
    open: false,
    lot: null,
  });

  const [deliveryData, setDeliveryData] = useState({
    driver_name: "",
    vehicle_plate: "",
    destination: "",
  });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!token) return;

      const [lotsData, materialsData] = await Promise.all([
        apiRequest("/lots", "GET", undefined, token),
        apiRequest("/materials", "GET", undefined, token),
      ]);

      // Only show IN_PRODUCTION and DELIVERED for Delivery Staff
      const relevantLots = lotsData.filter((l: any) => 
        l.status === "IN_PRODUCTION" || l.status === "DELIVERED"
      );
      
      setLots(relevantLots);
      setMaterials(materialsData);
    } catch (error: any) {
      console.error("Failed to fetch Delivery data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const openDelivery = (lot: any) => {
    setDeliveryModal({ open: true, lot });
    setDeliveryData({ driver_name: "", vehicle_plate: "", destination: "" });
  };

  const handleDeliver = async () => {
    if (!deliveryModal.lot || !deliveryData.destination) return;
    setSubmitting(true);
    try {
      if (!token) throw new Error("Not authenticated");

      await apiRequest("/delivery-orders", "POST", {
        lot_id: deliveryModal.lot.id,
        driver_name: deliveryData.driver_name,
        vehicle_plate: deliveryData.vehicle_plate,
        destination: deliveryData.destination,
        departure_at: new Date().toISOString(),
      }, token);

      // Refresh list
      await fetchData();
      setDeliveryModal({ open: false, lot: null });
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_PRODUCTION": return "bg-blue-100 text-blue-700 border-blue-200";
      case "DELIVERED": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
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
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border bg-slate-50/50">
          <h2 className="text-base sm:text-lg font-bold text-foreground">Delivery Queue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Lot Number</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Material</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Quantity</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Warehouse Slot</th>
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
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{lot.warehouse_slot}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(lot.status)}`}>
                      {lot.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {lot.status === "IN_PRODUCTION" ? (
                      <button
                        onClick={() => openDelivery(lot)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all font-bold text-xs shadow-sm shadow-primary/20"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Ship
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground font-medium italic">Shipped</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deliveryModal.open && deliveryModal.lot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-[100] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Create Delivery Order</h2>
                <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                  {deliveryModal.lot.lot_number} • {materials.find(m => m.id === deliveryModal.lot.material_id)?.name}
                </p>
              </div>
              <button
                onClick={() => setDeliveryModal({ open: false, lot: null })}
                className="w-8 h-8 rounded-lg hover:bg-background transition-colors flex items-center justify-center text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Destination</label>
                <input
                  type="text"
                  value={deliveryData.destination}
                  onChange={(e) => setDeliveryData({ ...deliveryData, destination: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium"
                  placeholder="e.g., Main Distribution Center"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Driver Name</label>
                <input
                  type="text"
                  value={deliveryData.driver_name}
                  onChange={(e) => setDeliveryData({ ...deliveryData, driver_name: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium"
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Vehicle Plate</label>
                <input
                  type="text"
                  value={deliveryData.vehicle_plate}
                  onChange={(e) => setDeliveryData({ ...deliveryData, vehicle_plate: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium"
                  placeholder="e.g., B 1234 XYZ"
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex flex-col gap-3">
              <button
                onClick={handleDeliver}
                disabled={!deliveryData.destination || submitting}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-bold text-sm shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                Dispatch Delivery
              </button>
              <button
                onClick={() => setDeliveryModal({ open: false, lot: null })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-foreground font-bold text-sm"
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
