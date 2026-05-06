import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/jwt";

export default async function proxy(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;

  const { pathname } = req.nextUrl;
  
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/dashboard/admin")) {
    if (!token) return pathname.startsWith("/api") 
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 }) 
      : NextResponse.redirect(new URL("/login", req.url));
    
    const payload = await verifyJWT(token);
    if (!payload || payload.role !== "ADMIN") {
       return pathname.startsWith("/api") 
       ? NextResponse.json({ error: "Forbidden" }, { status: 403 }) 
       : NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (pathname.startsWith("/dashboard")) {
     if (!token) return NextResponse.redirect(new URL("/login", req.url));
     const payload = await verifyJWT(token);
     if (!payload) return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/api/book") || pathname.startsWith("/api/orders") || (pathname.startsWith("/api/listings") && ["POST", "PUT", "DELETE"].includes(req.method))) {
     if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     const payload = await verifyJWT(token);
     if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/admin/:path*", "/api/book/:path*", "/api/orders/:path*", "/api/listings/:path*"],
};
