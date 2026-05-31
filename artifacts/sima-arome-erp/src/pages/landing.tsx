import { useLocation } from "wouter";
import { Package, CheckCircle, Warehouse, FileText } from "lucide-react";

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
            <span className="font-semibold text-base sm:text-xl text-foreground">Sima Arome ERP Lite</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-8">
            <a href="#features" className="hidden sm:inline text-foreground hover:text-primary transition-colors scroll-smooth">Features</a>
            <a href="#workflow" className="hidden sm:inline text-foreground hover:text-primary transition-colors scroll-smooth">Workflow</a>
            <a href="#benefits" className="hidden sm:inline text-foreground hover:text-primary transition-colors scroll-smooth">Benefits</a>
            <button
              onClick={() => navigate("/login")}
              className="px-4 sm:px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm sm:text-base"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6 text-foreground">
            Simplify Material Tracking from Intake to Production
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
            A lightweight ERP system for managing raw material intake, quality control, warehouse routing, and audit trails.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <button
              onClick={() => navigate("/login")}
              className="px-6 sm:px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-6 sm:px-8 py-3 rounded-lg border-2 border-border bg-white text-foreground hover:bg-secondary/50 transition-colors"
            >
              Login
            </button>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 bg-white rounded-2xl shadow-lg border border-border p-4 sm:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-6 bg-secondary/30 rounded-xl">
              <div className="text-4xl mb-2 text-primary">24</div>
              <div className="text-sm text-muted-foreground">Pending QC</div>
            </div>
            <div className="p-6 bg-secondary/30 rounded-xl">
              <div className="text-4xl mb-2 text-success">156</div>
              <div className="text-sm text-muted-foreground">Approved Lots</div>
            </div>
            <div className="p-6 bg-secondary/30 rounded-xl">
              <div className="text-4xl mb-2 text-primary">42</div>
              <div className="text-sm text-muted-foreground">In Production</div>
            </div>
            <div className="p-6 bg-secondary/30 rounded-xl">
              <div className="text-4xl mb-2 text-destructive">3</div>
              <div className="text-sm text-muted-foreground">Rejected Lots</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl text-center mb-8 sm:mb-12 text-foreground">Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-6 bg-background rounded-xl border border-border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h3 className="mb-2 text-foreground">Raw Material Intake</h3>
              <p className="text-muted-foreground">
                Streamline incoming material registration with automated lot numbering and supplier tracking.
              </p>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <h3 className="mb-2 text-foreground">Quality Control Approval</h3>
              <p className="text-muted-foreground">
                Conduct thorough inspections with purity, color index, and moisture content checks.
              </p>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent/30 flex items-center justify-center mb-4">
                <Warehouse className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="mb-2 text-foreground">Warehouse Routing</h3>
              <p className="text-muted-foreground">
                Assign warehouse slots and manage material flow from storage to production seamlessly.
              </p>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="mb-2 text-foreground">Audit Trail Monitoring</h3>
              <p className="text-muted-foreground">
                Complete transparency with detailed logs of every action, user, and status change.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl text-center mb-8 sm:mb-12 text-foreground">Workflow</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 bg-white rounded-xl border border-border text-center">
              <Package className="w-8 sm:w-10 h-8 sm:h-10 text-primary mx-auto mb-2 sm:mb-3" />
              <div className="font-medium text-sm sm:text-base text-foreground">Intake Staff</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Register materials</div>
            </div>
            <div className="p-4 sm:p-6 bg-white rounded-xl border border-border text-center">
              <CheckCircle className="w-8 sm:w-10 h-8 sm:h-10 text-success mx-auto mb-2 sm:mb-3" />
              <div className="font-medium text-sm sm:text-base text-foreground">QC Inspector</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Approve or reject</div>
            </div>
            <div className="p-4 sm:p-6 bg-white rounded-xl border border-border text-center">
              <Warehouse className="w-8 sm:w-10 h-8 sm:h-10 text-primary mx-auto mb-2 sm:mb-3" />
              <div className="font-medium text-sm sm:text-base text-foreground">PPIC Manager</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Route to production</div>
            </div>
            <div className="p-4 sm:p-6 bg-white rounded-xl border border-border text-center">
              <FileText className="w-8 sm:w-10 h-8 sm:h-10 text-primary mx-auto mb-2 sm:mb-3" />
              <div className="font-medium text-sm sm:text-base text-foreground">Audit Log</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Full transparency</div>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="bg-primary py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-4 sm:mb-6 text-white">
            Start managing your material workflow with clarity and control.
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="px-6 sm:px-8 py-3 rounded-lg bg-white text-primary hover:bg-gray-100 transition-colors"
          >
            Get Started Today
          </button>
        </div>
      </section>

      <footer className="bg-white border-t border-border py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm sm:text-base text-muted-foreground">
          © 2026 Sima Arome ERP Lite. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
