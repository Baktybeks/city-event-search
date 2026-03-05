"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 mb-4">
              <AlertTriangle className="h-16 w-16 mx-auto" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Что-то пошло не так
            </h2>

            <p className="text-gray-600 mb-6">
              Произошла неожиданная ошибка. Мы уже работаем над её исправлением.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded p-4 mb-6 text-left">
                <p className="text-xs text-red-800 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Попробовать снова
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Home className="h-4 w-4" />
                На главную
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Компонент для отображения ошибок API
interface ApiErrorProps {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}

export function ApiError({ error, onRetry, className = "" }: ApiErrorProps) {
  const errorMessage = typeof error === "string" ? error : error.message;

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">
            Ошибка загрузки данных
          </h3>
          <p className="text-sm text-red-700">{errorMessage}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1 text-sm text-red-800 hover:text-red-900 font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              Попробовать снова
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Компонент для отображения пустого состояния
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="text-gray-300 mb-4 flex justify-center">{icon}</div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {description && (
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
}

// Компонент для отображения состояния "не найдено"
interface NotFoundProps {
  title?: string;
  description?: string;
  showHomeButton?: boolean;
  className?: string;
}

export function NotFound({
  title = "Страница не найдена",
  description = "Запрашиваемая страница не существует или была удалена",
  showHomeButton = true,
  className = "",
}: NotFoundProps) {
  return (
    <div
      className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 ${className}`}
    >
      <div className="text-center">
        <div className="text-6xl mb-6">🔍</div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>

        <p className="text-gray-600 mb-8 max-w-md mx-auto">{description}</p>

        {showHomeButton && (
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Home className="h-4 w-4" />
            На главную
          </a>
        )}
      </div>
    </div>
  );
}

// Компонент для отображения состояния "нет доступа"
interface AccessDeniedProps {
  title?: string;
  description?: string;
  className?: string;
}

export function AccessDenied({
  title = "Доступ запрещен",
  description = "У вас нет прав для просмотра этой страницы",
  className = "",
}: AccessDeniedProps) {
  return (
    <div
      className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 ${className}`}
    >
      <div className="text-center">
        <div className="text-red-500 mb-6">
          <AlertTriangle className="h-16 w-16 mx-auto" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>

        <p className="text-gray-600 mb-8 max-w-md mx-auto">{description}</p>

        <div className="space-y-3">
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Войти в систему
          </a>

          <div>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="h-4 w-4" />
              На главную
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Хук для обработки ошибок
export function useErrorHandler() {
  const handleError = (error: Error | string, context?: string) => {
    const errorMessage = typeof error === "string" ? error : error.message;

    console.error(`Error in ${context || "application"}:`, errorMessage);

    // Здесь можно добавить отправку ошибок в сервис мониторинга
    // например, Sentry, LogRocket и т.д.
  };

  return { handleError };
}

// Компонент-обертка для безопасного рендеринга
interface SafeComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

export function SafeComponent({
  children,
  fallback,
  onError,
}: SafeComponentProps) {
  try {
    return <>{children}</>;
  } catch (error) {
    if (onError && error instanceof Error) {
      onError(error);
    }

    return (
      fallback || (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800 text-sm">
            Ошибка при отображении компонента
          </p>
        </div>
      )
    );
  }
}

// Компонент для отображения состояния обслуживания
interface MaintenanceProps {
  title?: string;
  description?: string;
  estimatedTime?: string;
}

export function Maintenance({
  title = "Техническое обслуживание",
  description = "Сайт временно недоступен в связи с техническими работами",
  estimatedTime,
}: MaintenanceProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🔧</div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>

        <p className="text-gray-600 mb-6">{description}</p>

        {estimatedTime && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Ожидаемое время завершения:</strong> {estimatedTime}
            </p>
          </div>
        )}

        <p className="text-sm text-gray-500">
          Мы работаем над улучшением сервиса. Спасибо за понимание!
        </p>
      </div>
    </div>
  );
}
