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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user);
        toast.success("Successfully logged in");
        if (data.user.role === "ADMIN") router.push("/dashboard/admin");
        else router.push("/dashboard");
      } else {
        toast.error(data.error || "Failed to login");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[70vh]">
      <Card className="w-full max-w-md shadow-lg border-0 translate-y-[-5%]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center text-md">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" placeholder="name@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" />
            </div>
            <Button type="submit" className="w-full h-12 text-md mt-2 bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                 {loading ? "Loading..." : "Login"}
            </Button>
            <div className="text-center text-sm text-gray-500 mt-4">
              Don't have an account? <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">Sign up</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
