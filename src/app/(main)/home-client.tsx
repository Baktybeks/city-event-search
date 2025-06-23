"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import {
  useFeaturedEvents,
  useEvents,
  useEventsSearch,
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
import {
  Search,
  Calendar,
  ArrowRight,
  Star,
  MapPin,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";

// Хук для дебаунсинга
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function HomePageClient() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<EventFiltersType>({});
  const [searchInput, setSearchInput] = useState("");

  // Дебаунсированное значение поиска
  const debouncedSearch = useDebounce(searchInput, 500);

  // Обновляем фильтры когда дебаунсированное значение изменяется
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: debouncedSearch || undefined,
    }));
  }, [debouncedSearch]);

  // Определяем, используем ли клиентские фильтры
  const hasClientFilters = Boolean(filters.search || filters.location);

  // Запросы
  const { data: featuredEvents, isLoading: featuredLoading } =
    useFeaturedEvents();

  // Используем разные хуки в зависимости от типа фильтров
  const infiniteQuery = useEvents(hasClientFilters ? {} : filters);
  const searchQuery = useEventsSearch(hasClientFilters ? filters : undefined);

  // Выбираем нужный запрос
  const eventsQuery = hasClientFilters ? searchQuery : infiniteQuery;
  const eventsLoading = eventsQuery.isLoading;

  // Получаем данные в зависимости от типа запроса
  const events = hasClientFilters
    ? searchQuery.data?.events || [] // Простой query: { events: [...], total: number }
    : infiniteQuery.data?.pages?.flatMap((page) => page.events) || []; // Infinite query: { pages: [...] }

  const totalEvents = hasClientFilters
    ? searchQuery.data?.total || 0
    : infiniteQuery.data?.pages?.[0]?.total || 0;

  // Пагинация только для infinite запроса
  const fetchNextPage = hasClientFilters
    ? undefined
    : infiniteQuery.fetchNextPage;
  const hasNextPage = hasClientFilters ? false : infiniteQuery.hasNextPage;

  const { data: userFavorites } = useUserFavorites(user?.$id || "");

  // Мутации для избранного
  const addToFavoritesMutation = useAddToFavorites();
  const removeFromFavoritesMutation = useRemoveFromFavorites();

  const favoriteEventIds = new Set(
    userFavorites?.map((event) => event.$id) || []
  );

  // Дебаг информация
  useEffect(() => {
    console.log("🔍 Изменились фильтры поиска:", {
      searchInput,
      debouncedSearch,
      filters,
      hasClientFilters,
      searchQuery: {
        enabled: hasClientFilters,
        loading: searchQuery.isLoading,
        data: searchQuery.data ? "есть" : "нет",
      },
      infiniteQuery: {
        enabled: !hasClientFilters,
        loading: infiniteQuery.isLoading,
        pages: infiniteQuery.data?.pages?.length || 0,
      },
      eventsCount: events.length,
      totalEvents,
    });
  }, [
    searchInput,
    debouncedSearch,
    filters,
    hasClientFilters,
    searchQuery.isLoading,
    infiniteQuery.isLoading,
    events.length,
    totalEvents,
  ]);

  // Функция для принудительного обновления
  const forceRefreshSearch = () => {
    console.log("🔄 Принудительное обновление поиска");
    queryClient.invalidateQueries({ queryKey: ["events"] });
    if (hasClientFilters) {
      searchQuery.refetch();
    } else {
      infiniteQuery.refetch();
    }
  };

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
    setSearchInput("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      // Перенаправляем на страницу поиска с параметрами
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleCategoryClick = (category: EventCategory) => {
    setFilters({ ...filters, category });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ""
  );

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Найди свое событие
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Лучшие мероприятия твоего города в одном месте
            </p>

            {/* Быстрый поиск */}
            <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-6">
              <form onSubmit={handleSearchSubmit} className="relative mb-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Что ищем? Концерты, выставки, мастер-классы..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-12 pr-24 py-3 bg-white rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Найти
                </button>
              </form>

              {/* Быстрые категории */}
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  EventCategory.CONCERT,
                  EventCategory.EXHIBITION,
                  EventCategory.THEATER,
                  EventCategory.WORKSHOP,
                ].map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                      filters.category === category
                        ? "bg-white/30 text-white"
                        : "bg-white/20 hover:bg-white/30 text-white/90"
                    }`}
                  >
                    <span>{getCategoryIcon(category)}</span>
                    {getCategoryLabel(category)}
                  </button>
                ))}
              </div>

              {/* Улучшенный статус поиска */}
              {(searchInput || debouncedSearch) && (
                <div className="mt-4 text-center">
                  <div className="text-sm text-white/80">
                    {/* Показываем разные состояния */}
                    {!debouncedSearch && searchInput ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                        Ввод: "{searchInput}"...
                      </span>
                    ) : eventsLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Поиск "{debouncedSearch}"...
                      </span>
                    ) : debouncedSearch ? (
                      events.length === 0 ? (
                        <span className="text-red-200">
                          "{debouncedSearch}" - ничего не найдено
                          <button
                            onClick={() => setSearchInput("")}
                            className="ml-2 text-xs underline hover:no-underline"
                          >
                            Очистить
                          </button>
                        </span>
                      ) : (
                        <span className="text-green-200">
                          "{debouncedSearch}" - найдено {totalEvents} событий
                        </span>
                      )
                    ) : null}
                  </div>

                  {/* Дополнительная дебаг информация в development режиме */}
                  {process.env.NODE_ENV === "development" && (
                    <div className="mt-2 text-xs text-white/60 font-mono">
                      Debug: input="{searchInput}" | debounced="
                      {debouncedSearch}" | loading={String(eventsLoading)} |
                      results={events.length}
                    </div>
                  )}
                </div>
              )}

              {/* Кнопка принудительного обновления (только в development) */}
              {process.env.NODE_ENV === "development" && (
                <button
                  onClick={forceRefreshSearch}
                  className="mt-2 px-3 py-1 bg-white/20 text-white text-xs rounded hover:bg-white/30 transition-colors"
                >
                  🔄 Принудительно обновить
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Рекомендуемые события */}
        {!hasActiveFilters && featuredEvents && featuredEvents.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Star className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">Рекомендуем</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.slice(0, 3).map((event) => (
                <EventCard
                  key={event.$id}
                  event={event}
                  variant="featured"
                  onFavoriteToggle={handleFavoriteToggle}
                  isFavorite={favoriteEventIds.has(event.$id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Статистика */}
        {!hasActiveFilters && (
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-900">
                      {events.length}+
                    </div>
                    <div className="text-sm text-blue-700">
                      Актуальных событий
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3">
                  <MapPin className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-900">50+</div>
                    <div className="text-sm text-green-700">
                      Площадок города
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-purple-900">
                      1000+
                    </div>
                    <div className="text-sm text-purple-700">
                      Довольных участников
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Фильтры и список событий */}
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {hasActiveFilters ? "Результаты поиска" : "Все события"}
              </h2>
              <div className="text-sm text-gray-500">
                Найдено: {totalEvents}
              </div>
            </div>

            {eventsLoading ? (
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

                {!hasClientFilters && hasNextPage && (
                  <div className="text-center pt-8">
                    <button
                      onClick={() => fetchNextPage?.()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Загрузить еще события
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  События не найдены
                </h3>
                <p className="text-gray-600 mb-6">
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

        {/* CTA для организаторов */}
        {!user || user.role === "USER" ? (
          <section className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              Организуете мероприятия?
            </h2>
            <p className="text-xl mb-6 text-purple-100">
              Присоединяйтесь к нашей платформе и найдите свою аудиторию
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Стать организатором
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        ) : null}

        {/* ДЕБАГ: Показываем информацию о событиях (только в development) */}
        {process.env.NODE_ENV === "development" && (
          <section className="mt-12 bg-gray-100 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">🐛 Дебаг информация:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Поиск:</strong>
                <ul className="ml-4 mt-1">
                  <li>• Ввод: "{searchInput}"</li>
                  <li>• Debounced: "{debouncedSearch}"</li>
                  <li>• Фильтры: {JSON.stringify(filters, null, 2)}</li>
                  <li>• Клиентские фильтры: {String(hasClientFilters)}</li>
                </ul>
              </div>
              <div>
                <strong>События:</strong>
                <ul className="ml-4 mt-1">
                  <li>• Загрузка: {String(eventsLoading)}</li>
                  <li>• Найдено: {events.length}</li>
                  <li>• Всего: {totalEvents}</li>
                  <li>
                    • Тип запроса: {hasClientFilters ? "поиск" : "infinite"}
                  </li>
                  <li>• Search query enabled: {String(hasClientFilters)}</li>
                  <li>• Infinite query enabled: {String(!hasClientFilters)}</li>
                </ul>
              </div>
            </div>

            {events.length > 0 && (
              <div className="mt-4">
                <strong>Первые 3 события:</strong>
                <div className="mt-2 space-y-2">
                  {events.slice(0, 3).map((event) => (
                    <div
                      key={event.$id}
                      className="p-2 bg-white rounded text-xs"
                    >
                      <div>
                        <strong>ID:</strong> {event.$id}
                      </div>
                      <div>
                        <strong>Название:</strong> {event.title}
                      </div>
                      <div>
                        <strong>Статус:</strong> {event.status}
                      </div>
                      <div>
                        <strong>Категория:</strong> {event.category}
                      </div>
                      <div>
                        <strong>Место:</strong> {event.location}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
