// import { withAuth } from "next-auth/middleware"

// // Export withAuth middleware with custom configuration
// export default withAuth(
//   // `withAuth` augments your `Request` with the user's token.
//   function middleware(req) {
//     console.log(req.nextauth.token)
//   },
//   {
//     callbacks: {
//       authorized: ({ token }) => !!token // Returns true if user is authenticated
//     },
//   }
// )

// // Protect these routes
// export const config = { 
//   matcher: [
//     "/courses/:path*", // Protect all routes under /courses
//   ]
// }

export { default } from "next-auth/middleware"
export const config = { 
      matcher: [
        "/courses/:path*", // Protect all routes under /courses
        "/profile/:path*", // Protect all routes under /profile
      ]
    }