// components/auth/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import { toast } from "react-toastify";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, loading, isNotActivated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Если пользователь не авторизован
    if (!user) {
      router.push("/login");
      return;
    }

    // Если аккаунт не активирован
    if (isNotActivated) {
      toast.warning("Ваш аккаунт ожидает активации администратором");
      router.push("/login");
      return;
    }

    // Если указаны разрешенные роли и пользователь не подходит
    if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
      toast.error("У вас нет доступа к этой странице");

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        // Перенаправляем на домашнюю страницу соответствующую роли
        switch (user.role) {
          case UserRole.ADMIN:
            router.push("/admin");
            break;
          case UserRole.ORGANIZER:
            router.push("/organizer");
            break;
          case UserRole.USER:
            router.push("/");
            break;
          default:
            router.push("/");
        }
      }
      return;
    }
  }, [user, loading, isNotActivated, allowedRoles, redirectTo, router]);

  // Показываем загрузку
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован или не активирован, не показываем контент
  if (!user || isNotActivated) {
    return null;
  }

  // Если указаны роли и пользователь не подходит, не показываем контент
  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

// Компонент для админских страниц
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>{children}</ProtectedRoute>
  );
}

// Компонент для страниц организаторов
export function OrganizerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ORGANIZER]}>
      {children}
    </ProtectedRoute>
  );
}

// Компонент для страниц пользователей (исключая админов)
export function UserRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.ORGANIZER]}>
      {children}
    </ProtectedRoute>
  );
}
