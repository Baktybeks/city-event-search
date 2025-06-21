// src/middleware.ts - НОВАЯ ВЕРСИЯ С AUTH-STORAGE

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "@/types";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  console.log(`🛡️ Middleware: проверка пути ${path}`);

  // Статические файлы и API пропускаем сразу
  if (
    path.startsWith("/_next/") ||
    path.startsWith("/api/") ||
    path.startsWith("/favicon.ico") ||
    path.startsWith("/public/") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  // Получаем auth-storage cookie
  const authSession = request.cookies.get("auth-storage");
  let user = null;

  console.log("🍪 Auth-storage cookie:", authSession ? "найден" : "не найден");

  if (authSession) {
    try {
      const parsed = JSON.parse(decodeURIComponent(authSession.value));
      user = parsed.state?.user;
      console.log(
        "👤 Пользователь из cookie:",
        user
          ? {
              id: user.$id,
              name: user.name,
              email: user.email,
              role: user.role,
              isActive: user.isActive,
            }
          : "null"
      );
    } catch (error) {
      console.error("❌ Ошибка при разборе auth-storage:", error);
    }
  }

  const isAuthenticated = !!user && user.$id && user.email && user.role;
  const isActive = user?.isActive === true;

  console.log(`🔍 Статус авторизации:`, {
    isAuthenticated,
    isActive,
    userRole: user?.role || "нет роли",
  });

  // Публичные страницы (доступны всем)
  const publicPaths = ["/", "/events", "/search"];
  const isPublicPath =
    publicPaths.includes(path) || path.startsWith("/events/");

  if (isPublicPath) {
    console.log("🌐 Публичный путь, доступ разрешен");
    return NextResponse.next();
  }

  // Страницы авторизации - логин и регистрация
  if (path.startsWith("/login") || path.startsWith("/register")) {
    if (isAuthenticated && isActive) {
      console.log("✅ Пользователь уже авторизован, перенаправляем по роли");
      return redirectByRole(user.role, request);
    }
    console.log("📝 Доступ к странице авторизации");
    return NextResponse.next();
  }

  // Если пользователь не авторизован или не активирован
  if (!isAuthenticated || !isActive) {
    console.log(
      "🚫 Пользователь не авторизован или не активен, перенаправляем на login"
    );
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // Защита маршрутов по ролям
  if (path.startsWith("/admin") && user.role !== UserRole.ADMIN) {
    console.log("🚫 Недостаточно прав для /admin, перенаправляем по роли");
    return redirectByRole(user.role, request);
  }

  if (
    path.startsWith("/organizer") &&
    ![UserRole.ADMIN, UserRole.ORGANIZER].includes(user.role)
  ) {
    console.log("🚫 Недостаточно прав для /organizer, перенаправляем по роли");
    return redirectByRole(user.role, request);
  }

  // Профиль и личные страницы - доступ для всех авторизованных
  if (
    path.startsWith("/profile") ||
    path.startsWith("/favorites") ||
    path.startsWith("/my-events")
  ) {
    console.log("✅ Доступ к личным страницам разрешен");
    return NextResponse.next();
  }

  // Перенаправление с корня
  if (path === "/") {
    console.log("🏠 Перенаправление с главной страницы по роли");
    return redirectByRole(user.role, request);
  }

  console.log("✅ Доступ разрешен");
  return NextResponse.next();
}

function redirectByRole(role: UserRole, request: NextRequest) {
  let targetPath: string;

  switch (role) {
    case UserRole.ADMIN:
      targetPath = "/admin";
      console.log("👑 Перенаправление ADMIN на /admin");
      break;
    case UserRole.ORGANIZER:
      targetPath = "/organizer";
      console.log("📋 Перенаправление ORGANIZER на /organizer");
      break;
    case UserRole.USER:
      targetPath = "/";
      console.log("🎓 Перенаправление USER на /");
      break;
    default:
      targetPath = "/login";
      console.log("❓ Неизвестная роль, перенаправление на /login");
  }

  const url = new URL(targetPath, request.url);
  console.log(
    `🚀 Выполняем редирект: ${request.nextUrl.pathname} → ${targetPath}`
  );
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|public|favicon.ico).*)",
    "/admin/:path*",
    "/organizer/:path*",
    "/profile/:path*",
    "/favorites/:path*",
    "/my-events/:path*",
    "/login",
    "/register",
    "/",
  ],
};
