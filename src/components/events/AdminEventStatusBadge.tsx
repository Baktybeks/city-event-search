// components/events/AdminEventStatusBadge.tsx
"use client";

import React, { useState } from "react";
import { Event, EventStatus, getStatusLabel } from "@/types";
import {
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  X,
  Star,
  StarOff,
  MoreHorizontal,
  Calendar,
} from "lucide-react";
import {
  usePublishEvent,
  useUnpublishEvent,
  useCancelEvent,
  useCompleteEvent,
  useToggleEventFeatured,
} from "@/services/eventsService";
import { toast } from "react-toastify";

interface AdminEventStatusBadgeProps {
  event: Event;
  variant?: "compact" | "full";
}

export function AdminEventStatusBadge({
  event,
  variant = "compact",
}: AdminEventStatusBadgeProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const publishMutation = usePublishEvent();
  const unpublishMutation = useUnpublishEvent();
  const cancelMutation = useCancelEvent();
  const completeMutation = useCompleteEvent();
  const toggleFeaturedMutation = useToggleEventFeatured();

  const getStatusConfig = (status: EventStatus) => {
    switch (status) {
      case EventStatus.DRAFT:
        return {
          label: "Ожидаемый",
          icon: Clock,
          className: "bg-gray-100 text-gray-700 border-gray-200",
          badgeColor: "gray",
        };
      case EventStatus.PUBLISHED:
        return {
          label: "Опубликовано",
          icon: CheckCircle,
          className: "bg-green-100 text-green-700 border-green-200",
          badgeColor: "green",
        };
      case EventStatus.CANCELLED:
        return {
          label: "Отменено",
          icon: X,
          className: "bg-red-100 text-red-700 border-red-200",
          badgeColor: "red",
        };
      case EventStatus.COMPLETED:
        return {
          label: "Завершено",
          icon: CheckCircle,
          className: "bg-blue-100 text-blue-700 border-blue-200",
          badgeColor: "blue",
        };
      default:
        return {
          label: "Неизвестно",
          icon: Clock,
          className: "bg-gray-100 text-gray-700 border-gray-200",
          badgeColor: "gray",
        };
    }
  };

  const config = getStatusConfig(event.status);
  const StatusIcon = config.icon;

  const isLoading =
    publishMutation.isPending ||
    unpublishMutation.isPending ||
    cancelMutation.isPending ||
    completeMutation.isPending ||
    toggleFeaturedMutation.isPending;

  const handleStatusChange = async (newStatus: EventStatus) => {
    try {
      switch (newStatus) {
        case EventStatus.PUBLISHED:
          await publishMutation.mutateAsync(event.$id);
          toast.success("Событие опубликовано!", {
            position: "top-right",
            autoClose: 2000,
          });
          break;
        case EventStatus.DRAFT:
          await unpublishMutation.mutateAsync(event.$id);
          toast.success("Событие снято с публикации", {
            position: "top-right",
            autoClose: 2000,
          });
          break;
        case EventStatus.CANCELLED:
          await cancelMutation.mutateAsync(event.$id);
          toast.success("Событие отменено", {
            position: "top-right",
            autoClose: 2000,
          });
          break;
        case EventStatus.COMPLETED:
          await completeMutation.mutateAsync(event.$id);
          toast.success("Событие завершено", {
            position: "top-right",
            autoClose: 2000,
          });
          break;
      }
      setIsMenuOpen(false);
    } catch (error) {
      toast.error("Ошибка при изменении статуса события", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleToggleFeatured = async () => {
    try {
      await toggleFeaturedMutation.mutateAsync({
        eventId: event.$id,
        featured: !event.featured,
      });
      toast.success(
        event.featured
          ? "Событие убрано из рекомендуемых"
          : "Событие добавлено в рекомендуемые",
        {
          position: "top-right",
          autoClose: 2000,
        }
      );
    } catch (error) {
      toast.error("Ошибка при изменении статуса рекомендуемого", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        {/* Статус события */}
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${config.className}`}
        >
          <StatusIcon className="h-3 w-3" />
          {config.label}
        </span>

        {/* Рекомендуемое */}
        {event.featured && (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full border border-yellow-200">
            <Star className="h-3 w-3 fill-current" />
            Рекомендуемое
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Статус события */}
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full border ${config.className}`}
      >
        <StatusIcon className="h-4 w-4" />
        {config.label}
      </span>

      {/* Рекомендуемое */}
      <button
        onClick={handleToggleFeatured}
        disabled={isLoading}
        className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          event.featured
            ? "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200"
            : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
        }`}
        title={
          event.featured
            ? "Убрать из рекомендуемых"
            : "Добавить в рекомендуемые"
        }
      >
        {event.featured ? (
          <Star className="h-4 w-4 fill-current" />
        ) : (
          <StarOff className="h-4 w-4" />
        )}
        {event.featured ? "Рекомендуемое" : "Не рекомендуемое"}
      </button>

      {/* Меню действий */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          disabled={isLoading}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
          Действия
        </button>

        {isMenuOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="py-1">
              {event.status === EventStatus.DRAFT && (
                <button
                  onClick={() => handleStatusChange(EventStatus.PUBLISHED)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Eye className="h-4 w-4 text-green-500" />
                  Опубликовать
                </button>
              )}

              {event.status === EventStatus.PUBLISHED && (
                <>
                  <button
                    onClick={() => handleStatusChange(EventStatus.DRAFT)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <EyeOff className="h-4 w-4 text-gray-500" />
                    Снять с публикации
                  </button>
                  <button
                    onClick={() => handleStatusChange(EventStatus.COMPLETED)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Завершить событие
                  </button>
                </>
              )}

              {(event.status === EventStatus.PUBLISHED ||
                event.status === EventStatus.DRAFT) && (
                <button
                  onClick={() => handleStatusChange(EventStatus.CANCELLED)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <X className="h-4 w-4 text-red-500" />
                  Отменить событие
                </button>
              )}

              {event.status === EventStatus.CANCELLED && (
                <button
                  onClick={() => handleStatusChange(EventStatus.DRAFT)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Clock className="h-4 w-4 text-gray-500" />
                  Восстановить как Ожидаемый
                </button>
              )}
            </div>
          </div>
        )}

        {/* Overlay для закрытия меню */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
