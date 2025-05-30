"use client";

import React, { useState } from "react";
import {
  EventFilters as EventFiltersType,
  EventCategory,
  getCategoryLabel,
  getCategoryIcon,
} from "@/types";
import { Search, Filter, X, Calendar, MapPin, DollarSign } from "lucide-react";

interface EventFiltersProps {
  filters: EventFiltersType;
  onFiltersChange: (filters: EventFiltersType) => void;
  onClear: () => void;
}

export function EventFilters({
  filters,
  onFiltersChange,
  onClear,
}: EventFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof EventFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === "" ? undefined : value,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ""
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск мероприятий..."
          value={filters.search || ""}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Быстрые фильтры */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() =>
            handleFilterChange(
              "isFree",
              filters.isFree === true ? undefined : true
            )
          }
          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
            filters.isFree === true
              ? "bg-green-100 border-green-300 text-green-700"
              : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
          }`}
        >
          💰 Бесплатные
        </button>

        <button
          onClick={() =>
            handleFilterChange(
              "featured",
              filters.featured === true ? undefined : true
            )
          }
          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
            filters.featured === true
              ? "bg-orange-100 border-orange-300 text-orange-700"
              : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
          }`}
        >
          ⭐ Рекомендуемые
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-3 py-1 text-sm rounded-full border transition-colors flex items-center gap-1 ${
            isExpanded
              ? "bg-blue-100 border-blue-300 text-blue-700"
              : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Filter className="h-3 w-3" />
          Еще фильтры
        </button>

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="px-3 py-1 text-sm rounded-full border border-red-300 bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Очистить
          </button>
        )}
      </div>

      {/* Расширенные фильтры */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Категории */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <button
                onClick={() => handleFilterChange("category", undefined)}
                className={`p-2 text-sm rounded-lg border transition-colors ${
                  !filters.category
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                Все
              </button>
              {Object.values(EventCategory).map((category) => (
                <button
                  key={category}
                  onClick={() => handleFilterChange("category", category)}
                  className={`p-2 text-sm rounded-lg border transition-colors flex flex-col items-center gap-1 ${
                    filters.category === category
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  <span className="text-xs text-center">
                    {getCategoryLabel(category)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Даты */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Дата начала
              </label>
              <input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Дата окончания
              </label>
              <input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Местоположение */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Место проведения
            </label>
            <input
              type="text"
              placeholder="Название места или района..."
              value={filters.location || ""}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Цена */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Стоимость
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange("isFree", undefined)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  filters.isFree === undefined
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                Все
              </button>
              <button
                onClick={() => handleFilterChange("isFree", true)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  filters.isFree === true
                    ? "bg-green-100 border-green-300 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                Бесплатно
              </button>
              <button
                onClick={() => handleFilterChange("isFree", false)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  filters.isFree === false
                    ? "bg-purple-100 border-purple-300 text-purple-700"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                Платно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
