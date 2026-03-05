"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import { toast } from "react-toastify";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Calendar,
  Settings,
} from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredRole, setRegisteredRole] = useState<UserRole | null>(null);

  const { register, error, clearError, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkFirstUser = async () => {
      try {
        const response = await fetch("/api/check-admins");
        const data = await response.json();
        setIsFirstUser(data.isFirstUser);

        if (data.isFirstUser) {
          setRole(UserRole.ADMIN);
        }
      } catch (error) {
        console.error("Ошибка при проверке администраторов:", error);
      }
    };

    checkFirstUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    clearError();

    if (password !== confirmPassword) {
      setErrorMessage("Пароли не совпадают");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Пароль должен содержать минимум 8 символов");
      return;
    }

    try {
      await register(name, email, password, role);
      setRegistrationSuccess(true);
      setRegisteredRole(role);

      if (isFirstUser || role === UserRole.ADMIN) {
        toast.success("🎉 Регистрация завершена! Вы можете войти в систему.", {
          position: "top-center",
          autoClose: 5000,
        });

        setTimeout(() => {
          router.push("/login?registered=true&activated=true");
        }, 3000);
      } else {
        toast.info("✅ Регистрация завершена! Ожидайте активации аккаунта.", {
          position: "top-center",
          autoClose: 7000,
        });

        setTimeout(() => {
          router.push("/login?registered=true&activation=pending");
        }, 5000);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ошибка при регистрации";
      setErrorMessage(message);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-100 text-center">
          {isFirstUser || registeredRole === UserRole.ADMIN ? (
            <>
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Добро пожаловать!
              </h1>
              <div className="space-y-3">
                <p className="text-gray-600">
                  Ваш аккаунт администратора успешно создан и автоматически
                  активирован.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Имя:</strong> {name}
                    <br />
                    <strong>Email:</strong> {email}
                    <br />
                    <strong>Роль:</strong> Администратор
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  Перенаправление на страницу входа...
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <Clock className="h-16 w-16 text-amber-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Регистрация завершена!
              </h1>
              <div className="space-y-3">
                <p className="text-gray-600">
                  Ваш аккаунт успешно создан, но требует активации
                  администратором.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      Что дальше?
                    </span>
                  </div>
                  <ul className="text-sm text-amber-700 space-y-1 text-left">
                    <li>
                      • Администратор получит уведомление о вашей регистрации
                    </li>
                    <li>• После активации вы получите доступ к системе</li>
                    <li>• Попробуйте войти через несколько минут</li>
                  </ul>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <strong>Имя:</strong> {name}
                    <br />
                    <strong>Email:</strong> {email}
                    <br />
                    <strong>Роль:</strong>{" "}
                    {registeredRole === UserRole.ORGANIZER
                      ? "Организатор"
                      : "Пользователь"}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  Перенаправление на страницу входа...
                </p>
              </div>
            </>
          )}

          <div className="pt-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Перейти ко входу
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Регистрация</h1>
          <p className="text-gray-600">
            Создайте аккаунт и откройте мир событий
          </p>
        </div>

        {!isFirstUser && role !== UserRole.ADMIN && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>Важно:</strong> После регистрации ваш аккаунт должен
                быть активирован администратором перед первым входом в систему.
              </p>
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
          {(error || errorMessage) && (
            <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{errorMessage || error}</span>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Полное имя
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Иван Иванов"
            />
          </div>

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
              autoComplete="off"
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
                autoComplete="off"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Минимум 8 символов"
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

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Подтверждение пароля
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Повторите пароль"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {!isFirstUser ? (
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Роль в системе
              </label>
              <div className="grid grid-cols-1 gap-3">
                <label
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-colors ${
                    role === UserRole.USER
                      ? "border-blue-600 ring-2 ring-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={UserRole.USER}
                    checked={role === UserRole.USER}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">Участник</div>
                      <div className="text-sm text-gray-500">
                        Ищу интересные события для посещения
                      </div>
                    </div>
                  </div>
                </label>

                <label
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-colors ${
                    role === UserRole.ORGANIZER
                      ? "border-purple-600 ring-2 ring-purple-600 bg-purple-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={UserRole.ORGANIZER}
                    checked={role === UserRole.ORGANIZER}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">
                        Организатор
                      </div>
                      <div className="text-sm text-gray-500">
                        Создаю и провожу мероприятия
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Администратор системы
                  </p>
                  <p className="text-sm text-blue-700">
                    Вы будете зарегистрированы как администратор и автоматически
                    активированы (первый пользователь системы).
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Регистрация...
              </div>
            ) : (
              "Зарегистрироваться"
            )}
          </button>

          <div className="text-center text-sm">
            <p className="text-gray-600">
              Уже есть аккаунт?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Войти
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
