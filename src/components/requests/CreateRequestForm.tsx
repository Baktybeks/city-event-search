// src/components/requests/CreateRequestForm.tsx

"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCreateRequest } from "@/services/maintenanceService";
import {
  RequestCategory,
  RequestPriority,
  getCategoryLabel,
  getPriorityLabel,
} from "@/types";
import {
  ClipboardList,
  MapPin,
  AlertTriangle,
  Calendar,
  FileText,
  Send,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

interface CreateRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateRequestForm({
  onSuccess,
  onCancel,
}: CreateRequestFormProps) {
  const { user } = useAuth();
  const createRequestMutation = useCreateRequest ? useCreateRequest() : null;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: RequestCategory.ELECTRICAL,
    priority: RequestPriority.MEDIUM,
    location: "",
    expectedCompletionDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Название заявки обязательно";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Описание заявки обязательно";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Местоположение обязательно";
    }

    if (formData.expectedCompletionDate) {
      const selectedDate = new Date(formData.expectedCompletionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.expectedCompletionDate = "Дата не может быть в прошлом";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user || !createRequestMutation) {
      toast.error("Ошибка: пользователь не авторизован");
      return;
    }

    try {
      await createRequestMutation.mutateAsync({
        ...formData,
        requesterId: user.$id,
      });

      toast.success("Заявка успешно создана!", {
        position: "top-right",
        autoClose: 3000,
      });

      onSuccess?.();
    } catch (error: any) {
      toast.error(`Ошибка при создании заявки: ${error.message}`, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const handleInputChange = (
    field: string,
    value: string | RequestCategory | RequestPriority
  ) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Создать новую заявку
          </h2>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Название заявки */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название заявки *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.title ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Например: Ремонт кондиционера в офисе 205"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Описание */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание проблемы *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.description ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Подробно опишите проблему или необходимые работы..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Категория и приоритет */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                handleInputChange("category", e.target.value as RequestCategory)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.values(RequestCategory).map((category) => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Приоритет *
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                handleInputChange("priority", e.target.value as RequestPriority)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.values(RequestPriority).map((priority) => (
                <option key={priority} value={priority}>
                  {getPriorityLabel(priority)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Местоположение */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            Местоположение *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.location ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Например: Офис 205, 2 этаж, корпус А"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
        </div>

        {/* Ожидаемая дата завершения */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Ожидаемая дата завершения
          </label>
          <input
            type="date"
            value={formData.expectedCompletionDate}
            onChange={(e) =>
              handleInputChange("expectedCompletionDate", e.target.value)
            }
            min={new Date().toISOString().split("T")[0]}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.expectedCompletionDate
                ? "border-red-300"
                : "border-gray-300"
            }`}
          />
          {errors.expectedCompletionDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.expectedCompletionDate}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Если не указано, заявка будет обработана в порядке очереди
          </p>
        </div>

        {/* Информационное сообщение */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Информация о заявке
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                После создания заявка будет отправлена на рассмотрение. Вы
                получите уведомление о назначении исполнителя и изменении
                статуса заявки.
              </p>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Отменить
            </button>
          )}
          <button
            type="submit"
            disabled={createRequestMutation?.isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createRequestMutation?.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            Создать заявку
          </button>
        </div>
      </form>
    </div>
  );
}
