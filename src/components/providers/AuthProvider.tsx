// src/components/providers/AuthProvider.tsx

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useSyncAuthCookie } from "@/hooks/useSyncAuthCookie";
import { useCurrentUser } from "@/services/authService";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user: storeUser, setUser, clearUser } = useAuthStore();
  const { data: queryUser, isLoading } = useCurrentUser();

  // Синхронизация с cookies
  useSyncAuthCookie();

  // Инициализация состояния при загрузке приложения
  useEffect(() => {
    console.log("🚀 AuthProvider: Инициализация...");

    // Если React Query вернул данные пользователя
    if (queryUser) {
      if (typeof queryUser === "object" && "notActivated" in queryUser) {
        // Пользователь не активирован
        console.log("⚠️ AuthProvider: Пользователь не активирован");
        clearUser();
      } else if (queryUser.$id) {
        // Валидный пользователь
        console.log(
          "✅ AuthProvider: Устанавливаем пользователя:",
          queryUser.name
        );
        setUser(queryUser);
      }
    } else if (queryUser === null && !isLoading) {
      // Явно нет пользователя и загрузка завершена
      console.log("❌ AuthProvider: Очищаем состояние (нет пользователя)");
      clearUser();
    }
  }, [queryUser, isLoading, setUser, clearUser]);

  return <>{children}</>;
}
