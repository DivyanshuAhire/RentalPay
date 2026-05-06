"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent transform transition-transform hover:scale-105">
          StyleP2P
        </Link>
        {/* Desktop nav */}
        <div className="hidden md:flex gap-4 items-center">
          <Link href="/"><Button variant="ghost">Browse</Button></Link>
          {user && <Link href="/dashboard/profile"><Button variant="ghost">Profile</Button></Link>}
          {user ? (
            <>
              {(user.role === "USER" || user.role === "TESTER") && <Link href="/dashboard"><Button variant="ghost">Dashboard</Button></Link>}
              {user.role === "ADMIN" && <Link href="/dashboard/admin"><Button variant="ghost">Admin Panel</Button></Link>}
              <Button variant="outline" onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost">Login</Button></Link>
              <Link href="/signup"><Button className="bg-indigo-600 hover:bg-indigo-700">Sign Up</Button></Link>
            </>
          )}
        </div>
        {/* Hamburger menu button for mobile */}
        <button
          className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {/* Mobile nav menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 bg-white shadow">
          <Link href="/" onClick={() => setMenuOpen(false)}><Button variant="ghost" className="w-full justify-start">Browse</Button></Link>
          {user && <Link href="/dashboard/profile" onClick={() => setMenuOpen(false)}><Button variant="ghost" className="w-full justify-start">Profile</Button></Link>}
          {user ? (
            <>
              {(user.role === "USER" || user.role === "TESTER") && <Link href="/dashboard" onClick={() => setMenuOpen(false)}><Button variant="ghost" className="w-full justify-start">Dashboard</Button></Link>}
              {user.role === "ADMIN" && <Link href="/dashboard/admin" onClick={() => setMenuOpen(false)}><Button variant="ghost" className="w-full justify-start">Admin Panel</Button></Link>}
              <Button variant="outline" className="w-full justify-start" onClick={() => { setMenuOpen(false); logout(); }}>Logout</Button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}><Button variant="ghost" className="w-full justify-start">Login</Button></Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)}><Button className="w-full justify-start bg-indigo-600 hover:bg-indigo-700">Sign Up</Button></Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
