// src/hooks/useSyncAuthCookie.ts

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * Хук для синхронизации состояния аутентификации с cookies
 * Необходим для работы middleware, который читает состояние из cookies
 */
export function useSyncAuthCookie() {
  const { user } = useAuthStore();

  useEffect(() => {
    // Функция для обновления cookie
    const updateAuthCookie = () => {
      const authData = {
        state: {
          user: user,
        },
      };

      if (user) {
        // Устанавливаем cookie если пользователь авторизован
        const cookieValue = encodeURIComponent(JSON.stringify(authData));
        document.cookie = `auth-storage=${cookieValue}; path=/; max-age=604800; SameSite=Lax`; // 7 дней
        console.log("🍪 Cookie обновлен для пользователя:", user.name);
      } else {
        // Удаляем cookie если пользователь не авторизован
        document.cookie = `auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
        console.log("🍪 Cookie очищен");
      }
    };

    // Обновляем cookie при изменении пользователя
    updateAuthCookie();
  }, [user]);

  // Очистка cookie при размонтировании (опционально)
  useEffect(() => {
    return () => {
      // При необходимости можно добавить логику очистки
      console.log("🍪 useSyncAuthCookie: размонтирование");
    };
  }, []);
}
