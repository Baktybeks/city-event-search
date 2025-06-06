"use client";

import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Не повторяем запросы при 401 и 403 ошибках
              if (error && typeof error === "object" && "status" in error) {
                if (error.status === 401 || error.status === 403) {
                  return false;
                }
              }
              return failureCount < 3;
            },
            staleTime: 1000 * 60 * 5, // 5 минут
          },
        },
      })
  );

  // Состояние для отслеживания клиентской гидратации
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Показываем девтулы только после гидратации */}
      {hasMounted && process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools />
      )}
      {/* ToastContainer тоже только после гидратации */}
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
        />
      )}
    </QueryClientProvider>
  );
}
