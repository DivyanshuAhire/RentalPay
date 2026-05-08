"use client";
import { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { Share2, MapPin, ChevronLeft, ChevronRight } from "lucide-react";



export default function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const [listing, setListing] = useState<any>(null);
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [deliveryType, setDeliveryType] = useState("Pickup");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isPhoneVerifyModalOpen, setIsPhoneVerifyModalOpen] = useState(false);
  const [phoneToVerify, setPhoneToVerify] = useState("");
  const [verifyOtp, setVerifyOtp] = useState("");
  const [phoneVerifyStep, setPhoneVerifyStep] = useState(1);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isPhoneVerifyLoading, setIsPhoneVerifyLoading] = useState(false);

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
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
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneToVerify }),
      });
      if (res.ok) {
        toast.success("Phone verified successfully!");
        setIsPhoneVerifyModalOpen(false);
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



  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    const res = await fetch(`/api/listings/${id}`);
    const data = await res.json();
    if (res.ok) setListing(data);
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    return Math.abs(Math.floor((e.getTime() - s.getTime()) / (1000 * 3600 * 24))) + 1;
  };

  const toInputDate = (dateObj?: Date) => {
    if (!dateObj) return "";
    return new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  }

  const handleBooking = async () => {
    if (!user) {
      toast.error("Please login to book");
      router.push("/login");
      return;
    }
    if (!user.phone) {
      toast.error("Please verify your phone number to continue.");
      setIsPhoneVerifyModalOpen(true);
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    setBookingLoading(true);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id, startDate, endDate, deliveryType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      const rzpRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: data.order._id })
      });
      const rzpData = await rzpRes.json();
      if (!rzpRes.ok) throw new Error(rzpData.error || "Payment creation failed");

      if (user?.role === "TESTER") {
        toast.info("Simulation Mode: Bypassing Razorpay checkout...");
        // Directly simulate the successful payment handler
        const verifyRes = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: rzpData.id,
            razorpay_payment_id: "mock_test_pay_id",
            razorpay_signature: "mock_tester_signature",
            orderId: data.order._id
          })
        });
        if (verifyRes.ok) {
          toast.success("Simulation Complete! Order booked.");
          setIsModalOpen(false);
          router.push("/dashboard");
        } else {
          toast.error("Mock verification failed.");
        }
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "RentalPay",
        description: `Rental for ${listing.title}`,
        order_id: rzpData.id,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: data.order._id
            })
          });
          if (verifyRes.ok) {
            toast.success("Payment successful! Order booked.");
            setIsModalOpen(false);
            router.push("/dashboard");
          } else {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#4f46e5" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(response.error.description);
      });
      rzp.open();

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: listing.title,
      text: `Check out this ${listing.title} on RentalPay!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing", err);
    }
  };

  if (!listing) return <div className="text-center py-20 font-medium text-gray-500">Loading listing details...</div>;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-3xl overflow-hidden aspect-[4/5] shadow-sm relative group border border-gray-100">
            {listing.images && listing.images.length > 0 ? (
              <>
                {/* Blurred Backdrop to match proportions automatically */}
                <img 
                  src={listing.images[activeImg]} 
                  className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 scale-125" 
                  alt=""
                />
                {/* Main Content Image */}
                <img 
                  src={listing.images[activeImg]} 
                  alt="Primary" 
                  className="relative w-full h-full object-contain transition-all duration-700 group-hover:scale-[1.03]" 
                />
              </>
            ) : (
              <div className="w-full h-full flex justify-center items-center text-gray-400">No Image Available</div>
            )}
            
            {listing.images && listing.images.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImg((prev) => (prev - 1 + listing.images.length) % listing.images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setActiveImg((prev) => (prev + 1) % listing.images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {listing.images && listing.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                {listing.images.map((_: any, idx: number) => (
                  <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${activeImg === idx ? 'bg-white w-4' : 'bg-white/50'}`} />
                ))}
              </div>
            )}
          </div>

          {listing.images && listing.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
              {listing.images.map((img: string, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImg(idx)}
                  className={`w-16 aspect-[4/5] rounded-xl overflow-hidden cursor-pointer border-2 transition-all flex-shrink-0 relative ${activeImg === idx ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-transparent hover:border-gray-200'}`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  {activeImg !== idx && <div className="absolute inset-0 bg-white/40" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 leading-tight">{listing.title}</h1>
              <p className="text-lg text-gray-500 font-medium">{listing.category}</p>
            </div>
            <Button variant="outline" size="icon" onClick={handleShare} className="rounded-full h-12 w-12 border-gray-200 hover:bg-gray-50">
              <Share2 className="w-5 h-5 text-gray-600" />
            </Button>
          </div>

          <div className="flex gap-3">
            <div className="bg-indigo-50 text-indigo-700 font-bold px-4 py-2 rounded-lg inline-block border border-indigo-100">
              Size: {listing.size}
            </div>
            <div className="bg-pink-50 text-pink-700 font-bold px-4 py-2 rounded-lg inline-block border border-pink-100">
              Gender: {listing.gender || "Unisex"}
            </div>
          </div>

          <div className="flex items-end gap-3 pb-6 border-b border-gray-100">
            <span className="text-4xl font-black text-indigo-600">₹{listing.pricePerDay}</span>
            <span className="text-gray-500 font-semibold mb-1">/ per day</span>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">Description</h3>
            <p className="text-gray-600 leading-relaxed">{listing.description}</p>
          </div>

          {listing.location && listing.location.address && (
            <div className="py-4">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Location</h3>
              <div className="flex items-start gap-3 text-gray-600 bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:bg-gray-100/50">
                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="font-medium leading-relaxed">{listing.location.address}</span>
              </div>
            </div>
          )}

          <div className="pb-4">
            <h3 className="font-bold text-gray-900 mb-2 text-lg">Owner Details</h3>
            <div className="flex items-center gap-3 bg-white border rounded-full px-5 py-3 shadow-sm inline-block">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {listing.ownerId?.name?.charAt(0) || "U"}
              </div>
              <div className="text-gray-700 font-medium">{listing.ownerId?.name || "Unknown"}</div>
            </div>
          </div>

          {/* Book Action */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger render={<Button className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-xl hover:shadow-indigo-500/30 transition-all rounded-xl" />}>
              Rent Now
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Complete your Booking</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="bg-gray-50 p-5 rounded-2xl space-y-4 border border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block text-gray-700">Start Date</label>
                      <Input type="date" value={toInputDate(startDate)} onChange={(e) => setStartDate(new Date(e.target.value))} className="h-12 bg-white" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block text-gray-700">End Date</label>
                      <Input type="date" value={toInputDate(endDate)} onChange={(e) => setEndDate(new Date(e.target.value))} className="h-12 bg-white" />
                    </div>
                  </div>
                </div>

                <div className="px-1">
                  <label className="text-sm font-bold mb-2 block text-gray-700">Delivery Preference</label>
                  <Select value={deliveryType} onValueChange={(val) => val && setDeliveryType(val)}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pickup">Self Pickup</SelectItem>
                      <SelectItem value="Delivery">Delivery / Courier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {startDate && endDate && calculateDays() > 0 && (
                  <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 mt-2 space-y-3">
                    <div className="flex justify-between text-gray-600 font-medium">
                      <span>₹{listing.pricePerDay} x {calculateDays()} days</span>
                      <span className="text-gray-900">₹{listing.pricePerDay * calculateDays()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 font-medium">
                      <span>Security Deposit (Refundable)</span>
                      <span className="text-gray-900">₹{listing.deposit}</span>
                    </div>
                    <div className="h-px bg-indigo-200 my-2"></div>
                    <div className="flex justify-between font-black text-indigo-900 text-xl">
                      <span>Total Amount</span>
                      <span>₹{(listing.pricePerDay * calculateDays()) + listing.deposit}</span>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleBooking} disabled={bookingLoading} className="w-full h-12 text-md rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md">
                  {bookingLoading ? "Processing..." : "Pay & Confirm Booking"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      {/* Recaptcha container for phone auth */}
      <div id="recaptcha-container"></div>

      <Dialog open={isPhoneVerifyModalOpen} onOpenChange={setIsPhoneVerifyModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>Verify Phone Number</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">You need a verified phone number to make a booking.</p>
            {phoneVerifyStep === 1 ? (
              <>
                <Input
                  placeholder="Phone Number (e.g. 9876543210)"
                  value={phoneToVerify}
                  onChange={(e) => setPhoneToVerify(e.target.value)}
                  className="h-12"
                />
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
    </div>
  );
}
