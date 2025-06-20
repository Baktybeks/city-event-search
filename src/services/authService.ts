import { appwriteConfig } from "@/constants/appwriteConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Client, Account, ID, Databases, Query } from "appwrite";
import { User, UserRole } from "@/types";
import React from "react"; // Добавляем импорт React

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
        console.log(
          "❌ getCurrentUser: Ошибка получения сессии:",
          err.code,
          err.message
        );
        if (err.code === 401) {
          console.log("❌ getCurrentUser: Пользователь не авторизован (401)");
          return null;
        }
        console.error(
          "❌ getCurrentUser: Неожиданная ошибка при получении сессии:",
          err
        );
        return null; // Возвращаем null вместо выброса ошибки
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

      // Проверяем, есть ли администраторы в системе
      const adminCheck = await database.listDocuments(
        DATABASE_ID,
        collections.users,
        [Query.equal("role", UserRole.ADMIN)]
      );

      const finalRole =
        adminCheck.total === 0 ? UserRole.ADMIN : role || UserRole.USER;

      // Создаем пользователя в Appwrite Auth
      const authUser = await account.create(ID.unique(), email, password, name);

      // Создаем документ пользователя в базе данных
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
      if (finalRole === UserRole.ADMIN) {
        console.log(
          "Пользователь назначен администратором (первый пользователь в системе)"
        );
      }
      return user as unknown as User;
    } catch (error) {
      console.error("Ошибка при регистрации пользователя:", error);
      throw error;
    }
  },

  login: async (email: string, password: string): Promise<User> => {
    try {
      console.log(`Вход пользователя: ${email}...`);

      // Проверяем существующую сессию
      let existingUser = null;
      try {
        existingUser = await authApi.getCurrentUser();
      } catch (e) {
        // Продолжаем, если ошибка
      }

      // Если сессия существует, удаляем её
      if (existingUser) {
        await account.deleteSession("current");
      }

      // Создаем новую сессию
      await account.createEmailPasswordSession(email, password);

      // Проверяем данные пользователя
      const userResult = await authApi.getCurrentUser();

      // Обработка неактивированного пользователя
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

  // Добавляем функцию обновления текущего пользователя
  updateCurrentUser: async (data: Partial<User>): Promise<User> => {
    try {
      console.log("Обновление данных текущего пользователя...");

      // Получаем текущего пользователя
      const currentUser = await authApi.getCurrentUser();

      if (!currentUser || "notActivated" in currentUser) {
        throw new Error("Пользователь не авторизован");
      }

      // Обновляем данные пользователя в базе данных
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

// React Query хуки
export const useCurrentUser = () => {
  const query = useQuery<GetUserResult>({
    queryKey: authKeys.user(),
    queryFn: authApi.getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 минут
    gcTime: 1000 * 60 * 10, // 10 минут (заменяет cacheTime)
    retry: (failureCount, error) => {
      console.log("🔄 useCurrentUser retry:", failureCount, error);
      // Ограничиваем количество попыток
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Добавляем отладку
  React.useEffect(() => {
    console.log("📊 useCurrentUser state:", {
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      data: query.data,
      error: query.error,
      status: query.status,
      failureCount: query.failureCount,
      isStale: query.isStale,
    });
  }, [
    query.isLoading,
    query.isFetching,
    query.data,
    query.error,
    query.status,
    query.failureCount,
    query.isStale,
  ]);

  return query;
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

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      // Обновляем кеш пользователя
      queryClient.setQueryData(authKeys.user(), data);
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: (error) => {
      console.error("Login mutation error:", error);
      // Очищаем кеш при ошибке
      queryClient.setQueryData(authKeys.user(), null);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.user(), null);
      queryClient.clear();
    },
  });
};

// Добавляем хук для обновления текущего пользователя
export const useUpdateCurrentUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) => authApi.updateCurrentUser(data),
    onSuccess: (updatedUser) => {
      // Обновляем кеш текущего пользователя
      queryClient.setQueryData(authKeys.user(), updatedUser);
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
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
