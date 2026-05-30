'use client';

import { useState, useEffect, useRef } from "react";
import { Plus, Sparkles, Upload, FileText, X, Loader2 } from "lucide-react";
import { apiRequest, createLot } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function IntakeStaffPage() {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    material_id: "",
    supplier_id: "",
    quantity_kg: "",
  });

  const [materials, setMaterials] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [token]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      if (!token) {
        // Fallback dummy data
        setMaterials([
          { id: "m1", name: "Vanilla Extract" },
          { id: "m2", name: "Patchouli Oil" },
          { id: "m3", name: "Lavender Essence" }
        ]);
        setSuppliers([
          { id: "s1", company_name: "PT Tani Organik" },
          { id: "s2", company_name: "Global Botanics Ltd" }
        ]);
        setLots([
          { id: "l1", lot_number: "LOT-2026-001", material_id: "m1", quantity_kg: 250.50, status: "PENDING_QC", created_at: new Date().toISOString() }
        ]);
        return;
      }

      try {
        const [materialsData, suppliersData, lotsData] = await Promise.all([
          apiRequest("/materials/", "GET", undefined, token),
          apiRequest("/suppliers/", "GET", undefined, token),
          apiRequest("/lots/", "GET", undefined, token),
        ]);

        setMaterials(materialsData);
        setSuppliers(suppliersData);
        setLots(lotsData);
      } catch (innerError) {
        console.error("API Fetch Error:", innerError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiLoading(true);
    const formDataObj = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/lots/ai-extract`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formDataObj
      });

      if (!response.ok) throw new Error("AI Extraction failed");

      const data = await response.json();
      
      // Logic to find IDs based on extracted names
      const matchedMaterial = materials.find(m => 
        m.name.toLowerCase().includes(data.material_name?.toLowerCase())
      );
      const matchedSupplier = suppliers.find(s => 
        s.company_name.toLowerCase().includes(data.supplier_name?.toLowerCase())
      );

      setFormData({
        material_id: matchedMaterial?.id || "",
        supplier_id: matchedSupplier?.id || "",
        quantity_kg: data.quantity_kg?.toString() || "",
      });

    } catch (error) {
      console.error("AI Extraction Error:", error);
      alert("Failed to extract data. Please fill manually.");
    } finally {
      setIsAiLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!token) throw new Error("Not authenticated");

      const payload = {
        material_id: formData.material_id,
        supplier_id: formData.supplier_id || null,
        quantity_kg: parseFloat(formData.quantity_kg),
      };

      const newLot = await createLot(payload, token);
      setLots(prev => [newLot, ...prev]);

      setFormData({
        material_id: "",
        supplier_id: "",
        quantity_kg: "",
      });
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl border border-border p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-bold text-foreground">Register New Material</h2>
          
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />

          <button
            type="button"
            disabled={isAiLoading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-success text-white hover:opacity-90 transition-opacity text-sm sm:text-base shadow-sm disabled:opacity-70"
          >
            {isAiLoading ? (
              <>
                <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
                Auto-Fill with AI
              </>
            )}
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <label className="block mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Material</label>
              <select
                value={formData.material_id}
                onChange={(e) => setFormData({ ...formData, material_id: e.target.value })}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium"
                required
              >
                <option value="">Select Material</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Supplier</label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium"
              >
                <option value="">Select Supplier (Optional)</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.company_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Quantity (KG)</label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity_kg}
                onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium"
                placeholder="e.g., 500.00"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-bold shadow-sm shadow-primary/20 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Submit Lot
              </>
            )}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border bg-slate-50/50">
          <h2 className="text-base sm:text-lg font-bold text-foreground">Submitted Lots</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Lot Number</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Material</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Quantity</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Created At</th>
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
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(lot.status)}`}>
                      {lot.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                    {new Date(lot.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
