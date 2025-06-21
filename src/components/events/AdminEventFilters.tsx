// components/events/AdminEventFilters.tsx
"use client";

import React from "react";
import {
  EventFilters,
  EventStatus,
  EventCategory,
  getCategoryLabel,
  getStatusLabel,
} from "@/types";
import { Calendar, Filter, X, Search } from "lucide-react";

interface AdminEventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  onClear: () => void;
}

export function AdminEventFilters({
  filters,
  onFiltersChange,
  onClear,
}: AdminEventFiltersProps) {
  const updateFilter = (key: keyof EventFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === "" ? undefined : value,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ""
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Очистить все
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Поиск */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Поиск
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Название события..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Статус события */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Статус события
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Все статусы</option>
            {Object.values(EventStatus).map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        {/* Категория */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Категория
          </label>
          <select
            value={filters.category || ""}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Все категории</option>
            {Object.values(EventCategory).map((category) => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>
        </div>

        {/* Бесплатные/Платные */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Тип события
          </label>
          <select
            value={
              filters.isFree === undefined
                ? ""
                : filters.isFree
                ? "free"
                : "paid"
            }
            onChange={(e) =>
              updateFilter(
                "isFree",
                e.target.value === "" ? undefined : e.target.value === "free"
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Все события</option>
            <option value="free">Только бесплатные</option>
            <option value="paid">Только платные</option>
          </select>
        </div>

        {/* Рекомендуемые */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Рекомендуемые
          </label>
          <select
            value={
              filters.featured === undefined
                ? ""
                : filters.featured
                ? "featured"
                : "not-featured"
            }
            onChange={(e) =>
              updateFilter(
                "featured",
                e.target.value === ""
                  ? undefined
                  : e.target.value === "featured"
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Все события</option>
            <option value="featured">Только рекомендуемые</option>
            <option value="not-featured">Не рекомендуемые</option>
          </select>
        </div>

        {/* Местоположение */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Местоположение
          </label>
          <input
            type="text"
            value={filters.location || ""}
            onChange={(e) => updateFilter("location", e.target.value)}
            placeholder="Город или место..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Дата начала */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            От даты
          </label>
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => updateFilter("startDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Дата окончания */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            До даты
          </label>
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => updateFilter("endDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Активные фильтры */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Активные фильтры:
          </h4>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Поиск: {filters.search}
                <button
                  onClick={() => updateFilter("search", "")}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                Статус: {getStatusLabel(filters.status)}
                <button
                  onClick={() => updateFilter("status", "")}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                Категория: {getCategoryLabel(filters.category)}
                <button
                  onClick={() => updateFilter("category", "")}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.isFree !== undefined && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                {filters.isFree ? "Бесплатные" : "Платные"}
                <button
                  onClick={() => updateFilter("isFree", undefined)}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.featured !== undefined && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                {filters.featured ? "Рекомендуемые" : "Не рекомендуемые"}
                <button
                  onClick={() => updateFilter("featured", undefined)}
                  className="ml-1 text-orange-600 hover:text-orange-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
