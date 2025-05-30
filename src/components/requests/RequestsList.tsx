// src/components/requests/RequestsList.tsx

"use client";

import React, { useState } from "react";
import { useRequests } from "@/services/maintenanceService";
import { useAuth } from "@/hooks/useAuth";
import {
  MaintenanceRequest,
  RequestStatus,
  RequestPriority,
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  getPriorityColor,
  getCategoryLabel,
} from "@/types";
import { formatLocalDateTime } from "@/utils/dateUtils";
import {
  ClipboardList,
  Calendar,
  MapPin,
  User,
  AlertTriangle,
  Eye,
  Edit,
  Filter,
  Search,
  ChevronDown,
} from "lucide-react";

interface RequestsListProps {
  onRequestClick?: (request: MaintenanceRequest) => void;
  onRequestEdit?: (request: MaintenanceRequest) => void;
  showFilters?: boolean;
  initialFilters?: any;
}

export function RequestsList({
  onRequestClick,
  onRequestEdit,
  showFilters = false,
  initialFilters = {},
}: RequestsListProps) {
  const { user } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Для демонстрации - используем заглушку
  const { data: requests = [], isLoading } = useRequests
    ? useRequests(filters)
    : { data: [], isLoading: false };

  if (isLoading) {
    return <RequestsListLoading />;
  }

  if (requests.length === 0) {
    return <EmptyRequestsList />;
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Фильтры</h3>
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter className="h-4 w-4" />
              Фильтры
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showFilterPanel ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {showFilterPanel && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Поиск
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск по заявкам..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Все статусы</option>
                  {Object.values(RequestStatus).map((status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Приоритет
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Все приоритеты</option>
                  {Object.values(RequestPriority).map((priority) => (
                    <option key={priority} value={priority}>
                      {getPriorityLabel(priority)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Список заявок ({requests.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {requests.map((request) => (
            <RequestCard
              key={request.$id}
              request={request}
              onClick={() => onRequestClick?.(request)}
              onEdit={() => onRequestEdit?.(request)}
              showEditButton={!!onRequestEdit}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface RequestCardProps {
  request: MaintenanceRequest;
  onClick?: () => void;
  onEdit?: () => void;
  showEditButton?: boolean;
}

function RequestCard({
  request,
  onClick,
  onEdit,
  showEditButton,
}: RequestCardProps) {
  return (
    <div
      className={`p-6 hover:bg-gray-50 transition-colors ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {request.title}
            </h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                request.status
              )}`}
            >
              {getStatusLabel(request.status)}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                request.priority
              )}`}
            >
              {getPriorityLabel(request.priority)}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {request.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatLocalDateTime(request.$createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {request.location}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              ID: {request.requesterId?.slice(0, 8)}...
            </div>
            {request.category && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {getCategoryLabel(request.category)}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {showEditButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestsListLoading() {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-5 bg-gray-200 rounded w-20"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyRequestsList() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Заявки не найдены
      </h3>
      <p className="text-gray-600">
        На данный момент нет заявок, соответствующих выбранным фильтрам
      </p>
    </div>
  );
}
