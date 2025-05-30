"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOrganizerEvents } from "@/services/eventsService";
import { EventCard } from "@/components/events/EventCard";
import {
  BarChart3,
  Eye,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { EventStatus, getCategoryLabel } from "@/types";

export default function OrganizerAnalyticsPage() {
  const { user } = useAuth();
  const { data: events = [], isLoading } = useOrganizerEvents(user?.$id || "");

  if (!user) {
    return <div>Загрузка...</div>;
  }

  // Вычисляем аналитику
  const totalEvents = events.length;
  const publishedEvents = events.filter(
    (event) => event.status === EventStatus.PUBLISHED
  );
  const totalViews = events.reduce(
    (sum, event) => sum + (event.viewCount || 0),
    0
  );
  const averageViews =
    totalEvents > 0 ? Math.round(totalViews / totalEvents) : 0;

  // Топ событий по просмотрам
  const topEventsByViews = [...events]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5);

  // События по категориям
  const eventsByCategory = events.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // События по статусам
  const eventsByStatus = events.reduce((acc, event) => {
    acc[event.status] = (acc[event.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Аналитика событий
        </h1>
        <p className="text-gray-600">
          Отслеживайте эффективность ваших мероприятий
        </p>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Основные метрики */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalEvents}
                  </div>
                  <div className="text-sm text-gray-600">Всего событий</div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {publishedEvents.length}
                  </div>
                  <div className="text-sm text-gray-600">Опубликовано</div>
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
                    {totalViews}
                  </div>
                  <div className="text-sm text-gray-600">Всего просмотров</div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {averageViews}
                  </div>
                  <div className="text-sm text-gray-600">Средние просмотры</div>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Топ событий по просмотрам */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
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

            {/* События по категориям */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                События по категориям
              </h2>

              {Object.keys(eventsByCategory).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(eventsByCategory)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, count]) => (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700">
                          {getCategoryLabel(category as any)}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Нет событий для анализа</p>
                </div>
              )}
            </div>

            {/* События по статусам */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Статус событий
              </h2>

              {Object.keys(eventsByStatus).length > 0 ? (
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
                          return "Черновики";
                        case EventStatus.CANCELLED:
                          return "Отменено";
                        case EventStatus.COMPLETED:
                          return "Завершено";
                        default:
                          return status;
                      }
                    };

                    return (
                      <div
                        key={status}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700">
                          {getStatusLabel(status)}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getStatusColor(
                                status
                              )}`}
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Нет данных о статусах</p>
                </div>
              )}
            </div>

            {/* Рекомендации */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Рекомендации
              </h2>

              <div className="space-y-3">
                {totalEvents === 0 ? (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <ArrowUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Создайте первое событие
                      </p>
                      <p className="text-xs text-blue-700">
                        Начните с создания вашего первого мероприятия
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {averageViews < 10 && (
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900">
                            Повысьте видимость
                          </p>
                          <p className="text-xs text-yellow-700">
                            Добавьте яркие изображения и детальные описания
                          </p>
                        </div>
                      </div>
                    )}

                    {eventsByStatus[EventStatus.DRAFT] > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-900">
                            Опубликуйте черновики
                          </p>
                          <p className="text-xs text-orange-700">
                            У вас есть {eventsByStatus[EventStatus.DRAFT]}{" "}
                            неопубликованных событий
                          </p>
                        </div>
                      </div>
                    )}

                    {publishedEvents.length > 0 && averageViews > 50 && (
                      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-900">
                            Отличная работа!
                          </p>
                          <p className="text-xs text-green-700">
                            Ваши события получают хорошие просмотры
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
