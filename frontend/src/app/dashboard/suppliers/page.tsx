'use client';

import { useState, useEffect } from "react";
import { Users, Plus, X, Loader2, Building2, Phone, Mail, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function SuppliersPage() {
  const { token } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    fetchSuppliers();
  }, [token]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      if (!token) return;

      const data = await apiRequest("/suppliers", "GET", undefined, token);
      setSuppliers(data);
    } catch (error: any) {
      console.error("Failed to fetch suppliers:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!token) throw new Error("Not authenticated");

      await apiRequest("/suppliers", "POST", formData, token);
      await fetchSuppliers();
      setShowAddModal(false);
      setFormData({ company_name: "", contact_person: "", phone: "", email: "", address: "" });
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Supplier Management</h1>
          <p className="text-muted-foreground">Maintain master data for raw material providers.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-bold text-sm shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">{supplier.company_name}</h3>
            <p className="text-sm font-medium text-muted-foreground mb-4">{supplier.contact_person || "No contact person"}</p>
            
            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-3 text-sm text-foreground">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{supplier.phone || "-"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{supplier.email || "-"}</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-foreground">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="line-clamp-2">{supplier.address || "No address provided"}</span>
              </div>
            </div>
          </div>
        ))}

        {suppliers.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-muted-foreground">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">No suppliers found.</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-primary font-bold hover:underline"
            >
              Add your first supplier
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Register New Supplier</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-background transition-colors flex items-center justify-center text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Company Name</label>
                  <input
                    required
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring font-medium"
                    placeholder="e.g., Global Botanics Ltd"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact Person</label>
                    <input
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring font-medium"
                      placeholder="e.g., Jane Smith"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring font-medium"
                      placeholder="+62..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring font-medium"
                    placeholder="contact@company.com"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Physical Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring font-medium resize-none"
                    rows={3}
                    placeholder="Full street address..."
                  />
                </div>
              </div>
              <div className="p-6 border-t border-border flex gap-3 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-white hover:bg-slate-100 transition-colors text-foreground font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-bold text-sm shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
