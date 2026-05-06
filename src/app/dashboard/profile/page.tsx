"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Mail, Shield, Wallet, Clock, CheckCircle, Phone, MapPin, Key } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function ProfilePage() {
  const { user: authUser, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newGender, setNewGender] = useState("");
  const [newDob, setNewDob] = useState("");

  const [isPhoneVerifyModalOpen, setIsPhoneVerifyModalOpen] = useState(false);
  const [phoneToVerify, setPhoneToVerify] = useState("");
  const [verifyOtp, setVerifyOtp] = useState("");
  const [phoneVerifyStep, setPhoneVerifyStep] = useState(1);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isPhoneVerifyLoading, setIsPhoneVerifyLoading] = useState(false);

  const [isEmailVerifyModalOpen, setIsEmailVerifyModalOpen] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState("");
  const [emailVerifyOtp, setEmailVerifyOtp] = useState("");
  const [emailVerifyStep, setEmailVerifyStep] = useState(1);
  const [isEmailVerifyLoading, setIsEmailVerifyLoading] = useState(false);

  // Password Change States
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);
  const [passwordChangeStep, setPasswordChangeStep] = useState(1); // 1: Send OTP, 2: Verify, 3: New Pass
  const [passChangeOtp, setPassChangeOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isPassLoading, setIsPassLoading] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [activeTab, setActiveTab] = useState<"deposits" | "earnings">("deposits");

  // Bank Details States
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [payoutType, setPayoutType] = useState<"bank" | "upi" | null>(null);
  const [accNumber, setAccNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [isSavingBank, setIsSavingBank] = useState(false);

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

  const handleSendEmailOTP = async () => {
    if (!emailToVerify) return toast.error("Enter email address");
    setIsEmailVerifyLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: emailToVerify }),
      });
      if (res.ok) {
        setEmailVerifyStep(2);
        toast.success("OTP sent to your email!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsEmailVerifyLoading(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!emailVerifyOtp) return toast.error("Enter OTP");
    setIsEmailVerifyLoading(true);
    try {
      const verifyRes = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: emailToVerify, code: emailVerifyOtp }),
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        throw new Error(data.error || "Invalid OTP");
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToVerify }),
      });
      if (res.ok) {
        toast.success("Email connected successfully!");
        setIsEmailVerifyModalOpen(false);
        fetchProfile();
        if (refreshUser) await refreshUser();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to connect email (Already in use?)");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setIsEmailVerifyLoading(false);
    }
  };

  const handleSendPhoneOTP = async () => {
    if (!phoneToVerify) return toast.error("Enter phone number");
    setIsPhoneVerifyLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const formattedPhone = phoneToVerify.startsWith('+') ? phoneToVerify : `+91${phoneToVerify}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setPhoneVerifyStep(2);
      toast.success("OTP sent!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsPhoneVerifyLoading(false);
    }
  };

  const handleVerifyPhoneOTP = async () => {
    if (!verifyOtp) return toast.error("Enter OTP");
    setIsPhoneVerifyLoading(true);
    try {
      await confirmationResult.confirm(verifyOtp);
      const formattedPhone = phoneToVerify.startsWith('+') ? phoneToVerify : `+91${phoneToVerify}`;
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone }),
      });
      if (res.ok) {
        toast.success("Phone verified successfully!");
        setIsPhoneVerifyModalOpen(false);
        fetchProfile();
        if (refreshUser) await refreshUser();
      } else {
        toast.error("Failed to save phone number");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setIsPhoneVerifyLoading(false);
    }
  };

  // Password Change Handlers
  const handleSendPasswordChangeOTP = async () => {
    if (!profile.email) return toast.error("No email linked to this account");
    setIsPassLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: profile.email }),
      });
      if (res.ok) {
        toast.success("OTP sent to your email!");
        setPasswordChangeStep(2);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsPassLoading(false);
    }
  };

  const handleVerifyPasswordChangeOTP = async () => {
    if (!passChangeOtp) return toast.error("Enter OTP");
    setIsPassLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: profile.email, code: passChangeOtp, dontDelete: true }),
      });
      if (res.ok) {
        toast.success("Identity verified!");
        setPasswordChangeStep(3);
      } else {
        const data = await res.json();
        toast.error(data.error || "Invalid OTP");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsPassLoading(false);
    }
  };

  const handleFinalizePasswordChange = async () => {
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setIsPassLoading(true);
    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          identifier: profile.email, 
          code: passChangeOtp, 
          newPassword 
        }),
      });
      if (res.ok) {
        toast.success("Password updated successfully!");
        setIsPasswordChangeModalOpen(false);
        setPasswordChangeStep(1);
        setPassChangeOtp("");
        setNewPassword("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update password");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsPassLoading(false);
    }
  };

  const handleSaveBankDetails = async () => {
    setIsSavingBank(true);
    try {
      const body: any = {};
      if (payoutType === "bank") {
        if (!accNumber || !ifscCode || !beneficiaryName) {
          throw new Error("Please fill all bank details");
        }
        body.bankDetails = {
          accountNumber: accNumber,
          ifscCode: ifscCode,
          beneficiaryName: beneficiaryName,
        };
      } else if (payoutType === "upi") {
        if (!upiId) throw new Error("Please enter UPI ID");
        body.upiId = upiId;
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("Payout details saved successfully!");
        setIsBankModalOpen(false);
        fetchProfile();
        if (refreshUser) refreshUser();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save details");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleWithdrawEarnings = async () => {
    if (totalEarnings <= 0) return toast.error("No earnings available for withdrawal.");
    if (!profile.bankDetails && !profile.upiId) {
      toast.error("Please connect a payout method first.");
      setIsBankModalOpen(true);
      return;
    }

    setIsWithdrawing(true);
    try {
      const res = await fetch("/api/user/withdraw-earnings", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchOrders();
      } else {
        toast.error(data.error || "Failed to request withdrawal");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleWithdrawDeposit = async (orderId: string) => {
    setIsWithdrawing(true);
    try {
      const res = await fetch("/api/user/withdraw-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchOrders();
      } else {
        toast.error(data.error || "Failed to request refund");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.replace("/login");
      return;
    }
    fetchProfile();
    fetchOrders();
  }, [authUser, authLoading]);

  const fetchProfile = async () => {
    const res = await fetch("/api/user/profile");
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
      setNewName(data.name);
      setNewAddress(data.address || "");
      setNewGender(data.gender || "");
      setNewDob(data.dob ? new Date(data.dob).toISOString().split('T')[0] : "");
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    const res = await fetch("/api/orders");
    if (res.ok) setOrders(await res.json());
  };

  const handleUpdate = async () => {
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, address: newAddress, gender: newGender, dob: newDob }),
    });
    if (res.ok) {
      toast.success("Profile updated");
      setIsEditing(false);
      fetchProfile();
    } else {
      toast.error("Failed to update profile");
    }
  };

  const refundableOrders = orders.filter(o => o.renterId?._id === authUser?.id && o.depositRefundStatus !== "Pending");
  const totalRefundable = refundableOrders.reduce((sum, o) => sum + (o.depositRefundStatus === "Available" ? o.securityDeposit : 0), 0);
  const totalLocked = orders.filter(o => o.renterId?._id === authUser?.id && o.depositRefundStatus === "Pending")
    .reduce((sum, o) => sum + o.securityDeposit, 0);

  const earningOrders = orders.filter(o => o.ownerId?._id === authUser?.id);
  const totalAvailableEarnings = earningOrders.reduce((sum, o) => sum + (o.ownerEarningStatus === "Available" ? o.ownerEarning : 0), 0);
  const totalLockedEarnings = earningOrders.filter(o => o.ownerEarningStatus === "Pending")
    .reduce((sum, o) => sum + o.ownerEarning, 0);

  if (authLoading || loading) return <div className="text-center py-24 text-gray-400 font-medium">Loading profile...</div>;
  if (!profile) return <div className="text-center py-24 text-red-500 font-bold">Could not load profile. Please try again.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-12 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/50 shadow-inner">
            <User size={48} className="text-white" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black mb-2">{profile.name}</h1>
            <p className="text-indigo-100 font-medium flex items-center gap-2 justify-center md:justify-start">
              <Mail size={16} /> {profile.email || "No Email Linked, Link using Edit Profile Option"}
            </p>
          </div>
        </div>
        <div className="absolute right-[-10%] top-[-20%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 border-gray-100 shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Shield size={18} className="text-indigo-600" /> Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            {!isEditing ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Full Name</label>
                    <p className="text-gray-900 font-bold text-lg">{profile.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Phone Number</label>
                    <p className="text-gray-900 font-bold text-md flex items-center gap-2">
                      <Phone size={14} className="text-indigo-600" />
                      {profile.phone || "Not set"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">House Address</label>
                    <p className="text-gray-900 font-medium text-sm leading-relaxed flex items-start gap-2">
                      <MapPin size={14} className="text-indigo-600 mt-1 shrink-0" />
                      {profile.address || "Not set"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold mt-1">Visible to buyer after payment.</p>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Gender</label>
                    <p className="text-gray-900 font-medium text-sm">{profile.gender || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Date of Birth</label>
                    <p className="text-gray-900 font-medium text-sm">{profile.dob ? new Date(profile.dob).toLocaleDateString() : "Not set"}</p>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                   <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full rounded-xl h-11 font-bold hover:bg-gray-50">Edit Profile</Button>
                   {profile.email && (
                     <Button variant="ghost" onClick={() => { setPasswordChangeStep(1); setIsPasswordChangeModalOpen(true); }} className="w-full rounded-xl h-11 font-bold text-indigo-600 hover:bg-indigo-50 flex items-center justify-center gap-2">
                        <Key size={16} /> Change Password
                     </Button>
                   )}
                </div>
              </>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Full Name</label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-12 rounded-xl" placeholder="Full Name" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Email Address</label>
                  <div className="flex gap-2">
                    <Input value={profile.email || "Not Connected"} className="h-12 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" readOnly />
                    {!profile.email && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEmailToVerify("");
                          setEmailVerifyOtp("");
                          setEmailVerifyStep(1);
                          setIsEmailVerifyModalOpen(true);
                        }}
                        className="h-12 font-bold whitespace-nowrap"
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Phone Number</label>
                  <div className="flex gap-2">
                    <Input value={profile.phone || "Not Set"} className="h-12 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" readOnly />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPhoneToVerify("");
                        setVerifyOtp("");
                        setPhoneVerifyStep(1);
                        setIsPhoneVerifyModalOpen(true);
                      }}
                      className="h-12 font-bold whitespace-nowrap"
                    >
                      Verify New
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">House Address</label>
                  <textarea
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full min-h-[100px] p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="House Address (Shared after payment)"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent"
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Date of Birth</label>
                  <Input type="date" value={newDob} onChange={(e) => setNewDob(e.target.value)} className="h-12 rounded-xl" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdate} className="flex-1 bg-indigo-600 rounded-xl h-11 font-bold">Save Changes</Button>
                  <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl h-11 font-bold">Cancel</Button>
                </div>
              </div>
            )}
            <div className="h-px bg-gray-100 my-4"></div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Role</label>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black border border-indigo-100 uppercase">{profile.role}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-transparent shadow-xl rounded-3xl overflow-hidden bg-white border border-gray-100">
          <CardHeader className="bg-indigo-600 text-white pb-6 pt-8 px-8">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <Wallet size={24} /> Financial Summary
            </CardTitle>
            <CardDescription className="text-indigo-100 font-medium opacity-90">Manage your deposits and earnings</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl mb-8">
               <button 
                 onClick={() => setActiveTab("deposits")}
                 className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === "deposits" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
               >
                 Security Deposits
               </button>
               <button 
                 onClick={() => setActiveTab("earnings")}
                 className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === "earnings" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
               >
                 Outfit Earnings
               </button>
            </div>

            {activeTab === "deposits" ? (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 text-center sm:text-left">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2 justify-center sm:justify-start">
                      <Clock size={14} /> Locked in Rentals
                    </div>
                    <div className="text-3xl font-black text-gray-900">₹{totalLocked}</div>
                    <p className="text-[10px] text-gray-500 mt-2 font-bold leading-tight">These deposits are held for active or ongoing rentals.</p>
                  </div>
                  <div className="bg-green-50/50 rounded-3xl p-6 border border-green-100 text-center sm:text-left relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="text-xs font-black text-green-600 uppercase tracking-widest mb-2 flex items-center gap-2 justify-center sm:justify-start">
                        <CheckCircle size={14} /> Refundable Balance
                      </div>
                      <div className="text-3xl font-black text-green-600">₹{totalRefundable}</div>
                      <p className="text-[10px] text-green-700/70 mt-2 font-bold leading-tight">Amount available to withdraw to your bank account.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">Recent Deposit Activity</h3>
                  {refundableOrders.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No deposit history found.</p>
                  ) : (
                    <div className="space-y-3">
                      {refundableOrders.slice(0, 5).map((o: any) => (
                        <div key={o._id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-sm transition-shadow">
                          <div>
                            <div className="text-sm font-bold text-gray-900">{o.listingId?.title || "Rental Item"}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">ID: {o._id.slice(-8)}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-black text-indigo-600">₹{o.securityDeposit}</div>
                              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block ${o.depositRefundStatus === "Completed" ? "bg-green-100 text-green-700" :
                                  o.depositRefundStatus === "Requested" ? "bg-orange-100 text-orange-700" : "bg-indigo-100 text-indigo-700"
                                }`}>
                                {o.depositRefundStatus}
                              </div>
                            </div>
                            {o.depositRefundStatus === "Available" && (
                              <Button 
                                onClick={() => handleWithdrawDeposit(o._id)} 
                                disabled={isWithdrawing}
                                size="sm" 
                                className="bg-indigo-600 text-[10px] font-black uppercase tracking-widest h-8"
                              >
                                {isWithdrawing ? "..." : "Withdraw"}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 text-center sm:text-left">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2 justify-center sm:justify-start">
                      <Clock size={14} /> Pending Earnings
                    </div>
                    <div className="text-3xl font-black text-gray-900">₹{totalLockedEarnings}</div>
                    <p className="text-[10px] text-gray-500 mt-2 font-bold leading-tight">Income from ongoing rentals, released after return.</p>
                  </div>
                  <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100 text-center sm:text-left relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2 justify-center sm:justify-start">
                        <CheckCircle size={14} /> Available Earnings
                      </div>
                      <div className="text-3xl font-black text-indigo-600">₹{totalAvailableEarnings}</div>
                      <p className="text-[10px] text-indigo-700/70 mt-2 font-bold leading-tight">Pure profit from your listings ready for withdrawal.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">Outfit Rental History</h3>
                  {earningOrders.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No earnings found yet. List an outfit to start earning!</p>
                  ) : (
                    <div className="space-y-3">
                      {earningOrders.slice(0, 5).map((o: any) => (
                        <div key={o._id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-sm transition-shadow">
                          <div>
                            <div className="text-sm font-bold text-gray-900">{o.listingId?.title || "Rental Item"}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Renter: {o.renterId?.name || "Anonymous"}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-green-600">+₹{o.ownerEarning}</div>
                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block ${o.ownerEarningStatus === "Completed" ? "bg-green-100 text-green-700" :
                                o.ownerEarningStatus === "Requested" ? "bg-orange-100 text-orange-700" : "bg-indigo-100 text-indigo-700"
                              }`}>
                              {o.ownerEarningStatus}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {totalAvailableEarnings > 0 && (
                     <Button 
                        onClick={handleWithdrawEarnings} 
                        disabled={isWithdrawing}
                        className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-green-100 mt-4"
                     >
                        {isWithdrawing ? "Processing..." : `Withdraw Earnings (₹${totalAvailableEarnings})`}
                     </Button>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="flex flex-col gap-3">
                 <Button 
                    onClick={() => {
                      setPayoutType(profile.bankDetails ? "bank" : (profile.upiId ? "upi" : null));
                      setAccNumber(profile.bankDetails?.accountNumber || "");
                      setIfscCode(profile.bankDetails?.ifscCode || "");
                      setBeneficiaryName(profile.bankDetails?.beneficiaryName || "");
                      setUpiId(profile.upiId || "");
                      setIsBankModalOpen(true);
                    }}
                    className="bg-indigo-600 text-white rounded-2xl h-14 font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-lg"
                  >
                    { (profile.bankDetails || profile.upiId) ? "Update Payout Method" : "Connect Bank/UPI" }
                 </Button>
              </div>
            </div>
           </CardContent>
        </Card>
      </div>

      {/* Bank/UPI Modal */}
      <Dialog open={isBankModalOpen} onOpenChange={setIsBankModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
           <div className="bg-indigo-600 p-8 text-white">
              <h2 className="text-2xl font-black">Payout Method</h2>
              <p className="text-indigo-100 opacity-80 text-sm font-medium">Where should we send your earnings?</p>
           </div>
           
           <div className="p-8 space-y-6">
              <div className="flex gap-4">
                 <button 
                   onClick={() => setPayoutType("bank")}
                   className={`flex-1 py-4 rounded-2xl border-2 transition-all font-bold flex flex-col items-center gap-2 ${payoutType === "bank" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-100 text-gray-400 hover:border-gray-200"}`}
                 >
                   <Shield size={20} />
                   Bank Account
                 </button>
                 <button 
                   onClick={() => setPayoutType("upi")}
                   className={`flex-1 py-4 rounded-2xl border-2 transition-all font-bold flex flex-col items-center gap-2 ${payoutType === "upi" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-100 text-gray-400 hover:border-gray-200"}`}
                 >
                   <Wallet size={20} />
                   UPI ID
                 </button>
              </div>

              {payoutType === "bank" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Beneficiary Name</label>
                      <Input placeholder="As per bank records" value={beneficiaryName} onChange={(e) => setBeneficiaryName(e.target.value)} className="h-12 rounded-xl" />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Account Number</label>
                      <Input placeholder="Enter account number" value={accNumber} onChange={(e) => setAccNumber(e.target.value)} className="h-12 rounded-xl" />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">IFSC Code</label>
                      <Input placeholder="SBIN0001234" value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} className="h-12 rounded-xl" />
                   </div>
                </div>
              )}

              {payoutType === "upi" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">UPI ID</label>
                      <Input placeholder="username@okaxis" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="h-12 rounded-xl" />
                   </div>
                   <p className="text-[11px] text-gray-400 font-medium px-1 leading-relaxed">
                     Make sure your UPI ID is correct. Payments will be sent directly to this ID.
                   </p>
                </div>
              )}

              <div className="pt-2">
                 <Button 
                   onClick={handleSaveBankDetails} 
                   disabled={isSavingBank || !payoutType} 
                   className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-lg shadow-xl shadow-indigo-100"
                 >
                   {isSavingBank ? "Saving..." : "Save Payout Details"}
                 </Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>

      <div id="recaptcha-container"></div>
      <Dialog open={isPhoneVerifyModalOpen} onOpenChange={setIsPhoneVerifyModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>Verify Phone Number</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">Add or update your verified phone number.</p>
            {phoneVerifyStep === 1 ? (
              <>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">+91</span>
                  <Input
                    placeholder="9876543210"
                    value={phoneToVerify}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.startsWith("+91")) val = val.slice(3);
                      setPhoneToVerify(val);
                    }}
                    className="h-12 pl-12"
                  />
                </div>
                <Button onClick={handleSendPhoneOTP} disabled={isPhoneVerifyLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12">
                  {isPhoneVerifyLoading ? "Sending..." : "Send OTP"}
                </Button>
              </>
            ) : (
              <>
                <Input
                  placeholder="Enter 6-digit OTP"
                  value={verifyOtp}
                  onChange={(e) => setVerifyOtp(e.target.value)}
                  maxLength={6}
                  className="h-12 tracking-widest text-center text-lg font-bold"
                />
                <Button onClick={handleVerifyPhoneOTP} disabled={isPhoneVerifyLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12">
                  {isPhoneVerifyLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEmailVerifyModalOpen} onOpenChange={setIsEmailVerifyModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>Verify Email Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">Connect a verified email to your account.</p>
            {emailVerifyStep === 1 ? (
              <>
                <Input
                  placeholder="example@email.com"
                  type="email"
                  value={emailToVerify}
                  onChange={(e) => setEmailToVerify(e.target.value)}
                  className="h-12"
                />
                <Button onClick={handleSendEmailOTP} disabled={isEmailVerifyLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12">
                  {isEmailVerifyLoading ? "Sending..." : "Send OTP"}
                </Button>
              </>
            ) : (
              <>
                <Input
                  placeholder="Enter 6-digit OTP"
                  value={emailVerifyOtp}
                  onChange={(e) => setEmailVerifyOtp(e.target.value)}
                  maxLength={6}
                  className="h-12 tracking-widest text-center text-lg font-bold"
                />
                <Button onClick={handleVerifyEmailOTP} disabled={isEmailVerifyLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12">
                  {isEmailVerifyLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordChangeModalOpen} onOpenChange={setIsPasswordChangeModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500 text-center">Verify your identity to set a new password.</p>
            {passwordChangeStep === 1 ? (
              <div className="space-y-4">
                <Input value={profile?.email} className="h-12 bg-gray-50 font-medium" readOnly />
                <Button onClick={handleSendPasswordChangeOTP} disabled={isPassLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-bold">
                  {isPassLoading ? "Sending..." : "Send OTP to Email"}
                </Button>
              </div>
            ) : passwordChangeStep === 2 ? (
              <div className="space-y-4">
                <Input
                  placeholder="Enter 6-digit OTP"
                  value={passChangeOtp}
                  onChange={(e) => setPassChangeOtp(e.target.value)}
                  maxLength={6}
                  className="h-12 tracking-widest text-center text-lg font-bold rounded-xl"
                />
                <Button onClick={handleVerifyPasswordChangeOTP} disabled={isPassLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-bold">
                  {isPassLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  type="password"
                  placeholder="New Password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 rounded-xl"
                />
                <Button onClick={handleFinalizePasswordChange} disabled={isPassLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-bold">
                  {isPassLoading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
