import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 公開ルートを指定（サインイン、サインアップページを含む）
const publicRoutes = ["/", "/sign-in", "/sign-up", "/api/webhook"];
const isProtectedRoute = createRouteMatcher(["/protected"]);

export default clerkMiddleware((auth, req) => {
  const userId = auth().userId;
  const orgId = auth().orgId;
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);

  // 認証されていない場合、公開ルート以外にアクセスするとサインインページへリダイレクト
  if (!userId && !isPublicRoute) {
    return auth().redirectToSignIn({
      returnBackUrl: req.url,
    });
  }

  // 認証済みで公開ルートにアクセスしようとしている場合
  if (userId && isPublicRoute) {
    let path = "/select-org";

    if (orgId) {
      path = `/organization/${orgId}`;
    }

    const orgSelection = new URL(path, req.url);
    return NextResponse.redirect(orgSelection);
  }

  // 認証済みだが組織IDが設定されていない場合、組織選択ページにリダイレクト
  if (userId && !orgId && req.nextUrl.pathname !== "/select-org") {
    const orgSelection = new URL("/select-org", req.url);
    return NextResponse.redirect(orgSelection);
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
