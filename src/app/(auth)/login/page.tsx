"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import { toast } from "react-toastify";
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
  const [errorMessage, setErrorMessage] = useState("");

  const { login, error, clearError, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.isActive) {
      toast.success(`Добро пожаловать, ${user.name}!`, {
        position: "top-right",
        autoClose: 3000,
      });
      redirectByRole(user.role);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    clearError();

    try {
      await login(email, password);
    } catch (error: any) {
      const message = error?.message || "Ошибка при входе";

      if (
        message.includes("не активирован") ||
        message.includes("not activated")
      ) {
        setErrorMessage(
          "⚠️ Ваш аккаунт еще не активирован администратором. Попробуйте позже или обратитесь к администратору."
        );
      } else if (message.includes("Неверный") || message.includes("Invalid")) {
        setErrorMessage(
          "❌ Неверный email или пароль. Проверьте правильность введенных данных."
        );
      } else if (
        message.includes("заблокирован") ||
        message.includes("blocked")
      ) {
        setErrorMessage(
          "🚫 Ваш аккаунт заблокирован. Обратитесь к администратору системы."
        );
      } else if (
        message.includes("не найден") ||
        message.includes("not found")
      ) {
        setErrorMessage(
          "📧 Пользователь с таким email не найден. Проверьте email или зарегистрируйтесь."
        );
      } else {
        setErrorMessage(`Ошибка входа: ${message}`);
      }
    }
  };

  const redirectByRole = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        router.push("/admin");
        break;
      case UserRole.ORGANIZER:
        router.push("/organizer");
        break;
      case UserRole.USER:
        router.push("/");
        break;
      default:
        router.push("/");
    }
  };

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
          {(error || errorMessage) && (
            <div
              className={`p-4 border rounded-lg ${
                (errorMessage || error)?.includes("не активирован") ||
                (errorMessage || error)?.includes("not activated")
                  ? "text-amber-700 bg-amber-50 border-amber-200"
                  : (errorMessage || error)?.includes("заблокирован") ||
                    (errorMessage || error)?.includes("blocked")
                  ? "text-red-700 bg-red-50 border-red-200"
                  : (errorMessage || error)?.includes("не найден") ||
                    (errorMessage || error)?.includes("not found")
                  ? "text-blue-700 bg-blue-50 border-blue-200"
                  : "text-red-700 bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {(errorMessage || error)?.includes("не активирован") ||
                (errorMessage || error)?.includes("not activated") ? (
                  <Clock className="h-4 w-4 flex-shrink-0" />
                ) : (errorMessage || error)?.includes("заблокирован") ||
                  (errorMessage || error)?.includes("blocked") ? (
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                ) : (errorMessage || error)?.includes("не найден") ||
                  (errorMessage || error)?.includes("not found") ? (
                  <Info className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="text-sm">{errorMessage || error}</span>
              </div>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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
