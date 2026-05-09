"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [profits, setProfits] = useState(0);
  const [usersList, setUsersList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [listingsList, setListingsList] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [systemSettings, setSystemSettings] = useState<any>({ contactEmail: "", contactPhone: "", contactAddress: "", contactText: "", contactInstagram: "", faqs: [] });
  const [fetching, setFetching] = useState(true);
  
  // Edit State
  const [editingListing, setEditingListing] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    size: "",
    gender: "",
    pricePerDay: "",
    deposit: "",
    comment: ""
  });

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      fetchAdminData();
    } else if (!loading) {
      setFetching(false);
    }
  }, [user, loading]);

  const fetchAdminData = async () => {
    try {
      const [profitRes, usersRes, ordersRes, listingsRes, payoutsRes] = await Promise.all([
         fetch("/api/admin/profits"),
         fetch("/api/admin/users"),
         fetch("/api/admin/orders"),
         fetch("/api/listings?status=all"),
         fetch("/api/admin/payouts")
      ]);
      if (profitRes.ok) setProfits((await profitRes.json()).totalProfits);
      if (usersRes.ok) setUsersList(await usersRes.json());
      if (ordersRes.ok) setOrdersList(await ordersRes.json());
      if (listingsRes.ok) setListingsList(await listingsRes.json());
      if (payoutsRes.ok) setPayoutRequests(await payoutsRes.json());
      
      const settingsRes = await fetch("/api/admin/settings");
      if (settingsRes.ok) setSystemSettings(await settingsRes.json());
    } finally {
      setFetching(false);
    }
  };

  const handleUpdateStatus = async (listingId: string, status: 'approved' | 'rejected', comment?: string) => {
    const res = await fetch(`/api/admin/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, comment })
    });
    if (res.ok) {
      toast.success(`Listing ${status}`);
      fetchAdminData();
    } else {
      toast.error(`Failed to update listing status`);
    }
  };

  const handleOpenEdit = (listing: any) => {
    setEditingListing(listing);
    setEditForm({
      title: listing.title,
      description: listing.description,
      category: listing.category,
      size: listing.size,
      gender: listing.gender || "Unisex",
      pricePerDay: listing.pricePerDay.toString(),
      deposit: listing.deposit.toString(),
      comment: ""
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;

    const res = await fetch(`/api/admin/listings/${editingListing._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        pricePerDay: Number(editForm.pricePerDay),
        deposit: Number(editForm.deposit)
      })
    });

    if (res.ok) {
      toast.success("Listing updated successfully");
      setEditingListing(null);
      fetchAdminData();
    } else {
      toast.error("Failed to update listing");
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
  const handleProcessPayout = async (orderId: string, type: 'earning' | 'deposit') => {
    if (!confirm(`Are you sure you have transferred the money and want to mark this ${type} payout as Completed?`)) return;

    const res = await fetch(`/api/admin/payouts/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, status: "Completed" })
    });

    if (res.ok) {
      toast.success("Payout marked as Completed");
      fetchAdminData();
    } else {
      toast.error("Failed to update payout status");
    }
  };

  const handleSaveSettings = async () => {
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(systemSettings)
    });
    if (res.ok) {
      toast.success("System settings updated! Refresh the page to see changes.");
    } else {
      toast.error("Failed to update settings");
    }
  };


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

       {/* Quick Navigation Bar */}
       <div className="sticky top-4 z-50 px-2 md:px-4">
         <div className="bg-white/90 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-2xl p-1.5 flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-1 overflow-x-auto no-scrollbar max-w-full md:max-w-fit mx-auto">
           {[
             { label: "Moderation", id: "moderation-section", icon: "📋" },
             { label: "Payouts", id: "payouts-section", icon: "💰" },
             { label: "Users", id: "users-section", icon: "👥" },
             { label: "Transactions", id: "transactions-section", icon: "💸" },
             { label: "System Settings", id: "settings-section", icon: "⚙️" }
           ].map((nav) => (
             <Button
               key={nav.id}
               variant="ghost"
               onClick={() => document.getElementById(nav.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
               className="h-10 px-3 md:px-4 rounded-xl font-bold text-[10px] md:text-xs hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-2 shrink-0 border border-transparent hover:border-indigo-100"
             >
               <span className="text-sm md:text-base">{nav.icon}</span> 
               <span className="whitespace-nowrap">{nav.label}</span>
             </Button>
           ))}
         </div>
       </div>

       <style jsx global>{`
         .no-scrollbar::-webkit-scrollbar {
           display: none;
         }
         .no-scrollbar {
           -ms-overflow-style: none;
           scrollbar-width: none;
         }
       `}</style>

       {/* Platform Listings Moderation */}
       <div id="moderation-section" className="space-y-6 scroll-mt-24">
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
                              <div className="flex justify-between items-start mb-1">
                                 <h3 className="font-bold text-gray-900 truncate text-lg max-w-[70%]">{item.title}</h3>
                                 <span className="text-sm font-bold text-indigo-600">₹{item.pricePerDay}</span>
                              </div>
                              <div className="text-[10px] text-gray-400 mb-5 uppercase font-black tracking-widest border-b border-gray-50 pb-4">Seller: {item.ownerId?.email}</div>
                              
                              <div className="mt-auto space-y-3">
                                 <Dialog open={editingListing?._id === item._id} onOpenChange={(open) => !open && setEditingListing(null)}>
                                    <DialogTrigger render={<Button onClick={() => handleOpenEdit(item)} variant="outline" className="w-full h-10 border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold rounded-xl" />}>
                                       Edit Details
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px] rounded-3xl">
                                       <DialogHeader>
                                          <DialogTitle>Edit Listing Details</DialogTitle>
                                       </DialogHeader>
                                       <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
                                          <div className="space-y-2">
                                             <Label>Title</Label>
                                             <Input value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} required />
                                          </div>
                                          <div className="space-y-2">
                                             <Label>Description</Label>
                                             <Textarea value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} required />
                                          </div>
                                          <div className="grid grid-cols-2 gap-4">
                                             <div className="space-y-2">
                                                <Label>Category</Label>
                                                <Select value={editForm.category} onValueChange={(val) => setEditForm({...editForm, category: val || ""})}>
                                                   <SelectTrigger><SelectValue /></SelectTrigger>
                                                   <SelectContent>
                                                      <SelectItem value="Casual">Casual</SelectItem>
                                                      <SelectItem value="Ethnic">Ethnic</SelectItem>
                                                      <SelectItem value="Formal">Formal</SelectItem>
                                                      <SelectItem value="Party">Party</SelectItem>
                                                   </SelectContent>
                                                </Select>
                                             </div>
                                             <div className="space-y-2">
                                                <Label>Gender</Label>
                                                <Select value={editForm.gender} onValueChange={(val) => setEditForm({...editForm, gender: val || ""})}>
                                                   <SelectTrigger><SelectValue /></SelectTrigger>
                                                   <SelectContent>
                                                      <SelectItem value="Men">Men</SelectItem>
                                                      <SelectItem value="Women">Women</SelectItem>
                                                      <SelectItem value="Unisex">Unisex</SelectItem>
                                                   </SelectContent>
                                                </Select>
                                             </div>
                                          </div>
                                          <div className="grid grid-cols-3 gap-4">
                                             <div className="space-y-2">
                                                <Label>Size</Label>
                                                <Select value={editForm.size} onValueChange={(val) => setEditForm({...editForm, size: val || ""})}>
                                                   <SelectTrigger><SelectValue /></SelectTrigger>
                                                   <SelectContent>
                                                      <SelectItem value="S">S</SelectItem>
                                                      <SelectItem value="M">M</SelectItem>
                                                      <SelectItem value="L">L</SelectItem>
                                                      <SelectItem value="XL">XL</SelectItem>
                                                   </SelectContent>
                                                </Select>
                                             </div>
                                             <div className="space-y-2">
                                                <Label>Price (₹)</Label>
                                                <Input type="number" value={editForm.pricePerDay} onChange={(e) => setEditForm({...editForm, pricePerDay: e.target.value})} required />
                                             </div>
                                             <div className="space-y-2">
                                                <Label>Deposit (₹)</Label>
                                                <Input type="number" value={editForm.deposit} onChange={(e) => setEditForm({...editForm, deposit: e.target.value})} required />
                                             </div>
                                          </div>
                                          <div className="space-y-2">
                                             <Label>Message to Lister (Optional Comment)</Label>
                                             <Textarea 
                                                placeholder="Add a message or reason for these changes..." 
                                                value={editForm.comment} 
                                                onChange={(e) => setEditForm({...editForm, comment: e.target.value})} 
                                                className="min-h-[80px]"
                                             />
                                             <p className="text-[10px] text-gray-400">This comment will be included in the automated email sent to the owner.</p>
                                          </div>
                                          <DialogFooter className="pt-4">
                                             <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
                                          </DialogFooter>
                                       </form>
                                    </DialogContent>
                                 </Dialog>
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

       {/* Platform Payouts Management */}
       <div id="payouts-section" className="space-y-6 scroll-mt-24">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 to-emerald-600">Payout Requests (Withdrawals)</h2>
            <div className="text-sm font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-1 rounded-full border border-emerald-100">Pending: {payoutRequests.length}</div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8">
             {payoutRequests.length === 0 ? (
                <div className="text-center py-20 text-gray-400 font-medium">
                  <div className="text-5xl mb-4">💰</div>
                  No active payout requests.
                </div>
             ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {payoutRequests.map((order: any) => {
                      const requests = [];
                      if (order.ownerEarningStatus === "Requested") requests.push({ type: 'earning', amount: order.ownerEarning, user: order.ownerId, label: 'Owner Earning' });
                      if (order.depositRefundStatus === "Requested") requests.push({ type: 'deposit', amount: order.securityDeposit, user: order.renterId, label: 'Security Deposit' });

                      return requests.map((req, idx) => (
                        <div key={`${order._id}-${idx}`} className="bg-gray-50 rounded-3xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                           <div className="flex justify-between items-start mb-4">
                              <div>
                                 <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{req.label} Request</div>
                                 <h3 className="text-xl font-bold text-gray-900 leading-tight">{order.listingId?.title || "Item Removal"}</h3>
                              </div>
                              <div className="text-2xl font-black text-gray-900">₹{req.amount}</div>
                           </div>

                           <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-6 space-y-3">
                              <div className="flex justify-between items-center">
                                 <div className="text-xs text-gray-500 font-bold uppercase">Beneficiary</div>
                                 <div className="text-sm font-black text-gray-900">{req.user?.name}</div>
                              </div>
                              <div className="h-px bg-gray-50" />
                              <div className="space-y-2">
                                 <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Bank/UPI Details</div>
                                 {req.user?.bankDetails?.accountNumber ? (
                                    <div className="text-xs font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                       <div><span className="font-bold">A/C:</span> {req.user.bankDetails.accountNumber}</div>
                                       <div><span className="font-bold">IFSC:</span> {req.user.bankDetails.ifscCode}</div>
                                       <div><span className="font-bold">Name:</span> {req.user.bankDetails.beneficiaryName}</div>
                                    </div>
                                 ) : req.user?.upiId ? (
                                    <div className="text-sm font-black text-indigo-600 bg-indigo-50/50 px-4 py-2 rounded-xl border border-indigo-100 inline-block">
                                       UPI: {req.user.upiId}
                                    </div>
                                 ) : (
                                    <div className="text-xs text-red-500 font-bold italic">User has not connected bank/UPI yet.</div>
                                 )}
                              </div>
                           </div>

                           <div className="flex gap-3">
                              <Button 
                                 onClick={() => handleProcessPayout(order._id, req.type as any)} 
                                 className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-black text-xs shadow-lg shadow-emerald-100"
                              >
                                 Confirm Payment Sent
                              </Button>
                           </div>
                        </div>
                      ));
                   })}
                </div>
             )}
          </div>
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Users List */}
          <div id="users-section" className="space-y-6 scroll-mt-24">
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
          <div id="transactions-section" className="space-y-6 scroll-mt-24">
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

       {/* System Settings */}
       <div id="settings-section" className="space-y-6 scroll-mt-24 pt-12">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">System Control Panel</h2>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-1 rounded-full border border-gray-100">Live Settings</div>
          </div>
          
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-10 space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">

                   <div className="pt-4 border-t border-gray-100">
                      <Label className="text-lg font-bold mb-2 block">Contact Information</Label>
                      <div className="space-y-3">
                         <Input 
                           value={systemSettings.contactEmail || ""} 
                           onChange={(e) => setSystemSettings({...systemSettings, contactEmail: e.target.value})} 
                           placeholder="Support Email" 
                           className="rounded-xl"
                         />
                         <Input 
                           value={systemSettings.contactPhone || ""} 
                           onChange={(e) => setSystemSettings({...systemSettings, contactPhone: e.target.value})} 
                           placeholder="Support Phone Number" 
                           className="rounded-xl"
                         />
                         <Input 
                           value={systemSettings.contactAddress || ""} 
                           onChange={(e) => setSystemSettings({...systemSettings, contactAddress: e.target.value})} 
                           placeholder="Physical Address" 
                           className="rounded-xl"
                         />
                         <Textarea 
                           value={systemSettings.contactText || ""} 
                           onChange={(e) => setSystemSettings({...systemSettings, contactText: e.target.value})} 
                           placeholder="Contact Page Intro Text" 
                           className="rounded-xl"
                         />
                         <Input 
                           value={systemSettings.contactInstagram || ""} 
                           onChange={(e) => setSystemSettings({...systemSettings, contactInstagram: e.target.value})} 
                           placeholder="Instagram Handle (e.g., @rentalpay)" 
                           className="rounded-xl"
                         />
                      </div>
                   </div>

                   <div className="pt-4 border-t border-gray-100">
                      <Label className="text-lg font-bold mb-2 flex justify-between items-center">
                        FAQs
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSystemSettings({
                            ...systemSettings, 
                            faqs: [...(systemSettings.faqs || []), { question: "", answer: "" }]
                          })}
                        >
                          + Add FAQ
                        </Button>
                      </Label>
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                        {(systemSettings.faqs || []).map((faq: any, idx: number) => (
                           <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 relative">
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="absolute top-2 right-2 h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                                onClick={() => {
                                  const newFaqs = [...systemSettings.faqs];
                                  newFaqs.splice(idx, 1);
                                  setSystemSettings({...systemSettings, faqs: newFaqs});
                                }}
                              >
                                ✕
                              </Button>
                              <Input 
                                value={faq.question} 
                                onChange={(e) => {
                                  const newFaqs = [...systemSettings.faqs];
                                  newFaqs[idx].question = e.target.value;
                                  setSystemSettings({...systemSettings, faqs: newFaqs});
                                }} 
                                placeholder="Question" 
                                className="font-bold rounded-lg"
                              />
                              <Textarea 
                                value={faq.answer} 
                                onChange={(e) => {
                                  const newFaqs = [...systemSettings.faqs];
                                  newFaqs[idx].answer = e.target.value;
                                  setSystemSettings({...systemSettings, faqs: newFaqs});
                                }} 
                                placeholder="Answer" 
                                className="rounded-lg"
                              />
                           </div>
                        ))}
                        {(!systemSettings.faqs || systemSettings.faqs.length === 0) && (
                          <div className="text-sm text-gray-400 text-center py-4">No FAQs added yet.</div>
                        )}
                      </div>
                   </div>
                </div>

                <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100 space-y-6 flex flex-col justify-between h-fit sticky top-24">
                   <div>
                      <h3 className="text-xl font-bold text-indigo-900 mb-2">Platform Management</h3>
                      <p className="text-indigo-700/80 font-medium">Changes here affect all users in real-time. Ensure you double-check the rotating message for typos before saving.</p>
                   </div>
                   <div className="space-y-3">
                      <Button onClick={handleSaveSettings} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-lg font-black rounded-2xl shadow-xl shadow-indigo-200">
                        Update System Settings
                      </Button>
                      <p className="text-center text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Authorized Admin Action Only</p>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
