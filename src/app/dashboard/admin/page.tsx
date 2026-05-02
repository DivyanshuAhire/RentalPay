"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [profits, setProfits] = useState(0);
  const [usersList, setUsersList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [listingsList, setListingsList] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      fetchAdminData();
    } else if (!loading) {
      setFetching(false);
    }
  }, [user, loading]);

  const fetchAdminData = async () => {
    try {
      const [profitRes, usersRes, ordersRes, listingsRes] = await Promise.all([
         fetch("/api/admin/profits"),
         fetch("/api/admin/users"),
         fetch("/api/admin/orders"),
         fetch("/api/listings?status=all")
      ]);
      if (profitRes.ok) setProfits((await profitRes.json()).totalProfits);
      if (usersRes.ok) setUsersList(await usersRes.json());
      if (ordersRes.ok) setOrdersList(await ordersRes.json());
      if (listingsRes.ok) setListingsList(await listingsRes.json());
    } finally {
      setFetching(false);
    }
  };

  const handleUpdateStatus = async (listingId: string, status: 'approved' | 'rejected') => {
    const res = await fetch(`/api/admin/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      toast.success(`Listing ${status}`);
      fetchAdminData();
    } else {
      toast.error(`Failed to update listing status`);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if(confirm("Are you sure you want to delete this listing permanently from the platform?")) {
      const res = await fetch(`/api/listings/${listingId}`, { method: "DELETE"});
      if(res.ok) {
         toast.success("Listing removed from platform");
         fetchAdminData();
      } else {
         toast.error("Failed to delete listing");
      }
    }
  }

  if (loading || fetching) return <div className="text-center py-32 text-gray-500 font-medium text-lg">Loading Admin Panel...</div>;
  if (!user || user.role !== "ADMIN") return <div className="text-center py-32 font-bold text-red-500 text-xl">Access Denied. Ensure your account role is set to ADMIN.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-10">
       <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-10 md:p-14 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
               <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">Admin Overview</h1>
               <p className="text-gray-400 font-medium tracking-wide text-lg">Monitor platform activity, users, and overall revenue.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-lg w-full md:w-auto text-center md:text-left text-white/90">
               <div className="text-sm font-black uppercase tracking-[0.2em] mb-2 opacity-70">Total Platform Profits</div>
               <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-300 to-emerald-500 drop-shadow-sm">₹{profits}</div>
               <div className="text-xs font-semibold mt-3 text-gray-300 bg-black/20 inline-block px-3 py-1 rounded-md">From 15% Platform Commission Fee</div>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 opacity-[0.15] rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500 opacity-[0.10] rounded-full blur-[80px] -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>
       </div>

       {/* Platform Listings Moderation */}
       <div className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Pending Review & Moderation</h2>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-1 rounded-full border border-gray-100">Total Listings: {listingsList.length}</div>
          </div>
          
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8">
             {listingsList.length === 0 ? (
                <div className="text-center py-20 text-gray-400 font-medium">
                  <div className="text-5xl mb-4">✨</div>
                  No active listings found on the platform.
                </div>
             ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {listingsList.map((item: any) => (
                       <div key={item._id} className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all flex flex-col hover:-translate-y-1">
                          <div className="h-44 bg-gray-100 relative">
                             {item.images?.[0] ? (
                               <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold uppercase">No Image</div>
                             )}
                             <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                item.status === "approved" ? "bg-green-500 text-white" :
                                item.status === "rejected" ? "bg-red-500 text-white" : "bg-orange-500 text-white"
                             }`}>
                                {item.status || "pending"}
                             </div>
                          </div>
                          <div className="p-6 flex flex-col flex-grow">
                             <h3 className="font-bold text-gray-900 truncate mb-1 text-lg">{item.title}</h3>
                             <div className="text-[10px] text-gray-400 mb-5 uppercase font-black tracking-widest border-b border-gray-50 pb-4">Seller: {item.ownerId?.email}</div>
                             
                             <div className="mt-auto space-y-3">
                                {(item.status === "pending" || !item.status) && (
                                   <div className="grid grid-cols-2 gap-3">
                                      <Button onClick={() => handleUpdateStatus(item._id, 'approved')} className="h-10 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-xl shadow-lg shadow-indigo-100">Approve</Button>
                                      <Button onClick={() => handleUpdateStatus(item._id, 'rejected')} variant="outline" className="h-10 text-red-600 border-red-200 hover:bg-red-50 text-xs font-bold rounded-xl">Reject</Button>
                                   </div>
                                )}
                                {item.status === "approved" && (
                                   <Button onClick={() => handleUpdateStatus(item._id, 'rejected')} variant="outline" className="w-full h-10 text-red-600 border-red-200 hover:bg-red-50 text-xs font-bold rounded-xl">Move to Rejected</Button>
                                )}
                                {item.status === "rejected" && (
                                   <Button onClick={() => handleUpdateStatus(item._id, 'approved')} className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-xl shadow-lg shadow-indigo-100">Move to Approved</Button>
                                )}
                                <div className="h-px bg-gray-100 my-2" />
                                <Button onClick={() => handleDeleteListing(item._id)} variant="ghost" className="w-full h-9 text-[10px] text-gray-400 hover:text-red-600 hover:bg-red-50 font-black uppercase tracking-widest rounded-xl transition-colors">Delete Permanently</Button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
             )}
          </div>
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Users List */}
          <div className="space-y-6">
             <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 px-2">Registered Users ({usersList.length})</h2>
             <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 max-h-[700px] overflow-y-auto space-y-4">
                {usersList.length === 0 && <div className="text-gray-400 text-center py-10 font-medium">No users found.</div>}
                {usersList.map((u: any) => (
                   <div key={u._id} className="flex justify-between items-center p-5 bg-gray-50 hover:bg-gray-100/50 transition-colors rounded-2xl border border-gray-100">
                      <div>
                         <div className="font-bold text-gray-900 text-lg mb-1">{u.name}</div>
                         <div className="text-gray-500 text-sm">{u.email}</div>
                      </div>
                      <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-black tracking-widest rounded-xl">
                         {u.role}
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Recent Transactions */}
          <div className="space-y-6">
             <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 px-2">Recent Transactions</h2>
             <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 max-h-[700px] overflow-y-auto space-y-5">
                {ordersList.length === 0 && <div className="text-gray-400 text-center py-10 font-medium">No transactions available.</div>}
                {ordersList.map((o: any) => (
                   <div key={o._id} className="p-6 bg-gray-50 hover:bg-gray-100/50 transition-colors rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-start mb-4 gap-4">
                         <div className="font-black text-gray-900 text-xl leading-tight line-clamp-2 pb-1">{o.listingId?.title || "Listing Removed"}</div>
                         <div className="text-2xl font-black text-gray-900 whitespace-nowrap">₹{o.totalPrice}</div>
                      </div>
                      
                      <div className="bg-white rounded-xl p-4 border border-gray-100 mb-5">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                            <div><span className="font-bold text-gray-400 uppercase text-xs tracking-wider block mb-1">Owner</span> <span className="font-medium text-gray-900">{o.ownerId?.email}</span></div>
                            <div><span className="font-bold text-gray-400 uppercase text-xs tracking-wider block mb-1">Renter</span> <span className="font-medium text-gray-900">{o.renterId?.email}</span></div>
                         </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                         <div className="flex gap-2">
                            <span className={`px-3 py-1.5 text-xs font-black rounded-lg border uppercase tracking-wider ${o.paymentStatus === 'Paid' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>Pay: {o.paymentStatus}</span>
                            <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black uppercase tracking-wider rounded-lg">{o.status}</span>
                         </div>
                      </div>
                      
                      {o.listingId && (
                      <div className="mt-5 pt-5 border-t border-gray-200 flex justify-end">
                         <Button variant="destructive" className="h-10 px-6 rounded-xl font-bold shadow-sm hover:shadow-md transition-all text-xs" onClick={() => handleDeleteListing(o.listingId._id)}>
                             Delete Listing from Platform
                         </Button>
                      </div>
                      )}
                   </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
}
