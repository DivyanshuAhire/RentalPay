"use client";
import { useState, useEffect, Suspense } from "react";
import { auth } from "@/lib/firebase";
import { updateProfile, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TERMS_AND_CONDITIONS } from "@/constants/terms";
import { toast } from "sonner";
import Link from "next/link";

function SignupContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1); // 1: Identifier, 2: OTP, 3: Details
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    let phone = searchParams.get("phone");
    if (phone) {
      if (phone.startsWith("+91")) phone = phone.slice(3);
      setIdentifier(phone);
    }
  }, [searchParams]);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const { refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());

  const setupRecaptcha = () => {
    if (!auth) {
      toast.error("Firebase is not configured. Please add NEXT_PUBLIC_FIREBASE_API_KEY to your environment.");
      return;
    }
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  };

  const syncWithBackend = async (user: any, displayName?: string) => {
    const res = await fetch("/api/auth/firebase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        uid: user.uid, 
        email: user.email || undefined, 
        phone: user.phoneNumber || undefined,
        name: displayName || user.displayName,
        gender: gender || undefined,
        address: address || undefined,
        dob: dob || undefined,
      }),
    });
    
    if (res.ok) {
      await refreshUser();
      toast.success("Successfully registered");
      router.push("/dashboard");
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to sync with server");
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast.error("Please agree to the Terms and Conditions to continue.");
      return;
    }
    setLoading(true);
    try {
      if (isEmail) {
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
      } else {
        // Phone Auth
        setupRecaptcha();
        const appVerifier = (window as any).recaptchaVerifier;
        const formattedPhone = identifier.startsWith('+') ? identifier : `+91${identifier}`;
        const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        setConfirmationResult(result);
        toast.success("OTP sent via SMS!");
        setStep(2);
      }
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
      if (isEmail) {
        const res = await fetch("/api/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, code: otp, dontDelete: true }),
        });
        if (res.ok) {
          toast.success("Verified successfully!");
          setStep(3);
        } else {
          const data = await res.json();
          toast.error(data.error || "Invalid OTP");
        }
      } else {
        await confirmationResult.confirm(otp);
        toast.success("Phone verified successfully!");
        setStep(3);
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEmail) {
        // Custom MongoDB Signup for Email
        const res = await fetch("/api/auth/email/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            name, 
            email: identifier, 
            password, 
            gender, 
            address, 
            dob,
            code: otp // Pass the OTP code here
          }),
        });

        if (res.ok) {
          await refreshUser();
          toast.success("Registration successful!");
          router.push("/dashboard");
        } else {
          const data = await res.json();
          toast.error(data.error || "Failed to register.");
        }
      } else {
        // Phone Signup still uses Firebase
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: name });
          await syncWithBackend(auth.currentUser, name);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during signup.");
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
          <div id="recaptcha-container"></div>
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Phone Number</Label>
                <div className="relative">
                  {!isEmail && identifier && /^\d+$/.test(identifier) && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">+91</span>
                  )}
                  <Input 
                    id="identifier" 
                    required 
                    value={identifier} 
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.startsWith("+91")) val = val.slice(3);
                      setIdentifier(val);
                    }} 
                    className={`h-12 ${!isEmail && identifier && /^\d+$/.test(identifier) ? "pl-12" : ""}`} 
                    placeholder="Email or 9876543210" 
                  />
                </div>
              </div>

              <div className="flex items-start space-x-2 py-2">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 leading-tight cursor-pointer">
                  I agree to the{" "}
                  <Dialog>
                    <DialogTrigger render={<button type="button" className="text-indigo-600 font-bold hover:underline" />}>
                      Terms and Conditions
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Terms & Conditions</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap font-medium leading-relaxed">
                        {TERMS_AND_CONDITIONS}
                      </div>
                    </DialogContent>
                  </Dialog>
                  {" "}and Privacy Policy.
                </Label>
              </div>

              <Button type="submit" className="w-full h-12 text-md mt-4 bg-indigo-600 hover:bg-indigo-700" disabled={loading || !agreedToTerms}>
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
              <button type="button" onClick={() => setStep(1)} className="text-indigo-600 text-sm w-full font-medium">Change identifier</button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="h-12" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select 
                  id="gender" 
                  required 
                  value={gender} 
                  onChange={(e) => setGender(e.target.value)} 
                  className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" required value={dob} onChange={(e) => setDob(e.target.value)} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" required value={address} onChange={(e) => setAddress(e.target.value)} className="h-12" placeholder="123 Main St, City, Country" />
              </div>
              {isEmail && (
                <div className="space-y-2">
                  <Label htmlFor="password">Create Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" />
                </div>
              )}
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

export default function Signup() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-gray-400 font-medium">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
