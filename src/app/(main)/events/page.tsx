"use client";

import React, { useState } from "react";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import {
  useEvents,
  useAddToFavorites,
  useRemoveFromFavorites,
  useUserFavorites,
} from "@/services/eventsService";
import { useAuth } from "@/hooks/useAuth";
import {
  EventFilters as EventFiltersType,
  EventCategory,
  getCategoryLabel,
  getCategoryIcon,
} from "@/types";
import { Calendar, Filter, Grid, List, SortAsc } from "lucide-react";
import { toast } from "react-toastify";

type ViewMode = "grid" | "list";
type SortBy = "date" | "popularity" | "title" | "price";

export default function EventsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<EventFiltersType>({});
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("date");

  // Запросы
  const {
    data: eventsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useEvents(filters);
  const { data: userFavorites } = useUserFavorites(user?.$id || "");

  // Мутации для избранного
  const addToFavoritesMutation = useAddToFavorites();
  const removeFromFavoritesMutation = useRemoveFromFavorites();

  const events = eventsData?.pages.flatMap((page) => page.events) || [];
  const favoriteEventIds = new Set(
    userFavorites?.map((event) => event.$id) || []
  );

  const handleFavoriteToggle = async (eventId: string) => {
    if (!user) {
      toast.info("Войдите в систему, чтобы добавлять события в избранное", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      if (favoriteEventIds.has(eventId)) {
        await removeFromFavoritesMutation.mutateAsync({
          eventId,
          userId: user.$id,
        });
        toast.success("Удалено из избранного", {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        await addToFavoritesMutation.mutateAsync({ eventId, userId: user.$id });
        toast.success("Добавлено в избранное", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.error("Ошибка при обновлении избранного", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const sortedEvents = [...events].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return (
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      case "popularity":
        return (b.viewCount || 0) - (a.viewCount || 0);
      case "title":
        return a.title.localeCompare(b.title);
      case "price":
        if (a.isFree && !b.isFree) return -1;
        if (!a.isFree && b.isFree) return 1;
        return (a.price || 0) - (b.price || 0);
      default:
        return 0;
    }
  });

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ""
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Все события</h1>
        <p className="text-gray-600">Найдите идеальное мероприятие для себя</p>
      </div>

      {/* Быстрые категории */}
      <div className="mb-8 bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Популярные категории
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {Object.values(EventCategory).map((category) => (
            <button
              key={category}
              onClick={() =>
                setFilters({
                  ...filters,
                  category:
                    filters.category === category ? undefined : category,
                })
              }
              className={`p-3 rounded-lg border transition-colors text-center ${
                filters.category === category
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              <div className="text-2xl mb-1">{getCategoryIcon(category)}</div>
              <div className="text-xs font-medium">
                {getCategoryLabel(category)}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Боковая панель с фильтрами */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <EventFilters
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
                  Найдено:{" "}
                  <span className="font-medium">
                    {eventsData?.pages[0]?.total || 0}
                  </span>{" "}
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
                {/* Сортировка */}
                <div className="flex items-center gap-2">
                  <SortAsc className="h-4 w-4 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date">По дате</option>
                    <option value="popularity">По популярности</option>
                    <option value="title">По названию</option>
                    <option value="price">По цене</option>
                  </select>
                </div>

                {/* Переключатель вида */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1 rounded ${
                      viewMode === "grid"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1 rounded ${
                      viewMode === "list"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* События */}
          {isLoading ? (
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1"
              }`}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
                >
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : sortedEvents.length > 0 ? (
            <div className="space-y-6">
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {sortedEvents.map((event) => (
                  <EventCard
                    key={event.$id}
                    event={event}
                    variant={viewMode === "list" ? "compact" : "default"}
                    onFavoriteToggle={handleFavoriteToggle}
                    isFavorite={favoriteEventIds.has(event.$id)}
                  />
                ))}
              </div>

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
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🔍</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                События не найдены
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {hasActiveFilters
                  ? "Попробуйте изменить критерии поиска или очистить фильтры"
                  : "В данный момент нет доступных событий"}
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
