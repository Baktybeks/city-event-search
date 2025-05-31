"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@/types";
import { toast } from "react-toastify";
import { useLogin, useCurrentUser } from "@/services/authService";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
} from "lucide-react";

function LoginNotifications() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const registered = searchParams.get("registered");
    const activated = searchParams.get("activated");
    const activation = searchParams.get("activation");

    if (registered === "true") {
      if (activated === "true") {
        toast.success(
          "🎉 Регистрация завершена! Аккаунт активирован, можете войти в систему.",
          {
            position: "top-center",
            autoClose: 6000,
          }
        );
      } else if (activation === "pending") {
        toast.info(
          "⏳ Регистрация завершена! Ваш аккаунт ожидает активации администратором.",
          {
            position: "top-center",
            autoClose: 8000,
          }
        );
      } else {
        toast.success("✅ Регистрация завершена успешно!", {
          position: "top-center",
          autoClose: 5000,
        });
      }
    }
  }, [searchParams]);

  return null;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const router = useRouter();
  const { data: currentUser, isLoading: isCheckingUser } = useCurrentUser();
  const loginMutation = useLogin();

  // Проверяем, авторизован ли уже пользователь при загрузке
  useEffect(() => {
    if (
      currentUser &&
      typeof currentUser === "object" &&
      "id" in currentUser &&
      "name" in currentUser &&
      !isCheckingUser
    ) {
      setIsRedirecting(true);
      toast.success(`Добро пожаловать, ${currentUser.name}!`, {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => {
        redirectByRole(currentUser.role);
      }, 100);
    }
  }, [currentUser, isCheckingUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRedirecting(false);

    console.log("Попытка входа с данными:", { email, password: "***" });

    try {
      const user = await loginMutation.mutateAsync({ email, password });

      console.log("Успешный логин, пользователь:", user);

      setIsRedirecting(true);
      toast.success(`Добро пожаловать, ${user.name}!`, {
        position: "top-right",
        autoClose: 3000,
      });

      // Небольшая задержка для обновления состояния
      setTimeout(() => {
        window.location.href = getRedirectUrl(user.role);
      }, 500);
    } catch (error: any) {
      console.error("Ошибка при входе:", error);
      setIsRedirecting(false);

      const message = error?.message || "Ошибка при входе";

      if (message.includes("активации")) {
        toast.error(
          "⚠️ Ваш аккаунт еще не активирован администратором. Попробуйте позже или обратитесь к администратору.",
          { position: "top-center", autoClose: 6000 }
        );
      } else if (
        message.includes("Invalid credentials") ||
        message.includes("Неверный")
      ) {
        toast.error(
          "❌ Неверный email или пароль. Проверьте правильность введенных данных.",
          { position: "top-center", autoClose: 5000 }
        );
      } else {
        toast.error(`Ошибка входа: ${message}`, {
          position: "top-center",
          autoClose: 5000,
        });
      }
    }
  };

  const getRedirectUrl = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return "/admin";
      case UserRole.ORGANIZER:
        return "/organizer";
      case UserRole.USER:
        return "/";
      default:
        return "/";
    }
  };

  const redirectByRole = (role: UserRole) => {
    const url = getRedirectUrl(role);
    router.push(url);
  };

  // Показываем загрузку если идет перенаправление или проверка пользователя
  if (isRedirecting || isCheckingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isCheckingUser
                ? "Проверка авторизации..."
                : "Перенаправление..."}
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">
                {isCheckingUser ? "Проверяем данные..." : "Входим в систему..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать!
          </h1>
          <p className="text-gray-600">
            Войдите в свой аккаунт для доступа к платформе событий
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {process.env.NODE_ENV === "development" && (
            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
              Debug:{" "}
              {JSON.stringify({
                email,
                hasPassword: !!password,
                isLoading: loginMutation.isPending,
                currentUser:
                  currentUser &&
                  typeof currentUser === "object" &&
                  "id" in currentUser
                    ? "authorized"
                    : "not authorized",
              })}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email адрес
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loginMutation.isPending || isRedirecting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Пароль
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loginMutation.isPending || isRedirecting}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loginMutation.isPending || isRedirecting}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending || isRedirecting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loginMutation.isPending || isRedirecting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isRedirecting ? "Перенаправление..." : "Вход..."}
              </div>
            ) : (
              "Войти"
            )}
          </button>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">или</span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Нет аккаунта?{" "}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Зарегистрироваться
                </Link>
              </p>
              <p className="text-xs text-gray-500">
                Если ваш аккаунт не активирован, обратитесь к администратору
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoginPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать!
          </h1>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginNotifications />
      <LoginForm />
    </Suspense>
  );
}
