"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import {
  User,
  Mail,
  Phone,
  Save,
  Shield,
  Settings,
  Camera,
  Bell,
  Globe,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";

export default function OrganizerSettingsPage() {
  const { user, updateUser, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    avatar: "",
  });

  const [notifications, setNotifications] = useState({
    emailEventReminders: true,
    emailNewRegistrations: true,
    emailEventUpdates: true,
    pushNotifications: false,
  });

  const [privacy, setPrivacy] = useState({
    showContactInfo: true,
    showEventHistory: true,
    allowDirectMessages: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  // Отслеживаем изменения в форме
  useEffect(() => {
    if (user) {
      const hasFormChanges =
        formData.name !== (user.name || "") ||
        formData.email !== (user.email || "") ||
        formData.phone !== (user.phone || "") ||
        formData.bio !== (user.bio || "") ||
        formData.avatar !== (user.avatar || "");

      setHasChanges(hasFormChanges);
    }
  }, [formData, user]);

  if (!user || user.role !== UserRole.ORGANIZER) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Доступ запрещен
          </h1>
          <p className="text-gray-600">
            У вас нет прав для доступа к настройкам организатора
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Подготавливаем данные для обновления
      const updateData: Partial<typeof user> = {};

      if (formData.name !== user.name) updateData.name = formData.name;
      if (formData.email !== user.email) updateData.email = formData.email;
      if (formData.phone !== user.phone) updateData.phone = formData.phone;
      if (formData.bio !== user.bio) updateData.bio = formData.bio;
      if (formData.avatar !== user.avatar) updateData.avatar = formData.avatar;

      // Обновляем профиль только если есть изменения
      if (Object.keys(updateData).length > 0) {
        await updateUser(updateData);

        toast.success("Настройки успешно сохранены!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.info("Нет изменений для сохранения", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Ошибка при сохранении настроек",
        {
          position: "top-right",
          autoClose: 4000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Размер файла не должен превышать 5MB", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Проверяем тип файла
      if (!file.type.startsWith("image/")) {
        toast.error("Пожалуйста, выберите файл изображения", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // В реальном приложении здесь была бы загрузка файла в Appwrite Storage
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData({
          ...formData,
          avatar: result,
        });

        toast.success(
          "Изображение загружено. Не забудьте сохранить изменения!",
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      };
      reader.onerror = () => {
        toast.error("Ошибка при загрузке изображения", {
          position: "top-right",
          autoClose: 3000,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNotifications = async () => {
    // В реальном приложении здесь был бы API вызов для сохранения настроек уведомлений
    toast.success("Настройки уведомлений сохранены", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const handleSavePrivacy = async () => {
    // В реальном приложении здесь был бы API вызов для сохранения настроек приватности
    toast.success("Настройки приватности сохранены", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Настройки профиля
        </h1>
        <p className="text-gray-600">
          Управление информацией о вашем профиле организатора
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-8">
          {/* Профиль */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Основная информация
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Аватар */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Аватар"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer hover:bg-gray-50 transition-colors">
                    <Camera className="h-4 w-4 text-gray-600" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">Организатор</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Рекомендуемый размер: 400x400px, максимум 5MB
                  </p>
                </div>
              </div>

              {/* Имя */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Полное имя
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ваше полное имя"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email адрес
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Изменение email потребует подтверждения
                </p>
              </div>

              {/* Телефон */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Номер телефона
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              {/* Биография */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  О себе
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Расскажите о себе как об организаторе..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.bio.length}/500 символов
                </p>
              </div>

              {/* Предупреждение о несохраненных изменениях */}
              {hasChanges && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm text-amber-800">
                      У вас есть несохраненные изменения
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || loading || !hasChanges}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading || loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Сохранить изменения
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Уведомления */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Уведомления
                </h2>
              </div>
              <button
                onClick={handleSaveNotifications}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Сохранить
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Email уведомления о событиях
                  </h3>
                  <p className="text-sm text-gray-500">
                    Напоминания о предстоящих событиях
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.emailEventReminders}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        emailEventReminders: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Новые регистрации
                  </h3>
                  <p className="text-sm text-gray-500">
                    Уведомления о регистрации на ваши события
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.emailNewRegistrations}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        emailNewRegistrations: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Обновления событий
                  </h3>
                  <p className="text-sm text-gray-500">
                    Системные уведомления об изменениях
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.emailEventUpdates}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        emailEventUpdates: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Push-уведомления
                  </h3>
                  <p className="text-sm text-gray-500">
                    Мгновенные уведомления в браузере
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.pushNotifications}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        pushNotifications: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Приватность */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Приватность
                </h2>
              </div>
              <button
                onClick={handleSavePrivacy}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Сохранить
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Показывать контактную информацию
                  </h3>
                  <p className="text-sm text-gray-500">
                    Ваш телефон будет виден участникам событий
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacy.showContactInfo}
                    onChange={(e) =>
                      setPrivacy({
                        ...privacy,
                        showContactInfo: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Показывать историю событий
                  </h3>
                  <p className="text-sm text-gray-500">
                    Другие пользователи смогут видеть ваши прошлые события
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacy.showEventHistory}
                    onChange={(e) =>
                      setPrivacy({
                        ...privacy,
                        showEventHistory: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Разрешить прямые сообщения
                  </h3>
                  <p className="text-sm text-gray-500">
                    Участники смогут отправлять вам личные сообщения
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacy.allowDirectMessages}
                    onChange={(e) =>
                      setPrivacy({
                        ...privacy,
                        allowDirectMessages: e.target.checked,
                      })
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
            {/* Краткая информация */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Информация о профиле
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Роль:</span>
                  <span className="font-medium">Организатор</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Статус:</span>
                  <span className="text-green-600 font-medium">Активен</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Дата регистрации:</span>
                  <span>
                    {new Date(user.$createdAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </div>
            </div>

            {/* Полезные ссылки */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Полезные ссылки
              </h3>

              <div className="space-y-2">
                <a
                  href="/organizer/analytics"
                  className="block text-blue-600 hover:text-blue-700 text-sm"
                >
                  📊 Аналитика событий
                </a>
                <a
                  href="/organizer/create"
                  className="block text-blue-600 hover:text-blue-700 text-sm"
                >
                  ➕ Создать событие
                </a>
                <a
                  href="#"
                  className="block text-blue-600 hover:text-blue-700 text-sm"
                >
                  ❓ Центр поддержки
                </a>
                <a
                  href="#"
                  className="block text-blue-600 hover:text-blue-700 text-sm"
                >
                  📖 Руководство организатора
                </a>
              </div>
            </div>

            {/* Статистика */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Быстрая статистика
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Всего событий:</span>
                  <span className="font-bold text-blue-600">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Участников:</span>
                  <span className="font-bold text-purple-600">347</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Просмотров:</span>
                  <span className="font-bold text-green-600">1,234</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
