import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const compareParam = request.nextUrl.searchParams.get("bones-compare");

  if (compareParam === "1") {
    requestHeaders.set("x-bones-compare", "1");
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (compareParam === "1") {
    response.headers.set("x-bones-compare", "1");
  }

  return response;
}
