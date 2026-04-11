"use client";
import { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false });

export default function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const [listing, setListing] = useState<any>(null);
  const { user } = useAuth();
  const router = useRouter();

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [deliveryType, setDeliveryType] = useState("Pickup");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);


  
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

      if (user.email === "tester@stylep2p.com") {
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
        key: 'rzp_test_placeholder',
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "StyleP2P",
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
      rzp.on('payment.failed', function (response: any){
        toast.error(response.error.description);
      });
      rzp.open();

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (!listing) return <div className="text-center py-20 font-medium text-gray-500">Loading listing details...</div>;

  return (
    <div className="max-w-5xl mx-auto py-8">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
             <div className="bg-gray-100 rounded-3xl overflow-hidden aspect-square shadow-sm relative">
                {listing.images && listing.images.length > 0 ? (
                  <img src={listing.images[0]} alt="Primary" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex justify-center items-center text-gray-400">No Image Available</div>
                )}
             </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
             <div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 leading-tight">{listing.title}</h1>
                <p className="text-lg text-gray-500 font-medium">{listing.category}</p>
             </div>
             
             <div className="bg-indigo-50 text-indigo-700 font-bold px-4 py-2 rounded-lg inline-block border border-indigo-100">
                Size: {listing.size}
             </div>

             <div className="flex items-end gap-3 pb-6 border-b border-gray-100">
               <span className="text-4xl font-black text-indigo-600">₹{listing.pricePerDay}</span>
               <span className="text-gray-500 font-semibold mb-1">/ per day</span>
             </div>

             <div>
               <h3 className="font-bold text-gray-900 mb-2 text-lg">Description</h3>
               <p className="text-gray-600 leading-relaxed">{listing.description}</p>
             </div>

             {listing.location && listing.location.lat && (
             <div className="py-4">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Location Area (10km Pickup Radius)</h3>
                <div className="h-64 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-500 font-semibold shadow-inner border border-gray-100">Map is loading...</div>
                   <div className="h-64 rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative z-0">
                     <MapContainer
                        center={[listing.location.lat, listing.location.lng]}
                        zoom={11}
                        scrollWheelZoom={false}
                        style={{ width: '100%', height: '100%' }}
                     >
                        <TileLayer
                           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Circle
                           center={[listing.location.lat, listing.location.lng]}
                           pathOptions={{ fillColor: '#4f46e5', fillOpacity: 0.15, color: '#4f46e5' }}
                           radius={5000}
                        />
                     </MapContainer>
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
    </div>
  );
}
