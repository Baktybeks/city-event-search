// Альтернативный вариант с React Portal
// Если проблемы с z-index останутся, используйте эту версию:

// components/events/CompactEventStatusPortal.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Event, EventStatus, getStatusLabel } from "@/types";
import {
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  X,
  Star,
  StarOff,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import {
  usePublishEvent,
  useUnpublishEvent,
  useCancelEvent,
  useCompleteEvent,
  useToggleEventFeatured,
} from "@/services/eventsService";
import { toast } from "react-toastify";

interface CompactEventStatusProps {
  event: Event;
}

export function CompactEventStatusPortal({ event }: CompactEventStatusProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const publishMutation = usePublishEvent();
  const unpublishMutation = useUnpublishEvent();
  const cancelMutation = useCancelEvent();
  const completeMutation = useCompleteEvent();
  const toggleFeaturedMutation = useToggleEventFeatured();

  // Вычисляем позицию меню при открытии
  useEffect(() => {
    if (isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
  }, [isMenuOpen]);

  const getStatusConfig = (status: EventStatus) => {
    switch (status) {
      case EventStatus.DRAFT:
        return {
          label: "Ожидаемый",
          icon: Clock,
          className: "bg-gray-100 text-gray-700 border-gray-200",
        };
      case EventStatus.PUBLISHED:
        return {
          label: "Опубликовано",
          icon: CheckCircle,
          className: "bg-green-100 text-green-700 border-green-200",
        };
      case EventStatus.CANCELLED:
        return {
          label: "Отменено",
          icon: X,
          className: "bg-red-100 text-red-700 border-red-200",
        };
      case EventStatus.COMPLETED:
        return {
          label: "Завершено",
          icon: CheckCircle,
          className: "bg-blue-100 text-blue-700 border-blue-200",
        };
      default:
        return {
          label: "Неизвестно",
          icon: Clock,
          className: "bg-gray-100 text-gray-700 border-gray-200",
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
      setIsMenuOpen(false);

      console.log(
        `🔄 Изменяем статус события ${event.$id} с ${event.status} на ${newStatus}`
      );

      // Выполняем изменение в бэкенде
      switch (newStatus) {
        case EventStatus.PUBLISHED:
          await publishMutation.mutateAsync(event.$id);
          break;
        case EventStatus.DRAFT:
          await unpublishMutation.mutateAsync(event.$id);
          break;
        case EventStatus.CANCELLED:
          await cancelMutation.mutateAsync(event.$id);
          break;
        case EventStatus.COMPLETED:
          await completeMutation.mutateAsync(event.$id);
          break;
      }

      console.log("✅ Статус изменен в бэкенде");

      // Показываем уведомление
      const statusMessages = {
        [EventStatus.PUBLISHED]: "Событие опубликовано!",
        [EventStatus.DRAFT]: "Событие снято с публикации",
        [EventStatus.CANCELLED]: "Событие отменено",
        [EventStatus.COMPLETED]: "Событие завершено",
      };

      toast.success(statusMessages[newStatus], {
        position: "top-right",
        autoClose: 1500,
      });

      // Обновляем страницу через 1.5 секунды
      setTimeout(() => {
        console.log("🔄 Обновляем страницу для синхронизации UI");
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("❌ Ошибка при изменении статуса:", error);
      toast.error("Ошибка при изменении статуса", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleToggleFeatured = async () => {
    try {
      setIsMenuOpen(false);

      const newFeaturedStatus = !event.featured;
      console.log(
        `🔄 Изменяем featured статус события ${event.$id} на ${newFeaturedStatus}`
      );

      // Выполняем изменение в бэкенде
      await toggleFeaturedMutation.mutateAsync({
        eventId: event.$id,
        featured: newFeaturedStatus,
      });

      console.log("✅ Featured статус изменен в бэкенде");

      // Показываем уведомление
      toast.success(
        newFeaturedStatus
          ? "Добавлено в рекомендуемые"
          : "Убрано из рекомендуемых",
        { position: "top-right", autoClose: 1500 }
      );

      // Обновляем страницу через 1.5 секунды
      setTimeout(() => {
        console.log("🔄 Обновляем страницу для синхронизации UI");
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("❌ Ошибка при изменении featured статуса:", error);
      toast.error("Ошибка при изменении рекомендуемого статуса", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Меню через Portal
  const dropdownMenu =
    isMenuOpen && typeof document !== "undefined"
      ? createPortal(
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Меню */}
            <div
              className="absolute w-48 bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999]"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              <div className="py-1">
                {/* Заголовок */}
                <div className="px-3 py-2 text-xs font-semibold text-gray-600 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                  Изменить статус
                </div>

                {/* Действия по статусу */}
                {event.status === EventStatus.DRAFT && (
                  <button
                    onClick={() => handleStatusChange(EventStatus.PUBLISHED)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800 flex items-center gap-2 transition-colors"
                  >
                    <Eye className="h-4 w-4 text-green-500" />
                    Опубликовать
                  </button>
                )}

                {event.status === EventStatus.PUBLISHED && (
                  <>
                    <button
                      onClick={() => handleStatusChange(EventStatus.DRAFT)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-800 flex items-center gap-2 transition-colors"
                    >
                      <EyeOff className="h-4 w-4 text-gray-500" />В ожидаемые
                    </button>
                    <button
                      onClick={() => handleStatusChange(EventStatus.COMPLETED)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800 flex items-center gap-2 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      Завершить
                    </button>
                  </>
                )}

                {(event.status === EventStatus.PUBLISHED ||
                  event.status === EventStatus.DRAFT) && (
                  <button
                    onClick={() => handleStatusChange(EventStatus.CANCELLED)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-800 flex items-center gap-2 transition-colors"
                  >
                    <X className="h-4 w-4 text-red-500" />
                    Отменить
                  </button>
                )}

                {event.status === EventStatus.CANCELLED && (
                  <button
                    onClick={() => handleStatusChange(EventStatus.DRAFT)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-800 flex items-center gap-2 transition-colors"
                  >
                    <Clock className="h-4 w-4 text-gray-500" />
                    Восстановить
                  </button>
                )}

                {/* ДОБАВЛЕНО: Действия для завершенных событий */}
                {event.status === EventStatus.COMPLETED && (
                  <>
                    <button
                      onClick={() => handleStatusChange(EventStatus.DRAFT)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-800 flex items-center gap-2 transition-colors"
                    >
                      <Clock className="h-4 w-4 text-gray-500" />
                      Вернуть в ожидаемые
                    </button>
                    <button
                      onClick={() => handleStatusChange(EventStatus.PUBLISHED)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800 flex items-center gap-2 transition-colors"
                    >
                      <Eye className="h-4 w-4 text-green-500" />
                      Опубликовать снова
                    </button>
                    <button
                      onClick={() => handleStatusChange(EventStatus.CANCELLED)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-800 flex items-center gap-2 transition-colors"
                    >
                      <X className="h-4 w-4 text-red-500" />
                      Отменить
                    </button>
                  </>
                )}

                {/* Разделитель - показываем для всех статусов */}
                <div className="border-t border-gray-100 my-1"></div>

                {/* Рекомендуемое - теперь доступно для ВСЕХ статусов */}
                <button
                  onClick={handleToggleFeatured}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-800 flex items-center gap-2 transition-colors"
                >
                  {event.featured ? (
                    <>
                      <StarOff className="h-4 w-4 text-yellow-500" />
                      Убрать из рекомендуемых
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 text-yellow-500" />В
                      рекомендуемые
                    </>
                  )}
                </button>
              </div>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <div className="relative">
      {/* Статус с кнопкой меню */}
      <div className="flex items-center gap-2">
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
          </span>
        )}

        {/* Кнопка меню действий */}
        <button
          ref={buttonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          disabled={isLoading}
          className="inline-flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
          title="Действия"
        >
          {isLoading ? (
            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Меню через Portal */}
      {dropdownMenu}
    </div>
  );
}
