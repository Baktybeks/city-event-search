// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Получаем Appwrite session cookie
  const sessionCookie = request.cookies.get("a_session_console");
  const path = request.nextUrl.pathname;

  // Простая проверка наличия сессии
  const hasSession = !!sessionCookie?.value;

  console.log("Middleware - путь:", path, "сессия:", !!hasSession);

  // Публичные страницы - логин и регистрация
  if (path.startsWith("/login") || path.startsWith("/register")) {
    // Просто пропускаем - проверку авторизации делаем на клиенте
    return NextResponse.next();
  }

  // Публичные маршруты, доступные всем
  const publicRoutes = ["/", "/events", "/search"];
  if (publicRoutes.includes(path) || path.startsWith("/events/")) {
    return NextResponse.next();
  }

  // API маршруты (если они есть)
  if (path.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Админские, организаторские и пользовательские маршруты
  const protectedRoutes = [
    "/admin",
    "/organizer",
    "/profile",
    "/favorites",
    "/my-events",
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    console.log("Перенаправляем на логин с redirect:", path);
    return NextResponse.redirect(loginUrl);
  }

  // Если есть сессия или маршрут не защищен, пропускаем запрос
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
