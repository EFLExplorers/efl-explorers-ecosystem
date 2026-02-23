import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    // If they aren't logged in, bounce them to the Landing Page
    signIn: process.env.NEXT_PUBLIC_LANDING_PAGE_URL + "/Auth/login/teacher",
  },
});

export const config = {
  matcher: [
    // Protect EVERYTHING in the app EXCEPT the /sso receiver page, API routes, and static files (images, css)
    "/((?!sso|api|_next/static|_next/image|favicon.ico).*)",
  ],
};
