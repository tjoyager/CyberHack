'use client';

import { useState, useEffect } from "react";
import { Plus, Sparkles, Upload, FileText, X, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function IntakeStaffPage() {
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

  const [showAIModal, setShowAIModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const [materialsData, suppliersData, lotsData] = await Promise.all([
        apiRequest("/materials", "GET", undefined, token),
        apiRequest("/suppliers", "GET", undefined, token),
        apiRequest("/lots", "GET", undefined, token),
      ]);

      setMaterials(materialsData);
      setSuppliers(suppliersData);
      setLots(lotsData);
    } catch (error: any) {
      console.error("Failed to fetch data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleAIExtract = () => {
    if (!uploadedFile) return;

    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      // Pick a random material and supplier from the real list
      if (materials.length > 0 && suppliers.length > 0) {
        setFormData({
          material_id: materials[Math.floor(Math.random() * materials.length)].id,
          supplier_id: suppliers[Math.floor(Math.random() * suppliers.length)].id,
          quantity_kg: (Math.floor(Math.random() * 500) + 100).toString(),
        });
      }
      setIsProcessing(false);
      setShowAIModal(false);
      setUploadedFile(null);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Not authenticated");

      await apiRequest("/lots", "POST", {
        material_id: formData.material_id,
        supplier_id: formData.supplier_id || null,
        quantity_kg: parseFloat(formData.quantity_kg),
      }, token);

      // Refresh list to show new lot
      const lotsData = await apiRequest("/lots", "GET", undefined, token);
      setLots(lotsData);

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
          <button
            type="button"
            onClick={() => setShowAIModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-success text-white hover:opacity-90 transition-opacity text-sm sm:text-base shadow-sm"
          >
            <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
            Auto-Fill with AI
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
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Submit Lot
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

      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-success flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Auto-Fill with AI</h2>
                  <p className="text-sm text-muted-foreground">Upload a document to extract material information</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAIModal(false);
                  setUploadedFile(null);
                }}
                className="w-8 h-8 rounded-lg hover:bg-white transition-colors flex items-center justify-center text-muted-foreground border border-transparent hover:border-border"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {!uploadedFile ? (
                <label className="block">
                  <div className="border-2 border-dashed border-border rounded-xl p-8 hover:border-primary transition-colors cursor-pointer bg-slate-50/30">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-foreground mb-1">Upload Document</p>
                        <p className="text-sm text-muted-foreground">
                          PDF, DOC, DOCX, or image files (Max 10MB)
                        </p>
                      </div>
                      <div className="mt-2 px-4 py-2 rounded-lg bg-white border border-border text-foreground text-sm font-semibold shadow-sm">
                        Browse Files
                      </div>
                    </div>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="animate-in slide-in-from-bottom-2 duration-300">
                  <div className="p-4 rounded-lg border border-border bg-slate-50 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="w-8 h-8 rounded-lg hover:bg-white transition-colors flex items-center justify-center text-muted-foreground border border-border"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>AI Extraction Ready:</strong> We'll automatically identify the material, supplier, and quantity from this document.
                    </p>
                  </div>

                  {isProcessing && (
                    <div className="p-4 rounded-lg bg-primary/10 mb-4 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-primary font-bold">Processing document with AI...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex gap-3 justify-end bg-slate-50/50">
              <button
                onClick={() => {
                  setShowAIModal(false);
                  setUploadedFile(null);
                }}
                className="px-4 py-2 rounded-lg border border-border bg-white hover:bg-slate-50 transition-colors text-foreground font-semibold"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleAIExtract}
                disabled={!uploadedFile || isProcessing}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-emerald-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-md shadow-primary/20"
              >
                <Sparkles className="w-4 h-4" />
                {isProcessing ? "Processing..." : "Extract with AI"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
