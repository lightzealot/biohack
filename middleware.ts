import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get("authorization");
  if (basicAuth) {
    const auth = basicAuth.split(" ")[1];
    const [user, pwd] = atob(auth).split(":");

    const envUser = process.env.NEXT_PUBLIC_STATIC_USERNAME;
    const envPassword = process.env.NEXT_PUBLIC_STATIC_PASSWORD;

    if (user === envUser && pwd === envPassword) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": "Basic realm=\"Secure Area\"",
    },
  });
}

export const config = {
  matcher: "/:path*",
};