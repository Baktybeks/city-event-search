"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import {
  Settings,
  Shield,
  Database,
  Mail,
  Bell,
  Users,
  Globe,
  Lock,
  Server,
  Activity,
  AlertTriangle,
  Save,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react";
import { toast } from "react-toastify";

export default function AdminSettingsPage() {
  const { user } = useAuth();

  const [generalSettings, setGeneralSettings] = useState({
    siteName: "EventCity",
    siteDescription: "Лучшие мероприятия твоего города в одном месте",
    contactEmail: "admin@eventcity.com",
    defaultLanguage: "ru",
    timezone: "Europe/Moscow",
    allowRegistrations: true,
    requireEmailVerification: true,
    autoApproveOrganizers: false,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "noreply@eventcity.com",
    fromName: "EventCity",
    enableNotifications: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    requireSpecialChars: true,
    sessionTimeout: 24,
    enableTwoFactor: false,
    maxLoginAttempts: 5,
    blockDuration: 30,
  });

  const [isLoading, setIsLoading] = useState(false);

  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Доступ запрещен
          </h1>
          <p className="text-gray-600">
            У вас нет прав для доступа к настройкам системы
          </p>
        </div>
      </div>
    );
  }

  const handleSaveSettings = async (section: string) => {
    setIsLoading(true);
    try {
      // В реальном приложении здесь был бы вызов API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Настройки ${section} сохранены`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Ошибка при сохранении настроек", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupDatabase = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Резервная копия создана", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Ошибка при создании резервной копии", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemMaintenance = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success("Обслуживание системы завершено", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Ошибка при обслуживании системы", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Настройки системы
        </h1>
        <p className="text-gray-600">
          Управление конфигурацией и параметрами платформы
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Основной контент */}
        <div className="lg:col-span-2 space-y-8">
          {/* Общие настройки */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Общие настройки
                </h2>
              </div>
              <button
                onClick={() => handleSaveSettings("общие")}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Сохранить
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название сайта
                </label>
                <input
                  type="text"
                  value={generalSettings.siteName}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, siteName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email для связи
                </label>
                <input
                  type="email"
                  value={generalSettings.contactEmail}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание сайта
                </label>
                <textarea
                  value={generalSettings.siteDescription}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Язык по умолчанию
                </label>
                <select
                  value={generalSettings.defaultLanguage}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, defaultLanguage: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                  <option value="kk">Қазақша</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Часовой пояс
                </label>
                <select
                  value={generalSettings.timezone}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, timezone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Europe/Moscow">Москва (GMT+3)</option>
                  <option value="Asia/Almaty">Алматы (GMT+6)</option>
                  <option value="Asia/Bishkek">Бишкек (GMT+6)</option>
                  <option value="Europe/Kiev">Киев (GMT+2)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Разрешить регистрацию</h3>
                  <p className="text-sm text-gray-500">Новые пользователи могут создавать аккаунты</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generalSettings.allowRegistrations}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, allowRegistrations: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Настройки Email */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Настройки Email
                </h2>
              </div>
              <button
                onClick={() => handleSaveSettings("email")}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Сохранить
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Хост
                </label>
                <input
                  type="text"
                  value={emailSettings.smtpHost}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, smtpHost: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Порт
                </label>
                <input
                  type="text"
                  value={emailSettings.smtpPort}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, smtpPort: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="587"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Пользователь
                </label>
                <input
                  type="text"
                  value={emailSettings.smtpUser}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, smtpUser: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Пароль
                </label>
                <input
                  type="password"
                  value={emailSettings.smtpPassword}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  От кого (Email)
                </label>
                <input
                  type="email"
                  value={emailSettings.fromEmail}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, fromEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="noreply@eventcity.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  От кого (Имя)
                </label>
                <input
                  type="text"
                  value={emailSettings.fromName}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, fromName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="EventCity"
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Включить email уведомления</h3>
                  <p className="text-sm text-gray-500">Отправлять уведомления пользователям</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailSettings.enableNotifications}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, enableNotifications: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Боковая панель */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            {/* Системная информация */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Server className="h-6 w-6 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Системная информация</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Версия:</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">База данных:</span>
                  <span className="font-medium">Appwrite</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Статус:</span>
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Онлайн
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Последний бэкап:</span>
                  <span>Сегодня</span>
                </div>
              </div>
            </div>

            {/* Административные действия */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Административные действия</h3>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleBackupDatabase}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Создать бэкап
                </button>

                <button
                  onClick={handleSystemMaintenance}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Обслуживание системы
                </button>

                <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                  <Upload className="h-4 w-4" />
                  Импорт данных
                </button>
              </div>
            </div>

            {/* Предупреждения */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
                <h3 className="font-semibold text-amber-900">Внимание</h3>
              </div>
              
              <div className="space-y-2 text-sm text-amber-800">
                <p>• Изменения настроек безопасности вступают в силу немедленно</p>
                <p>• Рекомендуется создавать резервные копии перед изменениями</p>
                <p>• Неправильные настройки email могут нарушить работу уведомлений</p>
              </div>
            </div>

            {/* Быстрая статистика */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Системная статистика
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Активных пользователей:</span>
                  <span className="font-bold text-blue-600">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Событий за месяц:</span>
                  <span className="font-bold text-purple-600">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Размер БД:</span>
                  <span className="font-bold text-green-600">45 МБ</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Время работы:</span>
                  <span className="font-bold text-orange-600">7 дней</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Подтверждение email</h3>
                  <p className="text-sm text-gray-500">Требовать подтверждение email при регистрации</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generalSettings.requireEmailVerification}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, requireEmailVerification: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Автоматическое одобрение организаторов</h3>
                  <p className="text-sm text-gray-500">Организаторы активируются автоматически</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generalSettings.autoApproveOrganizers}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, autoApproveOrganizers: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Настройки безопасности */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Безопасность
                </h2>
              </div>
              <button
                onClick={() => handleSaveSettings("безопасности")}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Сохранить
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Минимальная длина пароля
                </label>
                <input
                  type="number"
                  min="6"
                  max="50"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) =>
                    setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Время сессии (часы)
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) =>
                    setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Максимум попыток входа
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) =>
                    setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Блокировка (минуты)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={securitySettings.blockDuration}
                  onChange={(e) =>
                    setSecuritySettings({ ...securitySettings, blockDuration: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Требовать специальные символы в пароле</h3>
                  <p className="text-sm text-gray-500">Пароль должен содержать !@#$%^&* и др.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.requireSpecialChars}
                    onChange={(e) =>
                      setSecuritySettings({ ...securitySettings, requireSpecialChars: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Двухфакторная аутентификация</h3>
                  <p className="text-sm text-gray-500">Включить 2FA для администраторов</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.enableTwoFactor}
                    onChange={(e) =>
                      setSecuritySettings({ ...securitySettings, enableTwoFactor: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none