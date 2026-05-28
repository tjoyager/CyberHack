'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, User, Lock, Loader2 } from "lucide-react";
import { useAuth, UserRole } from "@/lib/auth-context";
import { loginRequest, apiRequest } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const data = await loginRequest(username, password);
      // Fetch user profile to get role
      const profile = await apiRequest("/users/me", "GET", undefined, data.access_token);
      
      login(data.access_token, {
        username: profile.username,
        role: profile.role,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (role: string) => {
    // Note: Quick login bypassing password is not possible against the real backend without a bypass token.
    // For now, let's pre-fill the username and password field if we have test accounts.
    // Alternatively, just alert them.
    let uname = "";
    let pword = "Password123!";
    switch (role) {
      case "intake": uname = "intake_user"; break;
      case "qc": uname = "qc_user"; break;
      case "ppic": uname = "ppic_user"; break;
      case "super_admin": uname = "admin_user"; break;
    }
    setUsername(uname);
    setPassword(pword);
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
          <h1 className="text-3xl mb-2 text-foreground font-bold">Sima Arome ERP Lite</h1>
          <p className="text-muted-foreground">Secure material tracking system</p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block mb-2 text-foreground font-medium">Username</label>
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
              <label className="block mb-2 text-foreground font-medium">Password</label>
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
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3 text-center">Quick login as:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => quickLogin("intake")}
                className="py-2 px-3 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-sm text-foreground font-medium"
              >
                Intake Staff
              </button>
              <button
                onClick={() => quickLogin("qc")}
                className="py-2 px-3 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-sm text-foreground font-medium"
              >
                QC Inspector
              </button>
              <button
                onClick={() => quickLogin("ppic")}
                className="py-2 px-3 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-sm text-foreground font-medium"
              >
                PPIC Manager
              </button>
              <button
                onClick={() => quickLogin("super_admin")}
                className="py-2 px-3 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-sm text-foreground font-medium"
              >
                Super Admin
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/")}
            className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
