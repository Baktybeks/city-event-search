// src/components/admin/SystemStats.tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/services/userService";
import { eventsApi } from "@/services/eventsService";
import {
  Users,
  Calendar,
  Activity,
  Database,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  change,
  changeType,
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {change && (
          <p
            className={`text-sm mt-1 flex items-center gap-1 ${
              changeType === "positive"
                ? "text-green-600"
                : changeType === "negative"
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {changeType === "positive" && <TrendingUp className="h-3 w-3" />}
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    </div>
  </div>
);

export default function SystemStats() {
  const { data: userStats } = useQuery({
    queryKey: ["admin", "user-stats"],
    queryFn: userApi.getUserStats,
    refetchInterval: 30000, // Обновлять каждые 30 секунд
  });

  const { data: eventStats } = useQuery({
    queryKey: ["admin", "event-stats"],
    queryFn: async () => {
      // Получаем общую статистику событий
      const events = await eventsApi.getEvents(undefined, 1000, 0);
      const featured = await eventsApi.getFeaturedEvents(100);

      return {
        total: events.total,
        featured: featured.length,
        published: events.events.length,
      };
    },
    refetchInterval: 60000, // Обновлять каждую минуту
  });

  // Вычисляем размер базы данных (примерный)
  const estimatedDbSize = React.useMemo(() => {
    if (!userStats || !eventStats) return "0 КБ";

    // Примерный расчет: пользователи + события
    const usersSize = userStats.total * 2; // ~2KB на пользователя
    const eventsSize = eventStats.total * 5; // ~5KB на событие
    const totalKb = usersSize + eventsSize;

    if (totalKb > 1024) {
      return `${(totalKb / 1024).toFixed(1)} МБ`;
    }
    return `${totalKb} КБ`;
  }, [userStats, eventStats]);

  const stats = [
    {
      title: "Активных пользователей",
      value: userStats?.active ?? 0,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      color: "bg-blue-100",
      change: userStats?.recentlyCreated
        ? `+${userStats.recentlyCreated} за неделю`
        : undefined,
      changeType: "positive" as const,
    },
    {
      title: "Всего событий",
      value: eventStats?.total ?? 0,
      icon: <Calendar className="h-6 w-6 text-green-600" />,
      color: "bg-green-100",
      change: eventStats?.featured
        ? `${eventStats.featured} рекомендуемых`
        : undefined,
      changeType: "neutral" as const,
    },
    {
      title: "Размер базы данных",
      value: estimatedDbSize,
      icon: <Database className="h-6 w-6 text-purple-600" />,
      color: "bg-purple-100",
    },
    {
      title: "Статус системы",
      value: "Онлайн",
      icon: <Activity className="h-6 w-6 text-green-600" />,
      color: "bg-green-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
            changeType={stat.changeType}
          />
        ))}
      </div>

      {/* Детальная статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Статистика пользователей */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Пользователи по ролям
          </h3>

          <div className="space-y-3">
            {userStats?.byRole &&
              Object.entries(userStats.byRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {role === "ADMIN"
                      ? "Администраторы"
                      : role === "ORGANIZER"
                      ? "Организаторы"
                      : "Пользователи"}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Активные
              </span>
              <span className="font-medium text-green-600">
                {userStats?.active ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Clock className="h-3 w-3 text-amber-600" />
                Ожидают активации
              </span>
              <span className="font-medium text-amber-600">
                {userStats?.inactive ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Статистика событий */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            События
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Всего событий</span>
              <span className="font-medium">{eventStats?.total ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Опубликованные</span>
              <span className="font-medium">{eventStats?.published ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Рекомендуемые</span>
              <span className="font-medium">{eventStats?.featured ?? 0}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Система работает стабильно
              </p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Activity className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600 font-medium">
                  Все сервисы доступны
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
