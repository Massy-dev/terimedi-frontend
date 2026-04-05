import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;
  const role = req.cookies.get('user_role')?.value;

  const url = req.nextUrl.clone();

  // Redirection si non connecté
  if (!token && !url.pathname.startsWith('/auth')) {
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Si connecté mais mauvais rôle
  if (url.pathname.startsWith('/admin') && role !== 'admin') {
    url.pathname = '/not-authorized';
    return NextResponse.redirect(url);
  }

  if (url.pathname.startsWith('/pharmacy') && role !== 'pharmacien') {
    url.pathname = '/not-authorized';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/pharmacy/:path*'],
};
