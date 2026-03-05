"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import {
  useEvent,
  useRegisterForEvent,
  useUnregisterFromEvent,
  useAddToFavorites,
  useRemoveFromFavorites,
  eventsApi,
} from "@/services/eventsService";
import { useAuth } from "@/hooks/useAuth";
import {
  Calendar,
  MapPin,
  User,
  Heart,
  Share2,
  ExternalLink,
  Users,
  Clock,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  getCategoryIcon,
  getCategoryLabel,
  formatPrice,
  isEventToday,
  isEventUpcoming,
  isEventPast,
} from "@/types";
import { toast } from "react-toastify";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = params.id as string;

  const { data: event, isLoading, error } = useEvent(eventId, user?.$id);
  const registerMutation = useRegisterForEvent();
  const unregisterMutation = useUnregisterFromEvent();
  const addToFavoritesMutation = useAddToFavorites();
  const removeFromFavoritesMutation = useRemoveFromFavorites();

  // Регистрируем просмотр события
  useEffect(() => {
    if (eventId) {
      eventsApi.recordEventView(eventId, user?.$id);
    }
  }, [eventId, user?.$id]);

  const handleRegister = async () => {
    if (!user) {
      toast.info("Войдите в систему для регистрации на событие", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      if (event?.isUserRegistered) {
        await unregisterMutation.mutateAsync({ eventId, userId: user.$id });
        toast.success("Регистрация отменена", {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        await registerMutation.mutateAsync({ eventId, userId: user.$id });
        toast.success("Вы зарегистрированы на событие!", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.error("Ошибка при регистрации", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast.info("Войдите в систему для добавления в избранное", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      if (event?.isUserFavorite) {
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Sharing cancelled");
      }
    } else {
      // Fallback - копируем ссылку в буфер обмена
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Ссылка скопирована в буфер обмена", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleExternalLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-64 bg-gray-200"></div>
              <div className="p-6 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Событие не найдено
            </h1>
            <p className="text-gray-600 mb-6">
              Возможно, событие было удалено или ссылка неверная
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Вернуться назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const isPast = isEventPast(event.endDate || event.startDate, event.startDate);
  const isToday = isEventToday(event.startDate);
  const isUpcoming = isEventUpcoming(event.startDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Навигация назад */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к списку событий
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Изображение события */}
              {event.imageUrl && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                {/* Заголовок и категория */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">
                      {getCategoryIcon(event.category)}
                    </span>
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {getCategoryLabel(event.category)}
                    </span>
                  </div>

                  {event.featured && (
                    <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                      ⭐ Рекомендуем
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {event.title}
                </h1>

                {/* Статус события */}
                {isPast && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg mb-4 w-fit">
                    <Clock className="h-4 w-4" />
                    Событие завершено
                  </div>
                )}

                {isToday && (
                  <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-100 px-3 py-2 rounded-lg mb-4 w-fit">
                    <Clock className="h-4 w-4" />
                    Сегодня
                  </div>
                )}

                {/* Описание */}
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* Теги */}
                {event.tags && event.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Теги:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Информация об организаторе */}
                {event.organizerInfo && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Организатор
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {event.organizerInfo.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {event.organizerInfo.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {event.organizerInfo.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Боковая панель */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Карточка с основной информацией */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Информация о событии
                </h2>

                <div className="space-y-4">
                  {/* Дата и время */}
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {format(eventDate, "d MMMM yyyy", { locale: ru })}
                      </div>
                      <div className="text-sm text-gray-600">
                        {format(eventDate, "HH:mm", { locale: ru })}
                        {endDate &&
                          ` - ${format(endDate, "HH:mm", { locale: ru })}`}
                      </div>
                    </div>
                  </div>

                  {/* Место проведения */}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {event.location}
                      </div>
                      <div className="text-sm text-gray-600">
                        {event.address}
                      </div>
                    </div>
                  </div>

                  {/* Цена */}
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div className="font-semibold text-lg text-blue-600">
                      {formatPrice(event.price, event.isFree)}
                    </div>
                  </div>

                  {/* Участники */}
                  {(event.registrationCount !== undefined ||
                    event.maxAttendees) && (
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div className="text-sm text-gray-600">
                        {event.registrationCount !== undefined && (
                          <span>
                            Зарегистрировано: {event.registrationCount}
                          </span>
                        )}
                        {event.maxAttendees && (
                          <span>
                            {event.registrationCount !== undefined
                              ? " / "
                              : "Макс. "}
                            {event.maxAttendees} участников
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Действия */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="space-y-3">
                  {/* Регистрация */}
                  {!isPast && event.registrationRequired && (
                    <button
                      onClick={handleRegister}
                      disabled={
                        registerMutation.isPending ||
                        unregisterMutation.isPending
                      }
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                        event.isUserRegistered
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {registerMutation.isPending ||
                      unregisterMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : event.isUserRegistered ? (
                        <>
                          <X className="h-4 w-4" />
                          Отменить регистрацию
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Зарегистрироваться
                        </>
                      )}
                    </button>
                  )}

                  {/* Внешние ссылки */}
                  {event.ticketUrl && (
                    <button
                      onClick={() => handleExternalLink(event.ticketUrl!)}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Купить билет
                    </button>
                  )}

                  {event.registrationUrl && !event.registrationRequired && (
                    <button
                      onClick={() => handleExternalLink(event.registrationUrl!)}
                      className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Регистрация
                    </button>
                  )}

                  <div className="flex gap-2">
                    {/* Избранное */}
                    <button
                      onClick={handleFavoriteToggle}
                      disabled={
                        addToFavoritesMutation.isPending ||
                        removeFromFavoritesMutation.isPending
                      }
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        event.isUserFavorite
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {addToFavoritesMutation.isPending ||
                      removeFromFavoritesMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Heart
                            className={`h-4 w-4 ${
                              event.isUserFavorite ? "fill-current" : ""
                            }`}
                          />
                          {event.isUserFavorite ? "В избранном" : "В избранное"}
                        </>
                      )}
                    </button>

                    {/* Поделиться */}
                    <button
                      onClick={handleShare}
                      className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Поделиться
                    </button>
                  </div>
                </div>

                {/* Статистика */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500 text-center">
                    👁️ {event.viewCount} просмотров
                  </div>
                </div>
              </div>

              {/* Предупреждения */}
              {isPast && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Это событие уже завершилось</span>
                  </div>
                </div>
              )}

              {!isPast &&
                event.maxAttendees &&
                event.registrationCount &&
                event.registrationCount >= event.maxAttendees && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <Users className="h-4 w-4" />
                      <span>Достигнуто максимальное количество участников</span>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
