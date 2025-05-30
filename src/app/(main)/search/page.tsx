"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { Search, Filter, X } from "lucide-react";
import { toast } from "react-toastify";

function SearchResults() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [filters, setFilters] = useState<EventFiltersType>({
    search: initialQuery,
  });

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

  // Обновляем поиск при изменении URL параметров
  useEffect(() => {
    const query = searchParams.get("q") || "";
    setFilters((prev) => ({ ...prev, search: query }));
  }, [searchParams]);

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
    setFilters({ search: initialQuery });
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== "search" && value !== undefined && value !== ""
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {initialQuery
            ? `Результаты поиска: "${initialQuery}"`
            : "Поиск событий"}
        </h1>
        <p className="text-gray-600">
          {isLoading
            ? "Поиск..."
            : `Найдено ${eventsData?.pages[0]?.total || 0} событий`}
        </p>
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

        {/* Результаты поиска */}
        <div className="lg:col-span-3">
          {/* Активные фильтры */}
          {hasActiveFilters && (
            <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">
                  Активные фильтры:
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Очистить все
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {filters.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {getCategoryIcon(filters.category)}{" "}
                    {getCategoryLabel(filters.category)}
                    <button
                      onClick={() =>
                        setFilters({ ...filters, category: undefined })
                      }
                      className="ml-1 hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {filters.isFree !== undefined && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    {filters.isFree ? "Бесплатные" : "Платные"}
                    <button
                      onClick={() =>
                        setFilters({ ...filters, isFree: undefined })
                      }
                      className="ml-1 hover:text-green-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {filters.location && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    📍 {filters.location}
                    <button
                      onClick={() =>
                        setFilters({ ...filters, location: undefined })
                      }
                      className="ml-1 hover:text-purple-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {filters.featured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                    ⭐ Рекомендуемые
                    <button
                      onClick={() =>
                        setFilters({ ...filters, featured: undefined })
                      }
                      className="ml-1 hover:text-orange-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Список событий */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          ) : events.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.$id}
                    event={event}
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
                {initialQuery
                  ? `По запросу "${initialQuery}" ничего не найдено`
                  : "События не найдены"}
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {initialQuery
                  ? "Попробуйте изменить поисковый запрос или настройки фильтров"
                  : "Попробуйте изменить критерии поиска или очистить фильтры"}
              </p>
              <div className="space-y-4">
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Сбросить фильтры
                </button>
                <div className="text-sm text-gray-500">или</div>
                <a
                  href="/events"
                  className="inline-block px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Посмотреть все события
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Предложения по улучшению поиска */}
      {initialQuery && events.length === 0 && !isLoading && (
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            Советы для улучшения поиска:
          </h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• Проверьте правильность написания ключевых слов</li>
            <li>• Попробуйте использовать более общие термины</li>
            <li>• Используйте фильтры для уточнения результатов</li>
            <li>• Попробуйте поискать по категории события</li>
          </ul>
        </div>
      )}
    </div>
  );
}

function SearchPageFallback() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchResults />
    </Suspense>
  );
}
