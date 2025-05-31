import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "@/types";

export function middleware(request: NextRequest) {
  // Получаем Appwrite session cookie
  const sessionCookie = request.cookies.get("a_session_console");
  const path = request.nextUrl.pathname;

  // Простая проверка наличия сессии
  const hasSession = !!sessionCookie?.value;

  console.log("Middleware - путь:", path, "сессия:", !!hasSession);

  // Публичные страницы - логин и регистрация
  if (path.startsWith("/login") || path.startsWith("/register")) {
    // Если есть сессия, можно попробовать перенаправить на главную
    // Но лучше оставить это на клиентской стороне, так как нужно проверить активность пользователя
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

  // Все остальные маршруты требуют авторизации
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // Если есть сессия, пропускаем запрос
  // Детальная проверка ролей будет происходить на клиентской стороне
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
