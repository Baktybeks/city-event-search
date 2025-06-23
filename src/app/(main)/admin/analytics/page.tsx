// src/app/(main)/admin/analytics/page.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAllUsers } from "@/services/authService";
import { useEvents } from "@/services/eventsService";
import {
  UserRole,
  EventCategory,
  EventStatus,
  getCategoryLabel,
  getRoleLabel,
} from "@/types";
import {
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  Eye,
  Shield,
  PieChart,
  Activity,
  Clock,
  Star,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );

  const { data: allUsers = [] } = useAllUsers();
  const { data: eventsData } = useEvents({});

  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Доступ запрещен
          </h1>
          <p className="text-gray-600">
            У вас нет прав для доступа к аналитике
          </p>
        </div>
      </div>
    );
  }

  const allEvents = eventsData?.pages.flatMap((page) => page.events) || [];

  // Вычисляем общую статистику
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter((u) => u.isActive).length;
  const totalEvents = allEvents.length;
  const publishedEvents = allEvents.filter(
    (e) => e.status === EventStatus.PUBLISHED
  ).length;
  const totalViews = allEvents.reduce(
    (sum, event) => sum + (event.viewCount || 0),
    0
  );
  const averageViews =
    totalEvents > 0 ? Math.round(totalViews / totalEvents) : 0;

  // Статистика по ролям пользователей
  const usersByRole = allUsers.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<UserRole, number>);

  // Статистика по категориям событий
  const eventsByCategory = allEvents.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {} as Record<EventCategory, number>);

  // Статистика по статусам событий
  const eventsByStatus = allEvents.reduce((acc, event) => {
    acc[event.status] = (acc[event.status] || 0) + 1;
    return acc;
  }, {} as Record<EventStatus, number>);

  // Топ событий по просмотрам
  const topEventsByViews = [...allEvents]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5);

  // Недавние регистрации (за последние 7 дней)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentUsers = allUsers.filter(
    (user) => new Date(user.$createdAt) > weekAgo
  ).length;

  // Недавние события
  const recentEvents = allEvents.filter(
    (event) => new Date(event.$createdAt) > weekAgo
  ).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Аналитика платформы
            </h1>
            <p className="text-gray-600">
              Статистика и метрики использования платформы
            </p>
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Последние 7 дней</option>
            <option value="30d">Последние 30 дней</option>
            <option value="90d">Последние 90 дней</option>
            <option value="1y">Последний год</option>
          </select>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {totalUsers}
              </div>
              <div className="text-sm text-gray-600">Всего пользователей</div>
              <div className="text-xs text-green-600 mt-1">
                +{recentUsers} за неделю
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {activeUsers}
              </div>
              <div className="text-sm text-gray-600">
                Активных пользователей
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((activeUsers / totalUsers) * 100)}% от общего числа
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {totalEvents}
              </div>
              <div className="text-sm text-gray-600">Всего событий</div>
              <div className="text-xs text-green-600 mt-1">
                +{recentEvents} за неделю
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {totalViews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Всего просмотров</div>
              <div className="text-xs text-gray-500 mt-1">
                ~{averageViews} в среднем на событие
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Детальная аналитика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Пользователи по ролям */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Распределение пользователей по ролям
          </h2>

          <div className="space-y-4">
            {Object.entries(usersByRole).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {getRoleLabel(role as UserRole)}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(count / totalUsers) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* События по категориям */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            События по категориям
          </h2>

          <div className="space-y-3">
            {Object.entries(eventsByCategory)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([category, count]) => (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700">
                    {getCategoryLabel(category as EventCategory)}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${(count / totalEvents) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Топ событий и статистика статусов */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Топ событий по просмотрам */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5" />
            Топ событий по просмотрам
          </h2>

          {topEventsByViews.length > 0 ? (
            <div className="space-y-3">
              {topEventsByViews.map((event, index) => (
                <div
                  key={event.$id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getCategoryLabel(event.category)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Eye className="h-4 w-4" />
                    {event.viewCount || 0}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Eye className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Нет данных о просмотрах</p>
            </div>
          )}
        </div>

        {/* Статусы событий */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Статусы событий
          </h2>

          <div className="space-y-3">
            {Object.entries(eventsByStatus).map(([status, count]) => {
              const getStatusColor = (status: string) => {
                switch (status) {
                  case EventStatus.PUBLISHED:
                    return "bg-green-600";
                  case EventStatus.DRAFT:
                    return "bg-yellow-600";
                  case EventStatus.CANCELLED:
                    return "bg-red-600";
                  case EventStatus.COMPLETED:
                    return "bg-blue-600";
                  default:
                    return "bg-gray-600";
                }
              };

              const getStatusLabel = (status: string) => {
                switch (status) {
                  case EventStatus.PUBLISHED:
                    return "Опубликовано";
                  case EventStatus.DRAFT:
                    return "Ожидаемые";
                  case EventStatus.CANCELLED:
                    return "Отменено";
                  case EventStatus.COMPLETED:
                    return "Завершено";
                  default:
                    return status;
                }
              };

              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {getStatusLabel(status)}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getStatusColor(status)}`}
                        style={{
                          width: `${(count / totalEvents) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Дополнительные метрики */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Активность за последнее время
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {recentUsers}
            </div>
            <div className="text-sm text-gray-600">
              Новых пользователей за неделю
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {recentEvents}
            </div>
            <div className="text-sm text-gray-600">Новых событий за неделю</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((publishedEvents / totalEvents) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Опубликованных событий</div>
          </div>
        </div>
      </div>
    </div>
  );
}
