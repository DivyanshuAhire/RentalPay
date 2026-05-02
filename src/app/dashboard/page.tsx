"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function UnifiedDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && user.role === "USER") {
      fetchOrders();
      fetchUserListings();
    } else if (!loading) {
      setFetching(false);
    }
  }, [user, loading]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        setOrders(await res.json());
      }
    } finally {
      setFetching(false);
    }
  };

  const fetchUserListings = async () => {
    try {
      const res = await fetch(`/api/listings?ownerId=${user?.id}`);
      if (res.ok) setMyListings(await res.json());
    } catch (err) {}
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing permanently?")) return;
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Listing deleted");
      fetchUserListings();
    } else {
      toast.error("Failed to delete listing");
    }
  };


  const handleUpdateStatus = async (orderId: string, status: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
       method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ status })
    });
    if (res.ok) {
       toast.success(`Order marked as ${status}`);
       fetchOrders();
    } else {
       toast.error("Failed to update status");
    }
  };
 
  const handleWithdrawDeposit = async (orderId: string) => {
     const res = await fetch("/api/user/withdraw-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
     });
     if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        fetchOrders();
     } else {
        const error = await res.json();
        toast.error(error.error || "Withdrawal failed");
     }
  };

  const handleVerifyOTP = async (orderId: string, phase: 'pickup' | 'return') => {
    const otp = otpInputs[orderId];
    if (!otp || otp.length !== 6) {
       toast.error("Please enter a valid 6-digit OTP");
       return;
    }

    const res = await fetch(`/api/orders/${orderId}/verify-otp`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ otp, phase })
    });

    if (res.ok) {
       toast.success("Verification successful!");
       fetchOrders();
       // Clear the input
       setOtpInputs(prev => {
          const newState = { ...prev };
          delete newState[orderId];
          return newState;
       });
    } else {
       const error = await res.json();
       toast.error(error.error || "Verification failed");
    }
  };

  if (loading || fetching) return <div className="text-center py-24 font-medium text-gray-500">Loading dashboard...</div>;
  if (!loading && (!user || user.role !== "USER")) {
    router.replace("/login");
    return null;
  }

  const myRentedClothes = orders.filter((o: any) => o.renterId?._id?.toString() === user?.id?.toString());
  const incomingRequests = orders.filter((o: any) => o.ownerId?._id?.toString() === user?.id?.toString());

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-br from-indigo-700 to-purple-800 p-10 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
         <div className="relative z-10">
           <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">My Dashboard</h1>
           <p className="text-indigo-100 font-medium text-lg opacity-90">Manage the clothes you are renting out and track items you've rented.</p>
         </div>
         <Link href="/dashboard/add-listing" className="relative z-10 w-full md:w-auto">
            <Button className="w-full bg-white text-indigo-700 hover:bg-gray-50 hover:shadow-lg font-black rounded-xl h-14 px-8 shadow-sm transition-all text-md border-0">
               + Add New Listing
            </Button>
         </Link>
         <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
       </div>
 
       {/* SECTION: PUBLISHING HUB (Incoming Requests) */}
       <div>
           <h2 className="text-2xl font-black text-gray-900 mb-8 border-l-4 border-indigo-600 pl-4">Incoming Booking Requests (Sales)</h2>

           {incomingRequests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
             <div className="text-gray-500 font-medium">No booking requests on your items yet. List more clothes!</div>
          </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {incomingRequests.map((order: any) => (
                <Card key={order._id} className="overflow-hidden bg-white hover:shadow-xl transition-shadow border-gray-100 shadow-sm rounded-3xl p-8 flex flex-col">
                   <div className="flex justify-between items-start mb-6">
                      <div className="max-w-[70%]">
                         <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{order.listingId?.title || "Listing Removed"}</h3>
                         <div className="text-sm font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                            {new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}
                         </div>
                      </div>
                      <div className="text-right">
                          <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Rental Earning</div>
                          <div className="text-3xl font-black text-green-500">₹{order.ownerEarning}</div>
                          <div className={`text-[9px] font-black uppercase mt-1 px-2 py-0.5 rounded inline-block ${
                             order.ownerEarningStatus === "Available" ? "bg-green-100 text-green-700" :
                             order.ownerEarningStatus === "Requested" ? "bg-orange-100 text-orange-700" :
                             order.ownerEarningStatus === "Completed" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-400"
                          }`}>
                             Payout: {order.ownerEarningStatus}
                          </div>
                       </div>
                   </div>
                   
                   <div className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-2xl mb-6 border border-gray-100 flex-grow">
                      <div className="text-sm font-bold text-gray-900 mb-2">Renter Details</div>
                      <div className="text-gray-700 font-medium mb-1">{order.renterId?.name}</div>
                      <div className="text-gray-500 text-sm mb-1">Email: {order.renterId?.email}</div>
                      <div className="text-gray-500 text-sm mb-1">Phone: {order.renterId?.phone || "Not provided"}</div>
                      <div className="text-gray-500 text-xs mb-3 italic">Address: {order.renterId?.address || "Not provided"}</div>
                      <div className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-xs font-bold border border-indigo-100">
                         Delivery: {order.deliveryType}
                      </div>
                   </div>
 
                   <div className="mt-auto">
                      <div className="flex flex-wrap gap-3 items-center justify-between bg-white pt-4 border-t border-gray-50">
                         <div className="flex gap-2">
                            <span className="px-4 py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl border border-gray-200">Payment: {order.paymentStatus}</span>
                            <span className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100">Status: {order.status}</span>
                         </div>
                         {/* Mark Delivered removed, now handled by Pickup OTP */}
                         {order.status === "Delivered" && (
                            <Button onClick={() => handleUpdateStatus(order._id, 'Returned')} className="bg-purple-600 hover:bg-purple-700 rounded-xl h-11 text-sm font-bold shadow-md">Mark Returned</Button>
                         )}
                         {/* Complete Order removed, now handled by Return OTP */}

                         {/* OTP VERIFICATION FOR SELLER (PICKUP) */}
                         {order.paymentStatus === "Paid" && order.status === "Accepted" && (
                            <div className="w-full mt-6 bg-indigo-50 p-6 rounded-[1.5rem] border border-indigo-100 flex flex-col md:flex-row items-center gap-4">
                               <div className="flex-1 w-full">
                                  <div className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-1">Verify Pickup OTP</div>
                                  <div className="text-[10px] text-indigo-500 font-medium mb-3">Ask the renter for the 6-digit code to release your earnings.</div>
                                  <input 
                                     type="text" 
                                     placeholder="Ex: 123456" 
                                     className="w-full h-11 px-4 rounded-xl border border-indigo-200 text-indigo-900 font-black tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none"
                                     value={otpInputs[order._id] || ""}
                                     onChange={(e) => setOtpInputs({ ...otpInputs, [order._id]: e.target.value })}
                                     maxLength={6}
                                  />
                               </div>
                               <Button 
                                  onClick={() => handleVerifyOTP(order._id, 'pickup')} 
                                  className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 h-11 px-8 rounded-xl text-xs font-black shadow-lg shadow-indigo-200"
                               >
                                  Verify & Unlock Earnings
                                </Button>
                            </div>
                         )}

                         {/* OTP DISPLAY FOR SELLER (RETURN) */}
                         {order.status === "Returned" && (
                            <div className="w-full mt-6 bg-purple-50 p-6 rounded-[1.5rem] border border-purple-100 flex items-center justify-between">
                               <div>
                                  <div className="text-xs font-black text-purple-700 uppercase tracking-widest mb-1">Return Verification Code</div>
                                  <div className="text-[10px] text-purple-500 font-medium">Give this code to the renter to complete the return.</div>
                                </div>
                                <div className="text-3xl font-black text-purple-700 tracking-[0.2em] bg-white px-6 py-2 rounded-xl border border-purple-200 shadow-sm">
                                   {order.returnOTP}
                                </div>
                             </div>
                          )}
                      </div>
                   </div>
                </Card>
             ))}
          </div>
          )}
       </div>
 
       <ListingsSection listings={myListings} onDelete={handleDeleteListing} />
 
       {/* SECTION: RENTING HUB (Purchases) */}
       <div>
          <h2 className="text-2xl font-black text-gray-900 mb-6 border-l-4 border-purple-600 pl-4 mt-8">My Rented Clothes (Purchases)</h2>
          {myRentedClothes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
             <div className="text-gray-500 font-medium">You haven't rented any clothes yet.</div>
          </div>
          ) : (
          <div className="space-y-4">
             {myRentedClothes.map((order: any) => (
                <Card key={order._id} className="overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-shadow shadow-sm rounded-3xl p-6">
                   <div className="flex flex-col md:flex-row gap-6 items-center">
                     <div className="w-full md:w-32 md:h-32 bg-gray-100 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center relative">
                       {order.listingId?.images?.[0] ? (
                          <img src={order.listingId.images[0]} alt="img" className="w-full h-full object-cover" />
                       ) : (
                          <div className="text-xs text-gray-400 font-medium">No Image</div>
                       )}
                     </div>
                     <div className="flex-1 w-full text-center md:text-left">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{order.listingId?.title || "Listing Removed"}</h3>
                        <p className="text-sm font-semibold text-gray-500 mb-3 bg-gray-50 inline-block px-3 py-1 rounded-md mt-1">
                           {new Date(order.startDate).toLocaleDateString()} &mdash; {new Date(order.endDate).toLocaleDateString()}
                        </p>
                        {order.listingId?.location?.address && (order.paymentStatus === "Paid" || order.totalPrice === 0) && (
                           <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-2 mb-3">
                              <div className="text-xs text-indigo-800 font-bold flex items-center gap-2">
                                📍 Pickup/Mail: {order.listingId.location.address}
                              </div>
                              <div className="h-px bg-indigo-100/50" />
                              <div className="text-[11px] text-indigo-900 font-bold">Seller Contact Information:</div>
                              <div className="text-[10px] text-indigo-700">
                                 <div><span className="font-black">Name:</span> {order.ownerId?.name}</div>
                                 <div><span className="font-black">Phone:</span> {order.ownerId?.phone || "Not provided"}</div>
                                 <div className="mt-1"><span className="font-black">House Address:</span> {order.ownerId?.address || "Not provided"}</div>
                              </div>
                           </div>
                        )}
                        <div className="flex justify-center md:justify-start gap-3">
                           <span className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-100">Status: {order.status}</span>
                           <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">Payment: {order.paymentStatus}</span>
                        </div>

                        {/* OTP DISPLAY FOR RENTER (PICKUP) */}
                        {order.paymentStatus === "Paid" && (order.status === "Accepted" || order.status === "Pending") && (
                            <div className="mt-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between">
                               <div>
                                  <div className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Your Pickup OTP</div>
                                  <div className="text-[9px] text-indigo-500 italic">Give this to the owner at pickup.</div>
                               </div>
                               <div className="text-2xl font-black text-indigo-700 tracking-widest bg-white px-4 py-1 rounded-xl border border-indigo-100 shadow-sm">
                                  {order.pickupOTP}
                               </div>
                            </div>
                        )}

                        {/* OTP VERIFICATION FOR RENTER (RETURN) */}
                        {order.status === "Returned" && (
                            <div className="mt-4 bg-green-50 p-4 rounded-2xl border border-green-100 flex flex-col gap-3">
                               <div className="flex items-center justify-between">
                                  <div>
                                     <div className="text-[10px] font-black text-green-700 uppercase tracking-widest">Verify Return OTP</div>
                                     <div className="text-[9px] text-green-500 italic">Ask owner for code to get deposit back.</div>
                                  </div>
                                  <input 
                                     type="text" 
                                     placeholder="OTP" 
                                     className="w-20 h-9 px-2 rounded-lg border border-green-200 text-green-900 font-bold text-center tracking-widest focus:ring-1 focus:ring-green-500 outline-none"
                                     value={otpInputs[order._id] || ""}
                                     onChange={(e) => setOtpInputs({ ...otpInputs, [order._id]: e.target.value })}
                                     maxLength={6}
                                  />
                               </div>
                               <Button 
                                  size="sm"
                                  onClick={() => handleVerifyOTP(order._id, 'return')} 
                                  className="w-full bg-green-600 hover:bg-green-700 h-9 rounded-xl text-[10px] font-black shadow-sm"
                                >
                                  Verify & Get Deposit Back
                                </Button>
                            </div>
                        )}
                     </div>
                     <div className="text-center md:text-right w-full md:w-auto mt-4 md:mt-0 bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-2xl">
                        <div className="text-xs text-gray-500 font-black mb-1 uppercase tracking-widest">Total Paid</div>
                        <div className="text-2xl font-black text-purple-600">₹{order.totalPrice}</div>
                        
                        {/* Deposit Refund Logic */}
                        <div className="mt-3">
                           {order.depositRefundStatus === "Available" && (
                              <Button onClick={() => handleWithdrawDeposit(order._id)} size="sm" className="bg-green-600 hover:bg-green-700 text-[10px] font-black h-8 rounded-lg shadow-sm">Get Deposit Back</Button>
                           )}
                           {order.depositRefundStatus === "Requested" && (
                              <span className="text-[10px] font-black text-orange-600 uppercase bg-orange-50 px-2 py-1 rounded-md border border-orange-100">Withdrawal Processing</span>
                           )}
                           {order.depositRefundStatus === "Completed" && (
                              <span className="text-[10px] font-black text-green-700 uppercase bg-green-50 px-2 py-1 rounded-md border border-green-100 italic">Deposit Refunded ✓</span>
                           )}
                        </div>
                     </div>
                   </div>
                </Card>
             ))}
          </div>
          )}
       </div>

    </div>
  );
}

function ListingsSection({ listings, onDelete }: { listings: any[], onDelete: (id: string) => void }) {
  return (
    <div>
       <h2 className="text-2xl font-black text-gray-900 mb-6 border-l-4 border-green-600 pl-4 mt-8">My Listings (Active Items)</h2>
       {listings.length === 0 ? (
       <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 font-medium">You haven't posted any items for rent.</div>
       </div>
       ) : (
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item: any) => (
             <Card key={item._id} className="overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-shadow shadow-sm rounded-3xl p-5 flex flex-col">
                <div className="h-40 bg-gray-50 rounded-2xl overflow-hidden mb-4 relative">
                   {item.images?.[0] ? (
                     <img src={item.images[0]} alt="img" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                   )}
                   <div className="absolute top-2 right-2 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-lg text-[10px] font-black">{item.category}</div>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 truncate">{item.title}</h3>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-lg font-black text-indigo-600">₹{item.pricePerDay}<span className="text-[10px] text-gray-400 font-bold">/day</span></div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${
                    item.status === "approved" ? "bg-green-100 text-green-700" :
                    item.status === "rejected" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                  }`}>
                    {item.status || "pending"}
                  </span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                   <Link href={`/listings/${item._id}`} className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors">View Page</Link>
                   <Button onClick={() => onDelete(item._id)} variant="destructive" className="h-9 px-4 text-xs font-bold rounded-xl shadow-sm">Delete</Button>
                </div>
             </Card>
          ))}
       </div>
       )}
    </div>
  );
}

