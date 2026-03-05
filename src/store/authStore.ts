import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;

  // Действия
  setUser: (user: User) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

// Создаем хранилище с плагином persist
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      setUser: (user: User) => {
        console.log("🏪 AuthStore: Устанавливаем пользователя:", user.name);
        set({ user, isLoading: false });
      },

      clearUser: () => {
        console.log("🏪 AuthStore: Очищаем пользователя");
        set({ user: null, isLoading: false });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          console.log(
            "🏪 AuthStore: Обновляем пользователя:",
            updatedUser.name
          );
          set({ user: updatedUser });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-storage", // Должно совпадать с именем в middleware
      storage: createJSONStorage(() => {
        // Проверяем, что мы в браузере
        if (typeof window !== "undefined") {
          return localStorage;
        }
        // Возвращаем заглушку для SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: (state) => {
        console.log("🏪 AuthStore: Восстанавливаем состояние из localStorage");
        return (state, error) => {
          if (error) {
            console.error("🏪 AuthStore: Ошибка восстановления:", error);
          } else {
            console.log(
              "🏪 AuthStore: Состояние восстановлено:",
              state?.user?.name || "нет пользователя"
            );
          }
        };
      },
    }
  )
);
