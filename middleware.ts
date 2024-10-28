import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuth } from "./auth";

const protectedRoutes = "/dashboard";

export async function middleware(request: NextRequest) {
  // const auth = await getAuth();
  // const session = await auth();
  // const isProtectedRoute = request.nextUrl.pathname.startsWith(protectedRoutes);

  // if (isProtectedRoute && !session) {
  //   return NextResponse.redirect(new URL("/sign-in", request.url));
  // }

  let res = NextResponse.next();

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
