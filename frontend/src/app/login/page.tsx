'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, User, Lock, KeyRound, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { loginRequestOTP, verifyOTPRequest, apiRequest } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  // Step 1: Login
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  // Step 2: OTP
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [emailHint, setEmailHint] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const data = await loginRequestOTP(username, password);
      if (data.status === "otp_sent") {
        setEmailHint(data.email);
        setStep(2);
      }
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const data = await verifyOTPRequest(username, otpCode);
      const profile = await apiRequest("/users/me", "GET", undefined, data.access_token);
      
      login(data.access_token, {
        username: profile.username,
        role: profile.role,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid OTP code");
    } finally {
      setIsLoading(false);
    }
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
          
          {step === 1 ? (
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
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In & Get OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6 text-center">
                <p className="text-sm text-foreground">
                  An OTP has been sent to <strong>{emailHint}</strong>. (Check terminal backend logs for the mock email).
                </p>
              </div>

              <div className="mb-6">
                <label className="block mb-2 text-foreground font-medium">Enter 6-Digit OTP</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring tracking-widest text-center text-lg font-bold"
                    placeholder="••••••"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors font-semibold flex items-center justify-center text-foreground"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="flex-[2] py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Login"}
                </button>
              </div>
            </form>
          )}

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
