"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useOrganizerEvents } from "@/services/eventsService";
import { EventCard } from "@/components/events/EventCard";
import {
  Plus,
  Calendar,
  Eye,
  Users,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
} from "lucide-react";
import { EventStatus, getStatusLabel } from "@/types";

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const { data: events = [], isLoading } = useOrganizerEvents(user?.$id || "");

  if (!user) {
    return <div>Загрузка...</div>;
  }

  const publishedEvents = events.filter(
    (event) => event.status === EventStatus.PUBLISHED
  );
  const draftEvents = events.filter(
    (event) => event.status === EventStatus.DRAFT
  );
  const totalViews = events.reduce(
    (sum, event) => sum + (event.viewCount || 0),
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Панель организатора
        </h1>
        <p className="text-gray-600">
          Управляйте своими мероприятиями и отслеживайте их эффективность
        </p>
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
                {events.length}
              </div>
              <div className="text-sm text-gray-600">Всего событий</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {publishedEvents.length}
              </div>
              <div className="text-sm text-gray-600">Опубликовано</div>
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
                {draftEvents.length}
              </div>
              <div className="text-sm text-gray-600">Черновики</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {totalViews}
              </div>
              <div className="text-sm text-gray-600">Просмотров</div>
            </div>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/organizer/create"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 hover:from-blue-700 hover:to-purple-700 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <Plus className="h-6 w-6" />
            <span className="text-lg font-semibold">Создать событие</span>
          </div>
          <p className="text-blue-100 text-sm">
            Добавьте новое мероприятие и привлеките аудиторию
          </p>
        </Link>

        <Link
          href="/organizer/analytics"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-6 w-6 text-gray-600" />
            <span className="text-lg font-semibold text-gray-900">
              Аналитика
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Изучите статистику и эффективность событий
          </p>
        </Link>

        <Link
          href="/organizer/settings"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-6 w-6 text-gray-600" />
            <span className="text-lg font-semibold text-gray-900">Профиль</span>
          </div>
          <p className="text-gray-600 text-sm">
            Настройте информацию о себе как организаторе
          </p>
        </Link>
      </div>

      {/* Список событий */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Мои события</h2>
            <Link
              href="/organizer/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Создать событие
            </Link>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-video rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <>
              {/* Черновики */}
              {draftEvents.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    Черновики ({draftEvents.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {draftEvents.map((event) => (
                      <div key={event.$id} className="relative">
                        <EventCard event={event} variant="compact" />
                        <div className="absolute top-2 right-2">
                          <Link
                            href={`/organizer/events/${event.$id}/edit`}
                            className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
                          >
                            <Edit className="h-4 w-4 text-gray-600" />
                          </Link>
                        </div>
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Черновик
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Опубликованные события */}
              {publishedEvents.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Опубликованные события ({publishedEvents.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publishedEvents.map((event) => (
                      <div key={event.$id} className="relative">
                        <EventCard event={event} variant="compact" />
                        <div className="absolute top-2 right-2">
                          <Link
                            href={`/organizer/events/${event.$id}/edit`}
                            className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
                          >
                            <Edit className="h-4 w-4 text-gray-600" />
                          </Link>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">
                                👁️ {event.viewCount || 0}
                              </span>
                              <span className="text-green-600 font-medium">
                                {getStatusLabel(event.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                У вас пока нет событий
              </h3>
              <p className="text-gray-600 mb-6">
                Создайте свое первое мероприятие и начните привлекать участников
              </p>
              <Link
                href="/organizer/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="h-5 w-5" />
                Создать первое событие
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
