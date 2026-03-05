"use client";

import React from "react";
import Link from "next/link";
import {
  Event,
  getCategoryIcon,
  getCategoryLabel,
  formatPrice,
  isEventToday,
  isEventUpcoming,
} from "@/types";
import { Calendar, MapPin, Users, Heart, Eye, Clock } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface EventCardProps {
  event: Event;
  onFavoriteToggle?: (eventId: string) => void;
  isFavorite?: boolean;
  showOrganizer?: boolean;
  variant?: "default" | "compact" | "featured";
  className?: string;
}

export function EventCard({
  event,
  onFavoriteToggle,
  isFavorite = false,
  showOrganizer = false,
  variant = "default",
  className = "",
}: EventCardProps) {
  const eventDate = new Date(event.startDate);
  const isToday = isEventToday(event.startDate);
  const isUpcoming = isEventUpcoming(event.startDate);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(event.$id);
  };

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
          {format(eventDate, "d MMMM, HH:mm", { locale: ru })}
        </span>
      );
    }

    return (
      <span className="text-gray-500">
        {format(eventDate, "d MMMM, HH:mm", { locale: ru })}
      </span>
    );
  };

  if (variant === "compact") {
    return (
      <Link href={`/events/${event.$id}`} className="block">
        <div
          className={`bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-4 ${className}`}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl flex-shrink-0 mt-1">
              {getCategoryIcon(event.category)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                {event.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                {getDateDisplay()}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>
            <div className="text-sm font-semibold text-blue-600  w-20">
              {formatPrice(event.price, event.isFree)}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/events/${event.$id}`} className="block group">
        <div
          className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
        >
          {event.imageUrl && (
            <div className="aspect-video overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {getCategoryIcon(event.category)}
                </span>
                <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {getCategoryLabel(event.category)}
                </span>
              </div>
              {event.featured && (
                <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                  ⭐ Рекомендуем
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {event.title}
            </h3>

            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
              {event.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                {getDateDisplay()}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-blue-600">
                {formatPrice(event.price, event.isFree)}
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{event.viewCount}</span>
                </div>
                {onFavoriteToggle && (
                  <button
                    onClick={handleFavoriteClick}
                    className={`p-1 rounded-full transition-colors ${
                      isFavorite
                        ? "text-red-500 hover:text-red-600"
                        : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/events/${event.$id}`} className="block group">
      <div
        className={`bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden ${className}`}
      >
        {event.imageUrl && (
          <div className="aspect-video overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{getCategoryIcon(event.category)}</span>
              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                {getCategoryLabel(event.category)}
              </span>
            </div>
            {onFavoriteToggle && (
              <button
                onClick={handleFavoriteClick}
                className={`p-1 rounded-full transition-colors ${
                  isFavorite
                    ? "text-red-500 hover:text-red-600"
                    : "text-gray-400 hover:text-red-500"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                />
              </button>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>

          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {event.description}
          </p>

          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              {getDateDisplay()}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="font-semibold text-blue-600">
              {formatPrice(event.price, event.isFree)}
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{event.viewCount}</span>
              </div>
              {event.registrationRequired && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Регистрация</span>
                </div>
              )}
            </div>
          </div>

          {isToday && (
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full w-fit">
              <Clock className="h-3 w-3" />
              Сегодня
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
