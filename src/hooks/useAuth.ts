// src/hooks/useAuth.ts
import {
  useCurrentUser,
  useLogin as useAppwriteLogin,
  useLogout as useAppwriteLogout,
} from "@/services/authService";
import { UserRole, User } from "@/types";

// Типы для проверки пользователя
type AuthenticatedUser = User & { id: string; name: string; role: UserRole };
type NotActivatedUser = { notActivated: true };
type UserResult = AuthenticatedUser | NotActivatedUser | null;

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
  const { data: user, isLoading, error, refetch } = useCurrentUser();
  const loginMutation = useAppwriteLogin();
  const logoutMutation = useAppwriteLogout();

  // Определяем тип пользователя
  const isActiveUser = isAuthenticatedUser(user);
  const isNotActivated = isNotActivatedUser(user);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      // Обновляем кеш после успешного логина
      await refetch();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
      // Принудительно обновляем состояние после выхода
      await refetch();
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      throw error;
    }
  };

  const clearError = () => {
    // React Query автоматически управляет ошибками
    // Можно добавить дополнительную логику при необходимости
  };

  const checkAuthState = () => {
    refetch();
  };

  // Добавляем функцию для получения пользователя с дополнительной информацией
  const getUserWithId = (): (User & { id: string }) | null => {
    if (isActiveUser) {
      return {
        ...user,
        id: user.$id,
      };
    }
    return null;
  };

  return {
    user: getUserWithId(),
    loading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    error:
      error?.message ||
      loginMutation.error?.message ||
      logoutMutation.error?.message ||
      null,
    isNotActivated: isNotActivated,
    login,
    logout,
    clearError,
    checkAuthState,
    // Дополнительные утилиты
    isAuthenticated: isActiveUser,
    userRole: isActiveUser ? user.role : null,
  };
}
