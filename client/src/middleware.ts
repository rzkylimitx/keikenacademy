import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Add this interface
interface UserMetadata {
  userType: "student" | "teacher";
}

const isStudentRoute = createRouteMatcher(["/user/(.*)"]);
const isTeacherRoute = createRouteMatcher(["/teacher/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();
  const metadata = sessionClaims?.metadata as UserMetadata;
  const userRole = metadata?.userType;

  // Only redirect if we have a valid role
  if (!userRole) {
    // Jika userType tidak ditemukan, biarkan request lanjut (atau redirect ke login jika diperlukan)
    return NextResponse.next();
  }

  // Redirect jika role tidak sesuai
  if (isTeacherRoute(req)) {
    if (userRole !== "teacher") {
      const url = new URL("/user/courses", req.url);
      return NextResponse.redirect(url);
    }
  }

  if (isStudentRoute(req)) {
    if (userRole !== "student") {
      const url = new URL("/teacher/courses", req.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
