// src/components/events/EventDetail.tsx
"use client";

import React from "react";
import {
  EventWithDetails,
  formatPrice,
  isEventToday,
  isEventUpcoming,
} from "@/types";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  ExternalLink,
  User,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface EventDetailProps {
  event: EventWithDetails;
  onRegister?: () => void;
  onFavoriteToggle?: () => void;
  onShare?: () => void;
  isRegistering?: boolean;
  isFavoriteToggling?: boolean;
  userCanRegister?: boolean;
}

export function EventDetail({
  event,
  onRegister,
  onFavoriteToggle,
  onShare,
  isRegistering = false,
  isFavoriteToggling = false,
  userCanRegister = true,
}: EventDetailProps) {
  const eventDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const isToday = isEventToday(event.startDate);
  const isUpcoming = isEventUpcoming(event.startDate);

  const getDateDisplay = () => {
    if (isToday) {
      return (
        <span className="text-orange-600 font-semibold">
          Сегодня, {format(eventDate, "HH:mm")}
        </span>
      );
    }

    if (isUpcoming) {
      return (
        <span className="text-blue-600">
          {format(eventDate, "d MMMM yyyy, HH:mm", { locale: ru })}
        </span>
      );
    }

    return (
      <span className="text-gray-500">
        {format(eventDate, "d MMMM yyyy, HH:mm", { locale: ru })}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Основная информация */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {event.title}
              </h1>
              {isToday && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Сегодня
                </div>
              )}
            </div>

            {event.featured && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                ⭐ Рекомендуем
              </span>
            )}
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Теги */}
          {event.tags && event.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Теги:</h3>
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
        </div>
      </div>

      {/* Информация о событии */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Информация о событии
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Дата и время */}
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">Дата и время</div>
              <div className="text-sm">
                {getDateDisplay()}
                {endDate && (
                  <div className="text-gray-500">
                    до {format(endDate, "HH:mm", { locale: ru })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Место проведения */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">Место проведения</div>
              <div className="text-sm text-gray-600">
                <div>{event.location}</div>
                <div>{event.address}</div>
              </div>
            </div>
          </div>

          {/* Цена */}
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">Стоимость</div>
              <div className="text-sm font-semibold text-blue-600 w-20">
                {formatPrice(event.price, event.isFree)}
              </div>
            </div>
          </div>

          {/* Участники */}
          {(event.registrationCount !== undefined || event.maxAttendees) && (
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Участники</div>
                <div className="text-sm text-gray-600">
                  {event.registrationCount !== undefined && (
                    <span>Зарегистрировано: {event.registrationCount}</span>
                  )}
                  {event.maxAttendees && (
                    <span>
                      {event.registrationCount !== undefined ? " / " : "Макс. "}
                      {event.maxAttendees} участников
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Просмотры */}
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">Просмотры</div>
              <div className="text-sm text-gray-600">
                {event.viewCount} просмотров
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Организатор */}
      {event.organizerInfo && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Организатор
          </h2>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
              {event.organizerInfo.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {event.organizerInfo.name}
              </h3>
              <p className="text-gray-600">{event.organizerInfo.email}</p>
              {event.organizerInfo.bio && (
                <p className="text-sm text-gray-500 mt-1 max-w-md">
                  {event.organizerInfo.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Действия */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-4">
          {/* Регистрация на событие */}
          {event.registrationRequired && userCanRegister && onRegister && (
            <button
              onClick={onRegister}
              disabled={isRegistering}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                event.isUserRegistered
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRegistering ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : event.isUserRegistered ? (
                "Отменить регистрацию"
              ) : (
                "Зарегистрироваться"
              )}
            </button>
          )}

          {/* Внешние ссылки */}
          <div className="grid grid-cols-1 gap-3">
            {event.ticketUrl && (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Купить билет
              </a>
            )}

            {event.registrationUrl && !event.registrationRequired && (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Внешняя регистрация
              </a>
            )}
          </div>

          {/* Избранное и поделиться */}
          {(onFavoriteToggle || onShare) && (
            <div className="flex gap-3">
              {onFavoriteToggle && (
                <button
                  onClick={onFavoriteToggle}
                  disabled={isFavoriteToggling}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    event.isUserFavorite
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isFavoriteToggling ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="text-lg">
                        {event.isUserFavorite ? "❤️" : "🤍"}
                      </span>
                      {event.isUserFavorite ? "В избранном" : "В избранное"}
                    </>
                  )}
                </button>
              )}

              {onShare && (
                <button
                  onClick={onShare}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-lg">📤</span>
                  Поделиться
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Предупреждения */}
      {event.maxAttendees &&
        event.registrationCount &&
        event.registrationCount >= event.maxAttendees && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <Users className="h-5 w-5" />
              <span className="font-medium">
                Достигнуто максимальное количество участников
              </span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              Регистрация на это событие больше недоступна
            </p>
          </div>
        )}
    </div>
  );
}
