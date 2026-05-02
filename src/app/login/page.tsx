"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { refreshUser, user: currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Forgot Password States
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Phone Login States
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [otpSent, setOtpSent] = useState(false);

  const syncWithBackend = async (user: any) => {
    const res = await fetch("/api/auth/firebase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email || undefined,
        phone: user.phoneNumber || undefined,
        name: user.displayName || "User",
        isLogin: true
      }),
    });

    if (res.ok) {
      await refreshUser();
      toast.success("Successfully logged in");

      const data = await res.json();
      if (data.user?.role === "ADMIN" || currentUser?.role === "ADMIN") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard");
      }
    } else {
      const data = await res.json();
      if (data.redirectToSignup) {
        toast.info("Number not registered. Redirecting to signup...");
        router.push(`/signup?phone=${user.phoneNumber}`);
      } else {
        toast.error(data.error || "Failed to sync with server");
      }
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        await refreshUser();
        toast.success("Successfully logged in");
        
        const data = await res.json();
        if (data.user?.role === "ADMIN" || currentUser?.role === "ADMIN") {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Invalid email or password.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const formattedPhone = identifier.startsWith('+') ? identifier : `+91${identifier}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
      toast.success("OTP sent to your phone");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      await syncWithBackend(result.user);
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Functions
  const handleSendResetOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: resetIdentifier }),
      });
      if (res.ok) {
        toast.success("OTP sent to your email!");
        setResetStep(2);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: resetIdentifier, code: resetOtp, dontDelete: true }),
      });
      if (res.ok) {
        toast.success("OTP verified!");
        setResetStep(3);
      } else {
        const data = await res.json();
        toast.error(data.error || "Invalid OTP");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          identifier: resetIdentifier, 
          code: resetOtp, 
          newPassword 
        }),
      });
      if (res.ok) {
        toast.success("Password updated! Please login.");
        setIsForgotMode(false);
        setResetStep(1);
        setEmail(resetIdentifier);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to reset password");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[70vh]">
      <Card className="w-full max-w-md shadow-lg border-0 translate-y-[-5%]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            {isForgotMode ? "Reset Password" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-center text-md">
            {isForgotMode ? "Securely reset your account password" : "Enter your credentials to access your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isForgotMode ? (
            <>
              <div className="flex gap-2 mb-6">
                <Button variant={loginMethod === "email" ? "default" : "outline"} className="w-1/2 rounded-xl h-11 font-bold" onClick={() => setLoginMethod("email")}>Email</Button>
                <Button variant={loginMethod === "phone" ? "default" : "outline"} className="w-1/2 rounded-xl h-11 font-bold" onClick={() => { setLoginMethod("phone"); setOtpSent(false); }}>Phone</Button>
              </div>
              <div id="recaptcha-container"></div>
              
              {loginMethod === "email" ? (
                <form onSubmit={handleEmailLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" placeholder="Email" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button type="button" onClick={() => { setIsForgotMode(true); setResetIdentifier(email); }} className="text-xs text-indigo-600 font-bold hover:underline">Forgot Password?</button>
                  </div>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl" />
                </div>
                <Button type="submit" className="w-full h-12 text-md mt-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold shadow-lg shadow-indigo-100" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
                </form>
              ) : (
                <div className="space-y-5">
                  {!otpSent ? (
                    <form onSubmit={handleSendOTP} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">+91</span>
                          <Input 
                            id="phone" 
                            type="tel" 
                            required 
                            value={identifier} 
                            onChange={(e) => {
                              let val = e.target.value;
                              if (val.startsWith("+91")) val = val.slice(3);
                              setIdentifier(val);
                            }} 
                            className="h-12 pl-12 rounded-xl" 
                            placeholder="9876543210" 
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full h-12 text-md mt-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold shadow-lg shadow-indigo-100" disabled={loading}>
                        {loading ? "Sending..." : "Send OTP"}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="otp">Enter OTP</Label>
                        <Input id="otp" type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} className="h-12 text-center tracking-widest text-lg font-bold rounded-xl" placeholder="123456" maxLength={6} />
                      </div>
                      <Button type="submit" className="w-full h-12 text-md mt-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold" disabled={loading}>
                        {loading ? "Verifying..." : "Verify OTP"}
                      </Button>
                      <button type="button" onClick={() => setOtpSent(false)} className="text-indigo-600 text-sm w-full font-medium">Change number</button>
                    </form>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              {resetStep === 1 && (
                <form onSubmit={handleSendResetOTP} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email Address</Label>
                    <Input id="resetEmail" type="email" required value={resetIdentifier} onChange={(e) => setResetIdentifier(e.target.value)} className="h-12 rounded-xl" placeholder="Enter your email" />
                  </div>
                  <Button type="submit" className="w-full h-12 text-md bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset OTP"}
                  </Button>
                  <button type="button" onClick={() => setIsForgotMode(false)} className="text-gray-500 text-sm w-full font-medium">Back to Login</button>
                </form>
              )}
              {resetStep === 2 && (
                <form onSubmit={handleVerifyResetOTP} className="space-y-5">
                  <div className="space-y-2 text-center">
                    <Label htmlFor="resetOtp">Enter OTP sent to {resetIdentifier}</Label>
                    <Input id="resetOtp" type="text" required value={resetOtp} onChange={(e) => setResetOtp(e.target.value)} className="h-12 text-center tracking-widest text-lg font-bold rounded-xl" maxLength={6} placeholder="000000" />
                  </div>
                  <Button type="submit" className="w-full h-12 text-md bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold" disabled={loading}>
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <button type="button" onClick={() => setResetStep(1)} className="text-gray-500 text-sm w-full font-medium">Change Email</button>
                </form>
              )}
              {resetStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="newPass">New Password</Label>
                    <Input id="newPass" type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-12 rounded-xl" placeholder="At least 6 characters" />
                  </div>
                  <Button type="submit" className="w-full h-12 text-md bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              )}
            </div>
          )}
          
          <div className="text-center text-sm text-gray-500 mt-4">
              Don't have an account? <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">Sign up</Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
