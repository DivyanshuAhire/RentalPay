"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  const [listings, setListings] = useState([]);
  const [category, setCategory] = useState("All");
  const [size, setSize] = useState("All");
  const [gender, setGender] = useState("All");

  useEffect(() => {
    fetchListings();
  }, [category, size, gender]);

  const handleCategoryChange = (value: string | null) => {
    if (value !== null) setCategory(value);
  };

  const handleSizeChange = (value: string | null) => {
    if (value !== null) setSize(value);
  };

  const handleGenderChange = (value: string | null) => {
    if (value !== null) setGender(value);
  };

  const fetchListings = async () => {
    let url = "/api/listings?";
    if (category !== "All") url += `category=${category}&`;
    if (size !== "All") url += `size=${size}&`;
    if (gender !== "All") url += `gender=${gender}&`;
    const res = await fetch(url);
    const data = await res.json();
    if (res.ok) setListings(data);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Filters</h2>
          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Category</label>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Ethnic">Ethnic</SelectItem>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Party">Party</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Size</label>
              <Select value={size} onValueChange={handleSizeChange}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="All Sizes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Sizes</SelectItem>
                  <SelectItem value="S">Small (S)</SelectItem>
                  <SelectItem value="M">Medium (M)</SelectItem>
                  <SelectItem value="L">Large (L)</SelectItem>
                  <SelectItem value="XL">Extra Large (XL)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Gender</label>
              <Select value={gender} onValueChange={handleGenderChange}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Genders</SelectItem>
                  <SelectItem value="Men">Men</SelectItem>
                  <SelectItem value="Women">Women</SelectItem>
                  <SelectItem value="Unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-8">
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-10 text-white shadow-xl overflow-hidden relative">
          <div className="relative z-10 max-w-xl">
            <h1 className="text-4xl md:text-6xl font-black mb-5 leading-tight tracking-tight">Rent your dream style.</h1>
            <p className="text-indigo-50 text-lg mb-2 font-medium">Explore the best collection of peer-to-peer clothes.</p>
            <p className="text-indigo-50/80 text-md">Stand out for any occasion without breaking the bank.</p>
          </div>
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white opacity-20 rounded-full blur-3xl mix-blend-overlay"></div>
          <div className="absolute right-40 -bottom-20 w-64 h-64 bg-pink-400 opacity-30 rounded-full blur-3xl"></div>
        </div>

        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Explore Listings</h2>
        </div>
        
        {listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">👚</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No clothes found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item: any) => (
              <Link href={`/listings/${item._id}`} key={item._id}>
                <Card className="group overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 border-gray-100 shadow-sm bg-white hover:shadow-xl hover:-translate-y-1 relative">
                  <div className="h-64 bg-gray-100 overflow-hidden relative">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                       <div className="flex items-center justify-center h-full text-gray-400 text-sm font-medium">No Image Uploaded</div>
                    )}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                      <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-indigo-700 shadow-sm border border-gray-100 uppercase tracking-wider">
                        {item.gender || "Unisex"}
                      </div>
                      <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-gray-800 shadow-sm border border-gray-100">
                        Size {item.size}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg truncate text-gray-800 max-w-[70%]">{item.title}</h3>
                        <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md">{item.category}</span>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                       <div>
                          <span className="text-2xl font-black text-gray-900">₹{item.pricePerDay}</span>
                          <span className="text-sm text-gray-500 font-medium">/day</span>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
