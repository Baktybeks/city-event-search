import { useAuthStore } from "@/store/authStore";
import { useSyncAuthCookie } from "./useSyncAuthCookie";
import {
  useCurrentUser,
  useLogin as useAppwriteLogin,
  useLogout as useAppwriteLogout,
  useRegister as useAppwriteRegister,
  useUpdateCurrentUser as useAppwriteUpdateCurrentUser,
} from "@/services/authService";
import { UserRole, User } from "@/types";
import { useEffect } from "react";

// Типы для проверки пользователя
type AuthenticatedUser = User & { id: string; name: string; role: UserRole };
type NotActivatedUser = { notActivated: true };

// Type guards для проверки типов
function isAuthenticatedUser(user: any): user is AuthenticatedUser {
  return (
    user &&
    typeof user === "object" &&
    "$id" in user &&
    "name" in user &&
    "role" in user &&
    "isActive" in user &&
    user.isActive === true &&
    !("notActivated" in user)
  );
}

function isNotActivatedUser(user: any): user is NotActivatedUser {
  return user && typeof user === "object" && "notActivated" in user;
}

export function useAuth() {
  // Zustand store
  const {
    user: storeUser,
    setUser,
    clearUser,
    updateUser,
    setLoading,
  } = useAuthStore();

  // Синхронизация с cookies для middleware
  useSyncAuthCookie();

  // React Query для запросов к API
  const {
    data: queryUser,
    isLoading: queryLoading,
    error: queryError,
    refetch,
  } = useCurrentUser();

  const loginMutation = useAppwriteLogin();
  const logoutMutation = useAppwriteLogout();
  const registerMutation = useAppwriteRegister();
  const updateUserMutation = useAppwriteUpdateCurrentUser();

  // Синхронизация данных между React Query и Zustand
  useEffect(() => {
    if (queryUser && isAuthenticatedUser(queryUser)) {
      // Если в React Query есть валидный пользователь, обновляем store
      if (!storeUser || storeUser.$id !== queryUser.$id) {
        console.log(
          "🔄 Синхронизация: обновляем store из React Query:",
          queryUser.name
        );
        setUser(queryUser);
      }
    } else if (queryUser === null && storeUser) {
      // Если React Query вернул null, но в store есть пользователь - очищаем store
      console.log("🔄 Синхронизация: очищаем store (React Query вернул null)");
      clearUser();
    }
  }, [queryUser, storeUser, setUser, clearUser]);

  // Определяем итоговое состояние
  const user = storeUser;
  const isAuthenticated = isAuthenticatedUser(user);
  const isNotActivated = queryUser ? isNotActivatedUser(queryUser) : false;
  const loading =
    queryLoading ||
    loginMutation.isPending ||
    logoutMutation.isPending ||
    registerMutation.isPending ||
    updateUserMutation.isPending;

  const userWithId = isAuthenticated
    ? {
        ...user,
        id: user.$id,
      }
    : null;

  const login = async (email: string, password: string): Promise<User> => {
    try {
      console.log("🔐 useAuth: Начинаем логин...");
      setLoading(true);

      const result = await loginMutation.mutateAsync({ email, password });
      console.log("✅ useAuth: Логин успешен, обновляем store:", result.name);

      // Обновляем store сразу после успешного логина
      setUser(result);

      return result;
    } catch (error) {
      console.error("❌ useAuth: Ошибка логина:", error);
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<User> => {
    try {
      console.log("📝 useAuth: Начинаем регистрацию...");
      setLoading(true);

      const result = await registerMutation.mutateAsync({
        name,
        email,
        password,
        role,
      });
      console.log("✅ useAuth: Регистрация успешна:", result.name);

      // НЕ обновляем store автоматически при регистрации
      // (пользователь может быть не активирован)

      return result;
    } catch (error: any) {
      if (error?.message?.includes("Сервер недоступен")) {
        // Сетевая ошибка — уже обработана в authService, не дублируем в консоль
      } else {
        console.error("❌ useAuth: Ошибка регистрации:", error);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (data: Partial<User>): Promise<User> => {
    try {
      console.log("🔄 useAuth: Обновляем пользователя...");

      const result = await updateUserMutation.mutateAsync(data);
      console.log("✅ useAuth: Обновление успешно");

      // Обновляем store
      updateUser(data);

      return result;
    } catch (error) {
      console.error("❌ useAuth: Ошибка обновления:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log("🚪 useAuth: Выходим из системы...");
      setLoading(true);

      await logoutMutation.mutateAsync();
      console.log("✅ useAuth: Выход успешен, очищаем store");

      // Очищаем store (что автоматически очистит cookie)
      clearUser();

      // Перенаправляем на главную страницу
      console.log("🏠 useAuth: Перенаправляем на главную страницу");
      window.location.href = "/";
    } catch (error) {
      console.error("❌ useAuth: Ошибка выхода:", error);
      // Даже при ошибке очищаем локальные данные и перенаправляем
      clearUser();
      console.log("🏠 useAuth: Перенаправляем на главную (после ошибки)");
      window.location.href = "/";
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkAuthState = () => {
    console.log("🔧 useAuth: Принудительная проверка состояния");
    refetch();
  };

  // Ошибки
  const error =
    queryError?.message ||
    loginMutation.error?.message ||
    logoutMutation.error?.message ||
    registerMutation.error?.message ||
    updateUserMutation.error?.message ||
    null;

  return {
    // Основные данные
    user: userWithId,
    loading,
    error,

    // Состояния
    isAuthenticated,
    isNotActivated,
    userRole: user?.role || null,

    // Методы
    login,
    register,
    updateUser: updateUserData,
    logout,
    checkAuthState,

    // Дополнительные утилиты
    clearError: () => {
      console.log("🔧 useAuth: Очистка ошибок");
    },
  };
}
