import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/admin")) {
        if (!session) {
            const loginUrl = new URL("/login", req.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    if (pathname.startsWith('/portal')) {
      const clientSession = req.cookies.get('client_session');

      if (!clientSession){
          const homeURL = new URL('/', req.url)
          return NextResponse.redirect(homeURL)
      }

      return NextResponse.next()
    }
    return NextResponse.next();
}