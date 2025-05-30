import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "@/types";

export function middleware(request: NextRequest) {
  const authSession = request.cookies.get("auth-storage");
  let user = null;

  if (authSession) {
    try {
      const parsed = JSON.parse(authSession.value);
      user = parsed.state?.user;
    } catch (error) {
      console.error("Ошибка при разборе auth-session:", error);
    }
  }

  const isAuthenticated = !!user;
  const isActive = user?.isActive === true;
  const path = request.nextUrl.pathname;

  // Публичные страницы - логин и регистрация
  if (path.startsWith("/login") || path.startsWith("/register")) {
    if (isAuthenticated && isActive) {
      return redirectByRole(user.role, request);
    }
    return NextResponse.next();
  }

  // Публичные маршруты, доступные всем
  const publicRoutes = ["/", "/events", "/search"];
  if (publicRoutes.includes(path) || path.startsWith("/events/")) {
    return NextResponse.next();
  }

  // API маршруты
  if (path.startsWith("/api/")) {
    // Некоторые API маршруты доступны без авторизации
    if (path === "/api/check-admins") {
      return NextResponse.next();
    }

    // Остальные API маршруты требуют авторизации
    if (!isAuthenticated || !isActive) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Все остальные маршруты требуют авторизации и активации
  if (!isAuthenticated || !isActive) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Защита маршрутов по ролям

  // Маршруты администратора
  if (path.startsWith("/admin") && user.role !== UserRole.ADMIN) {
    return redirectByRole(user.role, request);
  }

  // Маршруты организатора
  if (path.startsWith("/organizer") && user.role !== UserRole.ORGANIZER) {
    return redirectByRole(user.role, request);
  }

  // Маршруты пользователя
  if (
    (path.startsWith("/favorites") ||
      path.startsWith("/my-events") ||
      path.startsWith("/profile")) &&
    user.role === UserRole.ADMIN
  ) {
    return redirectByRole(user.role, request);
  }

  return NextResponse.next();
}

function redirectByRole(role: UserRole, request: NextRequest) {
  let path: string;

  switch (role) {
    case UserRole.ADMIN:
      path = "/admin";
      break;
    case UserRole.ORGANIZER:
      path = "/organizer";
      break;
    case UserRole.USER:
      path = "/";
      break;
    default:
      path = "/login";
  }

  const url = new URL(path, request.url);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
    "/admin/:path*",
    "/organizer/:path*",
    "/favorites/:path*",
    "/my-events/:path*",
    "/profile/:path*",
    "/api/:path*",
    "/login",
    "/register",
  ],
};
