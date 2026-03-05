"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@/types";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
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
            autoClose: 15000,
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || null;

  const { user, isAuthenticated, login, loading } = useAuth();

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

  useEffect(() => {
    if (isAuthenticated && user && !isSubmitting && redirectPath) {
      console.log(
        "🚀 Пользователь уже авторизован, перенаправляем на:",
        redirectPath
      );

      toast.success(`Добро пожаловать, ${user.name}!`, {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        window.location.href = redirectPath;
      }, 500);
    }
  }, [isAuthenticated, user, isSubmitting, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("🔐 Попытка входа:", { email, password: "***" });

    try {
      const loggedInUser = await login(email, password);
      console.log("✅ Успешный логин:", loggedInUser.name);

      toast.success(`Добро пожаловать, ${loggedInUser.name}!`, {
        position: "top-right",
        autoClose: 2000,
      });

      const targetUrl = redirectPath || getRedirectUrl(loggedInUser.role);
      console.log("🚀 Перенаправляем на:", targetUrl);

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 800);
    } catch (error: any) {
      console.error("❌ Ошибка при входе:", error);
      setIsSubmitting(false);

      const message = error?.message || "Ошибка при входе";

      if (message.includes("активации")) {
        toast.error("⚠️ Ваш аккаунт еще не активирован администратором.", {
          position: "top-center",
          autoClose: 6000,
        });
      } else if (
        message.includes("Invalid credentials") ||
        message.includes("Неверный")
      ) {
        toast.error("❌ Неверный email или пароль.", {
          position: "top-center",
          autoClose: 5000,
        });
      } else {
        toast.error(`Ошибка входа: ${message}`, {
          position: "top-center",
          autoClose: 5000,
        });
      }
    }
  };

  if (loading || isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isSubmitting ? "Вход в систему..." : "Проверка авторизации..."}
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">
                {isSubmitting ? "Входим в систему..." : "Проверяем данные..."}
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
        {isAuthenticated && user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Вы уже авторизованы как {user.name}
                </p>
                <button
                  onClick={() => {
                    const targetUrl = redirectPath || getRedirectUrl(user.role);
                    window.location.href = targetUrl;
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Перейти к панели управления
                </button>
              </div>
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
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
              disabled={loading}
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
                disabled={loading}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
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
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Вход...
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
