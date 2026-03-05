import { appwriteConfig } from "@/constants/appwriteConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Client, Account, ID, Databases, Query } from "appwrite";
import { User, UserRole } from "@/types";

const {
  projectId: PROJECT_ID,
  endpoint: ENDPOINT,
  databaseId: DATABASE_ID,
  collections,
} = appwriteConfig;

export type GetUserResult = User | { notActivated: true } | null;

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
const account = new Account(client);
const database = new Databases(client);

const NETWORK_ERROR_MESSAGE =
  "Сервер недоступен. Проверьте подключение к интернету и настройки Appwrite (NEXT_PUBLIC_APPWRITE_ENDPOINT, проект).";

function isNetworkError(err: unknown): boolean {
  if (!err) return false;
  const message = (err as any)?.message ?? String(err);
  const name = (err as any)?.name ?? "";
  return (
    message === "Failed to fetch" ||
    String(message).toLowerCase().includes("network") ||
    name === "TypeError" ||
    String(message).toLowerCase().includes("fetch")
  );
}

function toNetworkError(err: unknown): Error {
  return new Error(NETWORK_ERROR_MESSAGE);
}

export const authApi = {
  getCurrentUser: async (): Promise<User | null | { notActivated: true }> => {
    try {
      console.log("🔍 getCurrentUser: Начинаем проверку пользователя...");

      // Проверяем конфигурацию
      if (!ENDPOINT || !PROJECT_ID || !DATABASE_ID) {
        console.error("❌ getCurrentUser: Отсутствуют переменные окружения:", {
          ENDPOINT,
          PROJECT_ID,
          DATABASE_ID,
        });
        return null;
      }

      let session;
      try {
        console.log("🔍 getCurrentUser: Пытаемся получить сессию...");
        session = await account.get();
        console.log("✅ getCurrentUser: Сессия найдена:", session.email);
      } catch (err: any) {
        const message = err?.message ?? String(err);
        const isNetworkError =
          message === "Failed to fetch" ||
          message?.toLowerCase?.().includes("network") ||
          err?.name === "TypeError";

        console.log(
          "❌ getCurrentUser: Ошибка получения сессии:",
          err?.code,
          message
        );

        if (err?.code === 401) {
          console.log("❌ getCurrentUser: Пользователь не авторизован (401)");
          return null;
        }

        if (isNetworkError) {
          console.warn(
            "⚠️ getCurrentUser: Сеть недоступна. Проверьте NEXT_PUBLIC_APPWRITE_ENDPOINT и подключение к интернету."
          );
          return null;
        }

        console.error(
          "❌ getCurrentUser: Неожиданная ошибка при получении сессии:",
          err
        );
        return null;
      }

      if (!session) {
        console.log("❌ getCurrentUser: Сессия не найдена");
        return null;
      }

      console.log("🔍 getCurrentUser: Ищем пользователя в БД:", session.email);
      try {
        const users = await database.listDocuments(
          DATABASE_ID,
          collections.users,
          [Query.equal("email", session.email)]
        );

        if (users.documents.length === 0) {
          console.log("❌ getCurrentUser: Пользователь не найден в БД");
          return null;
        }

        const userData = users.documents[0];
        console.log("✅ getCurrentUser: Пользователь найден:", {
          name: userData.name,
          email: userData.email,
          role: userData.role,
          isActive: userData.isActive,
        });

        if (!userData.isActive && userData.role !== UserRole.ADMIN) {
          console.log("⚠️ getCurrentUser: Пользователь не активирован");
          return { notActivated: true };
        }

        console.log("✅ getCurrentUser: Возвращаем активного пользователя");
        return userData as unknown as User;
      } catch (dbError: any) {
        console.error("❌ getCurrentUser: Ошибка запроса к БД:", dbError);
        return null;
      }
    } catch (error) {
      console.error("❌ getCurrentUser: Критическая ошибка:", error);
      return null;
    }
  },

  register: async (
    name: string,
    email: string,
    password: string,
    role?: UserRole
  ): Promise<User> => {
    try {
      console.log(`Регистрация пользователя: ${email}...`);

      const adminCheck = await database.listDocuments(
        DATABASE_ID,
        collections.users,
        [Query.equal("role", UserRole.ADMIN)]
      );

      const finalRole =
        adminCheck.total === 0 ? UserRole.ADMIN : role || UserRole.USER;

      const authUser = await account.create(ID.unique(), email, password, name);

      const userData = {
        name,
        email,
        role: finalRole,
        isActive: finalRole === UserRole.ADMIN ? true : false,
        createdAt: new Date().toISOString(),
      };

      const user = await database.createDocument(
        DATABASE_ID,
        collections.users,
        authUser.$id,
        userData
      );

      console.log("Пользователь успешно зарегистрирован:", user.$id);
      return user as unknown as User;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn("Регистрация: сетевая ошибка (Appwrite недоступен).", error?.message);
        throw toNetworkError(error);
      }
      console.error("Ошибка при регистрации пользователя:", error);
      throw error;
    }
  },

  login: async (email: string, password: string): Promise<User> => {
    try {
      console.log(`Вход пользователя: ${email}...`);

      // Удаляем существующую сессию если есть
      try {
        await account.deleteSession("current");
      } catch (e) {
        // Игнорируем ошибку если сессии нет
      }

      // Создаем новую сессию
      await account.createEmailPasswordSession(email, password);

      // Проверяем данные пользователя
      const userResult = await authApi.getCurrentUser();

      if (
        userResult &&
        typeof userResult === "object" &&
        "notActivated" in userResult
      ) {
        await account.deleteSession("current");
        throw new Error("Ваш аккаунт ожидает активации администратором.");
      }

      if (!userResult) {
        throw new Error("Не удалось получить данные пользователя");
      }
      return userResult as User;
    } catch (error: any) {
      if (isNetworkError(error)) {
        console.warn("Вход: сетевая ошибка (Appwrite недоступен).", error?.message);
        throw toNetworkError(error);
      }
      console.error("Ошибка при входе в систему:", error);
      throw error;
    }
  },

  logout: async (): Promise<boolean> => {
    try {
      console.log("Выход из системы...");
      await account.deleteSession("current");
      console.log("Сессия успешно удалена");
      return true;
    } catch (error) {
      console.error("Ошибка при выходе из системы:", error);
      throw error;
    }
  },

  updateCurrentUser: async (data: Partial<User>): Promise<User> => {
    try {
      console.log("Обновление данных текущего пользователя...");

      const currentUser = await authApi.getCurrentUser();

      if (!currentUser || "notActivated" in currentUser) {
        throw new Error("Пользователь не авторизован");
      }

      const updatedUser = await database.updateDocument(
        DATABASE_ID,
        collections.users,
        currentUser.$id,
        data
      );

      console.log("Данные пользователя успешно обновлены");
      return updatedUser as unknown as User;
    } catch (error) {
      console.error("Ошибка при обновлении данных пользователя:", error);
      throw error;
    }
  },

  activateUser: async (userId: string): Promise<User> => {
    try {
      console.log(`Активация пользователя с ID: ${userId}...`);
      const user = await database.updateDocument(
        DATABASE_ID,
        collections.users,
        userId,
        { isActive: true }
      );
      console.log("Пользователь успешно активирован");
      return user as unknown as User;
    } catch (error) {
      console.error("Ошибка при активации пользователя:", error);
      throw error;
    }
  },

  deactivateUser: async (userId: string): Promise<User> => {
    try {
      console.log(`Деактивация пользователя с ID: ${userId}...`);
      const user = await database.updateDocument(
        DATABASE_ID,
        collections.users,
        userId,
        { isActive: false }
      );
      console.log("Пользователь успешно деактивирован");
      return user as unknown as User;
    } catch (error) {
      console.error("Ошибка при деактивации пользователя:", error);
      throw error;
    }
  },
};

// Ключи для React Query
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  users: () => [...authKeys.all, "users"] as const,
  pendingUsers: () => [...authKeys.all, "pending"] as const,
  usersByRole: (role: UserRole) => [...authKeys.users(), role] as const,
};

// ИСПРАВЛЕННЫЙ useCurrentUser без debug useEffect
export const useCurrentUser = () => {
  return useQuery<GetUserResult>({
    queryKey: authKeys.user(),
    queryFn: authApi.getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 минут
    gcTime: 1000 * 60 * 10, // 10 минут
    retry: (failureCount, error) => {
      console.log("🔄 useCurrentUser retry:", failureCount, error);
      // Только 1 повтор при ошибке сети, не повторяем при 401 ошибках
      if (error && (error as any).code === 401) {
        return false;
      }
      return failureCount < 1;
    },
    retryDelay: 2000, // 2 секунды между попытками
    refetchOnWindowFocus: false, // ВАЖНО: не перезапрашиваем при фокусе
    refetchOnMount: false, // ВАЖНО: не перезапрашиваем при монтировании каждый раз
    refetchOnReconnect: false, // Не перезапрашиваем при восстановлении сети
    refetchInterval: false, // Отключаем автоматические перезапросы
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      email,
      password,
      role,
    }: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
    }) => authApi.register(name, email, password, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
};

// ИСПРАВЛЕННЫЙ useLogin - БЕЗ инвалидации кеша
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      console.log("✅ Login успешен, устанавливаем данные в кеш:", data.name);
      // ТОЛЬКО устанавливаем данные в кеш, БЕЗ инвалидации
      queryClient.setQueryData(authKeys.user(), data);

      // НЕ вызываем invalidateQueries - это может вызвать циклы
      // queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: (error) => {
      console.error("❌ Login ошибка:", error);
      // Очищаем кеш при ошибке
      queryClient.setQueryData(authKeys.user(), null);
    },
  });
};

// ИСПРАВЛЕННЫЙ useLogout
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      console.log("✅ Logout успешен, очищаем кеш");
      // Сначала очищаем данные пользователя
      queryClient.setQueryData(authKeys.user(), null);
      // Затем очищаем весь кеш
      queryClient.clear();
    },
    onError: (error) => {
      console.error("❌ Logout ошибка:", error);
      // Даже при ошибке очищаем локальный кеш
      queryClient.setQueryData(authKeys.user(), null);
    },
  });
};

// ИСПРАВЛЕННЫЙ useUpdateCurrentUser
export const useUpdateCurrentUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) => authApi.updateCurrentUser(data),
    onSuccess: (updatedUser) => {
      // Обновляем кеш текущего пользователя
      queryClient.setQueryData(authKeys.user(), updatedUser);
      // НЕ инвалидируем кеш пользователя, только список пользователей
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
    onError: (error) => {
      console.error("Update user mutation error:", error);
    },
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => authApi.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
      queryClient.invalidateQueries({ queryKey: authKeys.pendingUsers() });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => authApi.deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
};

export const usePendingUsers = () => {
  return useQuery({
    queryKey: authKeys.pendingUsers(),
    queryFn: async () => {
      try {
        const result = await database.listDocuments(
          DATABASE_ID,
          collections.users,
          [Query.equal("isActive", false)]
        );
        return result.documents as unknown as User[];
      } catch (error) {
        console.error(
          "Ошибка при получении неактивированных пользователей:",
          error
        );
        return [];
      }
    },
  });
};

export const useUsersByRole = (role: UserRole) => {
  return useQuery({
    queryKey: authKeys.usersByRole(role),
    queryFn: async () => {
      try {
        const result = await database.listDocuments(
          DATABASE_ID,
          collections.users,
          [Query.equal("role", role)]
        );
        return result.documents as unknown as User[];
      } catch (error) {
        console.error(
          `Ошибка при получении пользователей с ролью ${role}:`,
          error
        );
        return [];
      }
    },
  });
};

export const useActiveUsersByRole = (role: UserRole) => {
  return useQuery({
    queryKey: [...authKeys.usersByRole(role), "active"],
    queryFn: async () => {
      try {
        const result = await database.listDocuments(
          DATABASE_ID,
          collections.users,
          [Query.equal("role", role), Query.equal("isActive", true)]
        );
        return result.documents as unknown as User[];
      } catch (error) {
        console.error(
          `Ошибка при получении активных пользователей с ролью ${role}:`,
          error
        );
        return [];
      }
    },
  });
};

export const useAllUsers = () => {
  return useQuery({
    queryKey: authKeys.users(),
    queryFn: async () => {
      try {
        const result = await database.listDocuments(
          DATABASE_ID,
          collections.users
        );
        return result.documents as unknown as User[];
      } catch (error) {
        console.error("Ошибка при получении списка пользователей:", error);
        return [];
      }
    },
  });
};
