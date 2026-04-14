"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Signup() {
  const [step, setStep] = useState(1); // 1: Identifier, 2: OTP, 3: Details
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      if (res.ok) {
        toast.success("OTP sent successfully!");
        setStep(2);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, code: otp }),
      });
      if (res.ok) {
        toast.success("Verified successfully!");
        setStep(3);
      } else {
        const data = await res.json();
        toast.error(data.error || "Invalid OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, identifier, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user);
        toast.success("Successfully registered");
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Failed to register");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center text-md">Join StyleP2P and start renting</CardDescription>
        </CardHeader>
        <CardContent>
           {step === 1 && (
             <form onSubmit={handleSendOTP} className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="identifier">Email</Label>
                 <Input id="identifier" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="h-12" placeholder="Email" />
               </div>
               <Button type="submit" className="w-full h-12 text-md mt-4 bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                  {loading ? "Sending..." : "Get OTP"}
               </Button>
             </form>
           )}

          {step === 2 && (
             <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                   <Label htmlFor="otp">Enter 6-Digit OTP</Label>
                   <Input id="otp" required value={otp} onChange={(e) => setOtp(e.target.value)} className="h-12 text-center tracking-widest text-lg font-bold" placeholder="123456" maxLength={6} />
                </div>
                <Button type="submit" className="w-full h-12 text-md mt-4 bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                     {loading ? "Verifying..." : "Verify OTP"}
                </Button>
                <button type="button" onClick={() => setStep(1)} className="text-indigo-600 text-sm w-full font-medium">Change email or phone</button>
             </form>
          )}

          {step === 3 && (
             <form onSubmit={handleFinalSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="h-12" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Create Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" />
                </div>
                <Button type="submit" className="w-full h-12 text-md mt-4 bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                     {loading ? "Creating Account..." : "Complete Registration"}
                </Button>
             </form>
          )}

          <div className="text-center text-sm text-gray-500 mt-6">
            Already have an account? <Link href="/login" className="text-indigo-600 font-semibold hover:underline">Log in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
