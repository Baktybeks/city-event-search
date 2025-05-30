"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  useAllUsers,
  usePendingUsers,
  useActivateUser,
  useDeactivateUser,
} from "@/services/authService";
import { useEvents } from "@/services/eventsService";
import { getRoleLabel, getRoleColor, UserRole } from "@/types";
import {
  Users,
  Calendar,
  TrendingUp,
  UserCheck,
  UserX,
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
} from "lucide-react";
import { toast } from "react-toastify";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: allUsers = [], isLoading: usersLoading } = useAllUsers();
  const { data: pendingUsers = [], isLoading: pendingLoading } =
    usePendingUsers();
  const { data: eventsData } = useEvents({});
  const activateUserMutation = useActivateUser();
  const deactivateUserMutation = useDeactivateUser();

  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Доступ запрещен
          </h1>
          <p className="text-gray-600">
            У вас нет прав для доступа к административной панели
          </p>
        </div>
      </div>
    );
  }

  const events = eventsData?.pages.flatMap((page) => page.events) || [];
  const activeUsers = allUsers.filter((u) => u.isActive);
  const totalUsers = allUsers.length;
  const organizers = allUsers.filter((u) => u.role === UserRole.ORGANIZER);
  const regularUsers = allUsers.filter((u) => u.role === UserRole.USER);

  const handleActivateUser = async (userId: string) => {
    try {
      await activateUserMutation.mutateAsync(userId);
      toast.success("Пользователь активирован", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error("Ошибка при активации пользователя", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      await deactivateUserMutation.mutateAsync(userId);
      toast.success("Пользователь деактивирован", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error("Ошибка при деактивации пользователя", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Административная панель
        </h1>
        <p className="text-gray-600">Управление платформой и пользователями</p>
      </div>

      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {totalUsers}
              </div>
              <div className="text-sm text-gray-600">Всего пользователей</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {activeUsers.length}
              </div>
              <div className="text-sm text-gray-600">
                Активных пользователей
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {events.length}
              </div>
              <div className="text-sm text-gray-600">Всего событий</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {pendingUsers.length}
              </div>
              <div className="text-sm text-gray-600">Ожидают активации</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ожидающие активации */}
      {pendingUsers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                Пользователи, ожидающие активации ({pendingUsers.length})
              </h2>
            </div>
          </div>

          <div className="p-6">
            {pendingLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg animate-pulse"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="w-20 h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((pendingUser) => (
                  <div
                    key={pendingUser.$id}
                    className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold">
                        {pendingUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {pendingUser.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {pendingUser.email}
                        </p>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                            pendingUser.role
                          )}`}
                        >
                          {getRoleLabel(pendingUser.role)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleActivateUser(pendingUser.$id)}
                      disabled={activateUserMutation.isPending}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {activateUserMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Активировать
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Быстрые действия */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/users"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">
              Управление пользователями
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Просмотр, активация и управление всеми пользователями платформы
          </p>
        </Link>

        <Link
          href="/admin/events"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-6 w-6 text-purple-600" />
            <span className="text-lg font-semibold text-gray-900">
              Все события
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Модерация и управление всеми событиями на платформе
          </p>
        </Link>

        <Link
          href="/admin/analytics"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-6 w-6 text-green-600" />
            <span className="text-lg font-semibold text-gray-900">
              Аналитика
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Статистика использования платформы и популярности событий
          </p>
        </Link>
      </div>

      {/* Обзор пользователей по ролям */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Распределение пользователей
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Организаторы</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${
                        totalUsers > 0
                          ? (organizers.length / totalUsers) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-right">
                  {organizers.length}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Пользователи</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        totalUsers > 0
                          ? (regularUsers.length / totalUsers) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-right">
                  {regularUsers.length}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Администраторы</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{
                      width: `${totalUsers > 0 ? (1 / totalUsers) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-right">
                  1
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Последние регистрации
          </h2>

          {usersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {allUsers
                .sort(
                  (a, b) =>
                    new Date(b.$createdAt).getTime() -
                    new Date(a.$createdAt).getTime()
                )
                .slice(0, 5)
                .map((recentUser) => (
                  <div
                    key={recentUser.$id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                      {recentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {recentUser.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getRoleLabel(recentUser.role)} •{" "}
                        {new Date(recentUser.$createdAt).toLocaleDateString(
                          "ru-RU"
                        )}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {recentUser.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
