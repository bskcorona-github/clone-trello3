import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 保護されたルートを明示的に指定 ("/"を除外)
const isProtectedRoute = createRouteMatcher(["/protected"]);

export default clerkMiddleware((auth, req) => {
  const userId = auth().userId;
  const isSignInPage = req.nextUrl.pathname === "/sign-in";
  const isRootPage = req.nextUrl.pathname === "/";

  // 認証されていない場合、サインインページ以外にアクセスするとサインインページへリダイレクト
  if (!userId && !isSignInPage && !isRootPage) {
    return auth().redirectToSignIn({
      returnBackUrl: req.url,
    });
  }

  // 保護されたルートにアクセスしようとしている場合
  if (userId && isProtectedRoute(req)) {
    return NextResponse.next();
  }

  // 他のケースはそのまま通過
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
