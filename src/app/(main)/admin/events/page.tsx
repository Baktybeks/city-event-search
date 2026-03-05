"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminEvents } from "@/services/eventsService";
import { AdminEventFilters } from "@/components/events/AdminEventFilters";
import { AdminEventStatusBadge } from "@/components/events/AdminEventStatusBadge";
import {
  EventFilters as EventFiltersType,
  UserRole,
  getCategoryLabel,
  getCategoryIcon,
  formatPrice,
} from "@/types";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Eye,
  Grid,
  List,
  BarChart3,
  Shield,
  Settings,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { CompactEventStatusPortal } from "@/components/events/CompactEventStatusPortal";
import { useAppTimezone } from "@/contexts/AppTimezoneContext";
import {
  formatInTimezone,
  formatTimeInTimezone,
} from "@/utils/dateUtils";

type ViewMode = "grid" | "table";

export default function AdminEventsPage() {
  const { user } = useAuth();
  const timezone = useAppTimezone();
  const [filters, setFilters] = useState<EventFiltersType>({});
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Запросы
  const {
    data: eventsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useAdminEvents(filters);

  // Проверка прав доступа
  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Доступ запрещен
          </h1>
          <p className="text-gray-600">
            У вас нет прав для доступа к управлению событиями
          </p>
        </div>
      </div>
    );
  }

  const events = eventsData?.pages.flatMap((page) => page.events) || [];
  const totalEvents = eventsData?.pages[0]?.total || 0;

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ""
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Управление событиями
            </h1>
            <p className="text-gray-600">
              Модерация и управление всеми событиями на платформе
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/events/analytics"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <BarChart3 className="h-4 w-4" />
              Аналитика
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <Settings className="h-4 w-4" />
              Админ панель
            </Link>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {totalEvents}
              </div>
              <div className="text-sm text-gray-600">Всего событий</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {events.filter((e) => e.status === "PUBLISHED").length}
              </div>
              <div className="text-sm text-gray-600">Опубликованных</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {events.filter((e) => e.status === "DRAFT").length}
              </div>
              <div className="text-sm text-gray-600">Ожидаемых</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {events.filter((e) => e.status === "CANCELLED").length}
              </div>
              <div className="text-sm text-gray-600">Отмененных</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Боковая панель с фильтрами */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <AdminEventFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClear={clearFilters}
            />
          </div>
        </div>

        {/* Список событий */}
        <div className="lg:col-span-3">
          {/* Панель управления */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Найдено: <span className="font-medium">{totalEvents}</span>{" "}
                  событий
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Очистить фильтры
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Переключатель вида */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1 rounded ${
                      viewMode === "table"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    title="Табличный вид"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1 rounded ${
                      viewMode === "grid"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    title="Сеточный вид"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* События */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <>
              {viewMode === "table" ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Событие
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Статус и управление
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Дата
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Организатор
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Просмотры
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ссылка
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {events.map((event) => (
                          <tr key={event.$id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">
                                  {getCategoryIcon(event.category)}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {event.title}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <span>
                                      {getCategoryLabel(event.category)}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {formatPrice(event.price, event.isFree)}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {/* Компактный статус с выпадающими действиями */}
                              <CompactEventStatusPortal event={event} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatInTimezone(
                                  event.startDate,
                                  timezone
                                ).split(", ")[0]}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatTimeInTimezone(event.startDate, timezone)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-900">
                                  {event.organizer}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {event.viewCount || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link
                                href={`/events/${event.$id}`}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                                target="_blank"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Открыть
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.map((event) => (
                    <div
                      key={event.$id}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">
                            {getCategoryIcon(event.category)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {event.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {getCategoryLabel(event.category)}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/events/${event.$id}`}
                          className="text-gray-400 hover:text-gray-600"
                          target="_blank"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </Link>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {formatInTimezone(event.startDate, timezone)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Eye className="h-4 w-4" />
                          {event.viewCount || 0} просмотров
                        </div>
                      </div>

                      <AdminEventStatusBadge event={event} variant="full" />
                    </div>
                  ))}
                </div>
              )}

              {hasNextPage && (
                <div className="text-center pt-8">
                  <button
                    onClick={() => fetchNextPage()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Загрузить еще события
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">📅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                События не найдены
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {hasActiveFilters
                  ? "Попробуйте изменить критерии поиска или очистить фильтры"
                  : "В системе пока нет событий"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Очистить фильтры
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
