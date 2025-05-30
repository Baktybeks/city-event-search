"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useUserFavorites,
  useRemoveFromFavorites,
} from "@/services/eventsService";
import { EventCard } from "@/components/events/EventCard";
import { Heart, Calendar, Search } from "lucide-react";
import { toast } from "react-toastify";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { data: favoriteEvents = [], isLoading } = useUserFavorites(
    user?.$id || ""
  );
  const removeFromFavoritesMutation = useRemoveFromFavorites();

  if (!user) {
    return <div>Загрузка...</div>;
  }

  const handleRemoveFromFavorites = async (eventId: string) => {
    try {
      await removeFromFavoritesMutation.mutateAsync({
        eventId,
        userId: user.$id,
      });
      toast.success("Удалено из избранного", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error("Ошибка при удалении из избранного", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">
            Избранные события
          </h1>
        </div>
        <p className="text-gray-600">
          Здесь собраны все мероприятия, которые вы добавили в избранное
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      ) : favoriteEvents.length > 0 ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Найдено: {favoriteEvents.length} событий
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteEvents.map((event) => (
              <EventCard
                key={event.$id}
                event={event}
                onFavoriteToggle={handleRemoveFromFavorites}
                isFavorite={true}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">💔</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            У вас пока нет избранных событий
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Добавляйте интересные мероприятия в избранное, нажимая на сердечко
            на карточках событий
          </p>
          <div className="space-y-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Search className="h-5 w-5" />
              Найти события
            </a>
            <div className="text-sm text-gray-500">или</div>
            <a
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Calendar className="h-5 w-5" />
              Просмотреть все события
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
