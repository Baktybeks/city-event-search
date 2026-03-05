"use client";

import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";
import { AppTimezoneProvider } from "@/contexts/AppTimezoneContext";
import "react-toastify/dist/ReactToastify.css";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ВАЖНО: строгие настройки для предотвращения циклов
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: false,
            retry: (failureCount, error) => {
              // Не повторяем запросы при 401 и 403 ошибках
              if (error && typeof error === "object" && "status" in error) {
                if (error.status === 401 || error.status === 403) {
                  return false;
                }
              }
              // Максимум 1 повтор для предотвращения циклов
              return failureCount < 1;
            },
            retryDelay: 2000, // 2 секунды между попытками
            staleTime: 1000 * 60 * 5, // 5 минут - данные считаются свежими
            gcTime: 1000 * 60 * 10, // 10 минут - время жизни в кеше
            // Предотвращаем лишние рефетчи
            refetchInterval: false,
            refetchIntervalInBackground: false,
          },
          mutations: {
            // Настройки для мутаций
            retry: (failureCount, error) => {
              if (error && typeof error === "object" && "status" in error) {
                if (error.status === 401 || error.status === 403) {
                  return false;
                }
              }
              return failureCount < 1;
            },
            retryDelay: 1000,
          },
        },
      })
  );

  // Состояние для отслеживания клиентской гидратации
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Debug информация только в development
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && hasMounted) {
      console.log("🔧 QueryClient инициализирован:", {
        defaultOptions: queryClient.getDefaultOptions(),
        queries: queryClient.getQueryCache().getAll().length,
        mutations: queryClient.getMutationCache().getAll().length,
      });
    }
  }, [hasMounted, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppTimezoneProvider>
        {children}

      {/* Показываем девтулы только после гидратации и в development */}
      {hasMounted && process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}

      {/* ToastContainer только после гидратации */}
      {hasMounted && (
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="mt-16"
          // Дополнительные настройки для предотвращения конфликтов
        />
      )}
      </AppTimezoneProvider>
    </QueryClientProvider>
  );
}
