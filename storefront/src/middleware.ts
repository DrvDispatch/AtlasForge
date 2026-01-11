import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const { pathname } = request.nextUrl;

    // Define platform domains
    // In production: 'getatlasforge.com', 'www.getatlasforge.com'
    // In development: we can simulate with a specific port or env var if needed, 
    // but for now we'll match the strict string to allow 'localhost' to act as a tenant.
    const isPlatform = hostname.includes('getatlasforge.com');

    // If it's the platform domain and root path, rewrite to marketing page
    if (isPlatform && pathname === '/') {
        return NextResponse.rewrite(new URL('/marketing', request.url));
    }

    // For dev/testing: Allow manual access to /marketing even on localhost
    // No action needed, standard routing applies.

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
