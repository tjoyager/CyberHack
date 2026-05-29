'use client';

import { useState } from "react";
import { Plus, Sparkles, Upload, FileText, X } from "lucide-react";

export default function IntakeStaffPage() {
  const [formData, setFormData] = useState({
    materialName: "",
    supplier: "",
    quantity: "",
    manufacturedDate: "",
    expiryDate: "",
  });

  const [showAIModal, setShowAIModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [lots, setLots] = useState([
    {
      lotNumber: "LOT-2026-001",
      material: "Vanilla Extract",
      supplier: "Natural Essence Ltd",
      quantity: "500 L",
      status: "PENDING_QC",
      createdAt: "2026-05-28 10:00",
    },
    {
      lotNumber: "LOT-2026-002",
      material: "Lavender Oil",
      supplier: "Herbal Solutions Inc",
      quantity: "250 L",
      status: "PENDING_QC",
      createdAt: "2026-05-28 09:30",
    },
    {
      lotNumber: "LOT-2026-003",
      material: "Rose Essential Oil",
      supplier: "Floral Extracts Co",
      quantity: "100 L",
      status: "APPROVED",
      createdAt: "2026-05-28 08:45",
    },
  ]);

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
      // Mock AI extraction - in a real app, this would call an AI API
      const mockExtractedData = [
        {
          materialName: "Eucalyptus Essential Oil",
          supplier: "Global Botanics Ltd",
          quantity: "750",
          manufacturedDate: "2026-05-15",
          expiryDate: "2028-05-15",
        },
        {
          materialName: "Tea Tree Oil",
          supplier: "Natural Extracts Co",
          quantity: "600",
          manufacturedDate: "2026-05-10",
          expiryDate: "2028-05-10",
        },
        {
          materialName: "Bergamot Oil",
          supplier: "Citrus Solutions Inc",
          quantity: "400",
          manufacturedDate: "2026-05-12",
          expiryDate: "2027-11-12",
        },
      ];

      // Randomly select one of the mock data sets
      const extractedData = mockExtractedData[Math.floor(Math.random() * mockExtractedData.length)];

      setFormData(extractedData);
      setIsProcessing(false);
      setShowAIModal(false);
      setUploadedFile(null);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLot = {
      lotNumber: `LOT-2026-${String(lots.length + 1).padStart(3, "0")}`,
      material: formData.materialName,
      supplier: formData.supplier,
      quantity: `${formData.quantity} L`,
      status: "PENDING_QC",
      createdAt: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setLots([newLot, ...lots]);
    setFormData({
      materialName: "",
      supplier: "",
      quantity: "",
      manufacturedDate: "",
      expiryDate: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_QC": return "bg-warning/20 text-warning border-warning/30";
      case "APPROVED": return "bg-success/20 text-success border-success/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl border border-border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg text-foreground">Register New Material</h2>
          <button
            type="button"
            onClick={() => setShowAIModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-success text-white hover:opacity-90 transition-opacity text-sm sm:text-base"
          >
            <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
            Auto-Fill with AI
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <label className="block mb-2 text-foreground">Material Name</label>
              <input
                type="text"
                value={formData.materialName}
                onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g., Vanilla Extract"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-foreground">Supplier</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g., Natural Essence Ltd"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-foreground">Initial Quantity (L)</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g., 500"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-foreground">Manufactured Date</label>
              <input
                type="date"
                value={formData.manufacturedDate}
                onChange={(e) => setFormData({ ...formData, manufacturedDate: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-foreground">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Submit Lot
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-border">
        <div className="p-4 sm:p-6 border-b border-border">
          <h2 className="text-base sm:text-lg text-foreground">Submitted Lots</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-background">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-muted-foreground">Lot Number</th>
                <th className="text-left px-6 py-3 text-sm text-muted-foreground">Material</th>
                <th className="text-left px-6 py-3 text-sm text-muted-foreground">Supplier</th>
                <th className="text-left px-6 py-3 text-sm text-muted-foreground">Quantity</th>
                <th className="text-left px-6 py-3 text-sm text-muted-foreground">Status</th>
                <th className="text-left px-6 py-3 text-sm text-muted-foreground">Created At</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot, index) => (
                <tr key={index} className="border-t border-border">
                  <td className="px-6 py-4 text-foreground">{lot.lotNumber}</td>
                  <td className="px-6 py-4 text-foreground">{lot.material}</td>
                  <td className="px-6 py-4 text-foreground">{lot.supplier}</td>
                  <td className="px-6 py-4 text-foreground">{lot.quantity}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(lot.status)}`}>
                      {lot.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{lot.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-success flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl text-foreground">Auto-Fill with AI</h2>
                  <p className="text-sm text-muted-foreground">Upload a document to extract material information</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAIModal(false);
                  setUploadedFile(null);
                }}
                className="w-8 h-8 rounded-lg hover:bg-background transition-colors flex items-center justify-center text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {!uploadedFile ? (
                <label className="block">
                  <div className="border-2 border-dashed border-border rounded-xl p-8 hover:border-primary transition-colors cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-foreground mb-1">Upload Document</p>
                        <p className="text-sm text-muted-foreground">
                          PDF, DOC, DOCX, or image files (Max 10MB)
                        </p>
                      </div>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Browse Files
                      </button>
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
                <div>
                  <div className="p-4 rounded-lg border border-border bg-background mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="w-8 h-8 rounded-lg hover:bg-white transition-colors flex items-center justify-center text-muted-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/20 border border-secondary mb-4">
                    <p className="text-sm text-foreground">
                      <strong>AI will extract:</strong> Material name, supplier, quantity, manufactured date, and expiry date from your document.
                    </p>
                  </div>

                  {isProcessing && (
                    <div className="p-4 rounded-lg bg-primary/10 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-primary font-medium">Processing document with AI...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAIModal(false);
                  setUploadedFile(null);
                }}
                className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-foreground"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleAIExtract}
                disabled={!uploadedFile || isProcessing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-success text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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
