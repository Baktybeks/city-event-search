"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEvents, useUserFavorites } from "@/services/eventsService";
import { EventCard } from "@/components/events/EventCard";
import { Calendar, Clock, CheckCircle, X, Ticket, Heart } from "lucide-react";
import { EventStatus } from "@/types";

export default function MyEventsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "past" | "registered" | "favorites"
  >("upcoming");

  // Получаем события пользователя и избранное
  const { data: eventsData, isLoading } = useEvents({});
  const { data: favoriteEvents = [] } = useUserFavorites(user?.$id || "");

  if (!user) {
    return <div>Загрузка...</div>;
  }

  const events = eventsData?.pages.flatMap((page) => page.events) || [];

  // Фильтрация событий по категориям
  const now = new Date();
  const upcomingEvents = events.filter(
    (event) =>
      new Date(event.startDate) > now && event.status === EventStatus.PUBLISHED
  );
  const pastEvents = events.filter((event) => new Date(event.startDate) <= now);

  // Заглушка для зарегистрированных событий (в реальном приложении здесь был бы отдельный запрос)
  const registeredEvents = events
    .filter(
      (event) => Math.random() > 0.7 // Случайная имитация регистрации
    )
    .slice(0, 3);

  const getTabContent = () => {
    switch (activeTab) {
      case "upcoming":
        return {
          title: "Предстоящие события",
          events: upcomingEvents,
          emptyMessage: "Нет предстоящих событий",
          emptyDescription: "Новые интересные мероприятия появятся здесь",
          emptyIcon: "📅",
        };
      case "past":
        return {
          title: "Прошедшие события",
          events: pastEvents,
          emptyMessage: "Нет прошедших событий",
          emptyDescription: "События, которые вы посещали, появятся здесь",
          emptyIcon: "⏰",
        };
      case "registered":
        return {
          title: "Мои регистрации",
          events: registeredEvents,
          emptyMessage: "Нет регистраций",
          emptyDescription:
            "События, на которые вы зарегистрировались, появятся здесь",
          emptyIcon: "🎫",
        };
      case "favorites":
        return {
          title: "Избранные события",
          events: favoriteEvents,
          emptyMessage: "Нет избранных событий",
          emptyDescription: "Добавляйте интересные события в избранное",
          emptyIcon: "💝",
        };
      default:
        return {
          title: "События",
          events: [],
          emptyMessage: "Нет событий",
          emptyDescription: "",
          emptyIcon: "📅",
        };
    }
  };

  const tabContent = getTabContent();

  const tabs = [
    {
      id: "upcoming" as const,
      label: "Предстоящие",
      icon: Calendar,
      count: upcomingEvents.length,
      color: "blue",
    },
    {
      id: "past" as const,
      label: "Прошедшие",
      icon: Clock,
      count: pastEvents.length,
      color: "gray",
    },
    {
      id: "registered" as const,
      label: "Регистрации",
      icon: Ticket,
      count: registeredEvents.length,
      color: "green",
    },
    {
      id: "favorites" as const,
      label: "Избранное",
      icon: Heart,
      count: favoriteEvents.length,
      color: "red",
    },
  ];

  const getTabColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive
        ? "border-blue-500 text-blue-600"
        : "border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300",
      gray: isActive
        ? "border-gray-500 text-gray-600"
        : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300",
      green: isActive
        ? "border-green-500 text-green-600"
        : "border-transparent text-gray-500 hover:text-green-600 hover:border-green-300",
      red: isActive
        ? "border-red-500 text-red-600"
        : "border-transparent text-gray-500 hover:text-red-600 hover:border-red-300",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getCounterColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive
        ? "bg-blue-100 text-blue-600"
        : "bg-gray-100 text-gray-600",
      gray: isActive
        ? "bg-gray-100 text-gray-600"
        : "bg-gray-100 text-gray-600",
      green: isActive
        ? "bg-green-100 text-green-600"
        : "bg-gray-100 text-gray-600",
      red: isActive ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои события</h1>
        <p className="text-gray-600">
          Управляйте вашими событиями и регистрациями
        </p>
      </div>

      {/* Навигационные вкладки */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${getTabColorClasses(
                  tab.color,
                  activeTab === tab.id
                )}`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium transition-colors ${getCounterColorClasses(
                      tab.color,
                      activeTab === tab.id
                    )}`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {tabContent.title}
            </h2>
            <div className="text-sm text-gray-500">
              {tabContent.events.length} событий
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-lg p-4 animate-pulse"
                >
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : tabContent.events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tabContent.events.map((event) => (
                <div key={event.$id} className="relative group">
                  <EventCard
                    event={event}
                    variant="compact"
                    className="h-full"
                  />

                  {/* Дополнительные индикаторы */}
                  {activeTab === "registered" && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full shadow-sm">
                        <CheckCircle className="h-3 w-3" />
                        Зарегистрирован
                      </span>
                    </div>
                  )}

                  {activeTab === "past" && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full shadow-sm">
                        <Clock className="h-3 w-3" />
                        Завершено
                      </span>
                    </div>
                  )}

                  {activeTab === "favorites" && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full shadow-sm">
                        <Heart className="h-3 w-3 fill-current" />
                        Избранное
                      </span>
                    </div>
                  )}

                  {/* Hover эффект */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-black/0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg pointer-events-none" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">{tabContent.emptyIcon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {tabContent.emptyMessage}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {tabContent.emptyDescription}
              </p>

              <div className="space-y-4">
                <a
                  href="/events"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  <Calendar className="h-5 w-5" />
                  Найти события
                </a>

                {activeTab === "favorites" && (
                  <div className="text-sm text-gray-500 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Heart className="h-4 w-4 inline mr-1" />
                    Нажимайте на ❤️ на карточках событий, чтобы добавить их в
                    избранное
                  </div>
                )}

                {activeTab === "registered" && (
                  <div className="text-sm text-gray-500 mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <Ticket className="h-4 w-4 inline mr-1" />
                    Регистрируйтесь на события, чтобы они появились здесь
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Статистика пользователя */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {upcomingEvents.length}
                </div>
                <div className="text-sm text-gray-600">Предстоящих</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Ticket className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {registeredEvents.length}
                </div>
                <div className="text-sm text-gray-600">Регистраций</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {favoriteEvents.length}
                </div>
                <div className="text-sm text-gray-600">В избранном</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {pastEvents.length}
                </div>
                <div className="text-sm text-gray-600">Посещено</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Рекомендации */}
      {!isLoading &&
        tabContent.events.length === 0 &&
        activeTab === "upcoming" && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              💡 Рекомендации для вас
            </h3>
            <p className="text-gray-600 mb-4">
              Начните изучать события в вашем городе:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/events?category=CONCERT"
                className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
              >
                <span className="text-2xl">🎵</span>
                <span className="text-sm font-medium text-gray-700">
                  Концерты
                </span>
              </a>
              <a
                href="/events?category=EXHIBITION"
                className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
              >
                <span className="text-2xl">🎨</span>
                <span className="text-sm font-medium text-gray-700">
                  Выставки
                </span>
              </a>
              <a
                href="/events?category=WORKSHOP"
                className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
              >
                <span className="text-2xl">🛠️</span>
                <span className="text-sm font-medium text-gray-700">
                  Мастер-классы
                </span>
              </a>
            </div>
          </div>
        )}
    </div>
  );
}
