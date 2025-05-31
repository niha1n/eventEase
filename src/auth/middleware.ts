export { default } from 'better-auth/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/event-owner/:path*',
  ],
}
