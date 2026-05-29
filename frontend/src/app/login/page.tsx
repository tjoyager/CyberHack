'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, User, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default to super admin if logging in with credentials
    localStorage.setItem("userRole", "super_admin");
    localStorage.setItem("userName", username || "Admin User");
    router.push("/dashboard");
  };

  const quickLogin = (role: string) => {
    localStorage.setItem("userRole", role);

    // Set appropriate user name based on role
    const roleNames = {
      intake: "Intake Staff User",
      qc: "QC Inspector User",
      ppic: "PPIC Manager User",
      super_admin: "Super Admin User",
    };

    localStorage.setItem("userName", roleNames[role as keyof typeof roleNames] || "User");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Package className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl mb-2 text-foreground">Sima Arome ERP Lite</h1>
          <p className="text-muted-foreground">Secure material tracking system</p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-lg p-8">
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block mb-2 text-foreground">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Login
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3 text-center">Quick login as:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => quickLogin("intake")}
                className="py-2 px-3 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-sm text-foreground"
              >
                Intake Staff
              </button>
              <button
                onClick={() => quickLogin("qc")}
                className="py-2 px-3 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-sm text-foreground"
              >
                QC Inspector
              </button>
              <button
                onClick={() => quickLogin("ppic")}
                className="py-2 px-3 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-sm text-foreground"
              >
                PPIC Manager
              </button>
              <button
                onClick={() => quickLogin("super_admin")}
                className="py-2 px-3 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-sm text-foreground"
              >
                Super Admin
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
