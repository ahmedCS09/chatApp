import { NextResponse } from 'next/server';
// import { verifyToken } from './lib/utils/tokenUtils';

export function middleware(req) {
    // Allow all requests to pass through for now
    // Token verification can be added per-route if needed
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};