import { NextResponse } from 'next/server';

const ADMIN_PATH = '/admin';
const TEACHER_PATH = '/teacher';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  // Get role from cookies (adjust if you use a different method)
  const role = req.cookies.get('role')?.value;

  // Protect /admin route
  if (pathname.startsWith(ADMIN_PATH)) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Protect /teacher route
  if (pathname.startsWith(TEACHER_PATH)) {
    if (role !== 'teacher') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*'],
}; 