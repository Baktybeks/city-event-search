"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserFavorites, useOrganizerEvents } from "@/services/eventsService";
import { EventCard } from "@/components/events/EventCard";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Heart,
  Save,
  Edit,
  Camera,
  Shield,
  Activity,
  Clock,
  Star,
  Eye,
  MapPin,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { UserRole, getRoleLabel, Event, EventStatus } from "@/types";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type ProfileTab = "overview" | "activity" | "favorites";

export default function ProfilePage() {
  // ВСЕ ХУКИ ДОЛЖНЫ БЫТЬ В НАЧАЛЕ КОМПОНЕНТА
  const { user, updateUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    // phone: "", // Временно отключено до создания поля в БД
    // bio: "",
    // avatar: "",
  });

  // Всегда вызываем хуки, но передаем пустую строку если не нужно делать запрос
  const { data: favoriteEvents = [] } = useUserFavorites(user?.$id || "");
  const { data: organizerEvents = [] } = useOrganizerEvents(user?.$id || "");

  // Мемоизируем отфильтрованные события
  const filteredOrganizerEvents = useMemo(() => {
    return user?.role === UserRole.ORGANIZER ? organizerEvents : [];
  }, [user?.role, organizerEvents]);

  // useEffect для обновления формы
  useEffect(() => {
    if (user && user.$id) {
      setFormData((prev) => {
        const newData = {
          name: user.name || "",
          // phone: user.phone || "", // Временно отключено
          // bio: user.bio || "",
          // avatar: user.avatar || "",
        };

        if (JSON.stringify(prev) !== JSON.stringify(newData)) {
          return newData;
        }
        return prev;
      });
    }
  }, [user?.$id, user?.name /* user?.phone, user?.bio, user?.avatar*/]);

  // Все useCallback и useMemo также должны быть здесь
  const handleSave = useCallback(async () => {
    if (!user) return;

    try {
      await updateUser({
        name: formData.name,
        // phone: formData.phone, // Временно отключено
        // bio: formData.bio,
        // avatar: formData.avatar,
      });

      setIsEditing(false);
      toast.success("Профиль успешно обновлен!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Ошибка при обновлении профиля", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [user, updateUser, formData]);

  // const handleAvatarUpload = useCallback(
  //   (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const file = e.target.files?.[0];
  //     if (file) {
  //       if (file.size > 5 * 1024 * 1024) {
  //         toast.error("Размер файла не должен превышать 5MB");
  //         return;
  //       }

  //       if (!file.type.startsWith("image/")) {
  //         toast.error("Пожалуйста, выберите файл изображения");
  //         return;
  //       }

  //       const reader = new FileReader();
  //       reader.onload = (event) => {
  //         const result = event.target?.result as string;
  //         setFormData((prev) => ({ ...prev, avatar: result }));
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   },
  //   []
  // );

  const stats = useMemo(() => {
    if (!user) {
      return {
        favorites: 0,
        eventsCreated: 0,
        eventsPublished: 0,
        totalViews: 0,
        joinDate: "",
      };
    }

    return {
      favorites: favoriteEvents.length,
      eventsCreated: filteredOrganizerEvents.length,
      eventsPublished: filteredOrganizerEvents.filter(
        (e: Event) => e.status === EventStatus.PUBLISHED
      ).length,
      totalViews: filteredOrganizerEvents.reduce(
        (sum: number, event: Event) => sum + (event.viewCount || 0),
        0
      ),
      joinDate: format(new Date(user.$createdAt), "MMMM yyyy", { locale: ru }),
    };
  }, [user, favoriteEvents.length, filteredOrganizerEvents]);

  const recentActivity = useMemo(() => {
    if (!user) return [];

    const activities = [
      ...(user.role === UserRole.ORGANIZER
        ? filteredOrganizerEvents
            .sort(
              (a: Event, b: Event) =>
                new Date(b.$updatedAt).getTime() -
                new Date(a.$updatedAt).getTime()
            )
            .slice(0, 3)
            .map((event: Event) => ({
              type: "event_created" as const,
              title: `Создано событие "${event.title}"`,
              date: event.$createdAt,
              icon: Calendar,
              color: "text-blue-600",
            }))
        : []),
      ...favoriteEvents.slice(0, 2).map((event: Event) => ({
        type: "favorite_added" as const,
        title: `Добавлено в избранное "${event.title}"`,
        date: event.$createdAt,
        icon: Heart,
        color: "text-red-600",
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return activities;
  }, [user, filteredOrganizerEvents, favoriteEvents]);

  const tabs = useMemo(
    () => [
      {
        id: "overview" as const,
        label: "Обзор",
        icon: UserIcon,
      },
      {
        id: "activity" as const,
        label: "Активность",
        icon: Activity,
      },
      {
        id: "favorites" as const,
        label: "Избранное",
        icon: Heart,
        count: favoriteEvents.length,
      },
    ],
    [favoriteEvents.length]
  );

  // ТОЛЬКО ПОСЛЕ ВСЕХ ХУКОВ МОЖЕМ ДЕЛАТЬ УСЛОВНЫЙ ВОЗВРАТ
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка профиля...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Заголовок профиля */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Аватар */}
          {/* <div className="relative">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Аватар"
                className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
              />
            ) : (
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <Camera className="h-4 w-4 text-gray-600" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            )}
          </div> */}
          {/* Информация о пользователе */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="text-2xl font-bold bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 rounded-lg px-3 py-2"
                  placeholder="Ваше имя"
                />
              ) : (
                <h1 className="text-3xl font-bold">{user.name}</h1>
              )}

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === UserRole.ADMIN
                    ? "bg-red-100 text-red-800"
                    : user.role === UserRole.ORGANIZER
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {getRoleLabel(user.role)}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>

              {/* Временно скрыто до создания поля phone в БД */}
              {/* {(user.phone || isEditing) && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 rounded px-2 py-1 text-sm"
                      placeholder="Номер телефона"
                    />
                  ) : (
                    <span>{user.phone || "Не указан"}</span>
                  )}
                </div>
              )} */}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Регистрация: {stats.joinDate}</span>
              </div>
            </div>

            {/* Биография */}
            {/* {(user.bio || isEditing) && (
              <div className="mt-4">
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="w-full bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 rounded-lg px-3 py-2 text-sm"
                    placeholder="Расскажите о себе..."
                    rows={3}
                    maxLength={500}
                  />
                ) : (
                  <p className="text-white/90 max-w-2xl">{user.bio}</p>
                )}
              </div>
            )} */}
          </div>

          {/* Кнопки действий */}
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/30 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Сохранить
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Редактировать
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.favorites}
              </div>
              <div className="text-sm text-gray-600">Избранных событий</div>
            </div>
          </div>
        </div>

        {user.role === UserRole.ORGANIZER && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.eventsCreated}
                  </div>
                  <div className="text-sm text-gray-600">Создано событий</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.eventsPublished}
                  </div>
                  <div className="text-sm text-gray-600">Опубликовано</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalViews.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Общих просмотров</div>
                </div>
              </div>
            </div>
          </>
        )}

        {user.role === UserRole.USER && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-sm text-gray-600">Посещено событий</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">4.8</div>
                  <div className="text-sm text-gray-600">Средняя оценка</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">3</div>
                  <div className="text-sm text-gray-600">Награды</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Вкладки */}
      <div className="bg-white rounded-lg border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Содержимое вкладок */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Последняя активность */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Последняя активность
                </h3>

                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div
                          className={`p-2 rounded-full bg-white ${activity.color}`}
                        >
                          <activity.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(activity.date), "d MMMM, HH:mm", {
                              locale: ru,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Пока нет активности</p>
                  </div>
                )}
              </div>

              {/* Достижения */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Достижения
                </h3>

                <div className="space-y-3">
                  {user.role === UserRole.ORGANIZER &&
                    stats.eventsCreated > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            Первое событие
                          </p>
                          <p className="text-xs text-blue-700">
                            Создали свое первое мероприятие
                          </p>
                        </div>
                      </div>
                    )}

                  {stats.favorites >= 5 && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <div className="p-2 bg-red-100 rounded-full">
                        <Heart className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-900">
                          Любитель событий
                        </p>
                        <p className="text-xs text-red-700">
                          Добавили 5+ событий в избранное
                        </p>
                      </div>
                    </div>
                  )}

                  {user.role === UserRole.ORGANIZER &&
                    stats.totalViews > 100 && (
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Eye className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-purple-900">
                            Популярный организатор
                          </p>
                          <p className="text-xs text-purple-700">
                            Ваши события просмотрели 100+ раз
                          </p>
                        </div>
                      </div>
                    )}

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Активный пользователь
                      </p>
                      <p className="text-xs text-green-700">
                        Регулярно пользуетесь платформой
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                История активности
              </h3>

              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <div
                        className={`p-3 rounded-full bg-gray-50 ${activity.color}`}
                      >
                        <activity.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(
                            new Date(activity.date),
                            "d MMMM yyyy, HH:mm",
                            {
                              locale: ru,
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Нет истории активности
                  </h3>
                  <p className="text-gray-600">
                    Начните использовать платформу, и здесь появится ваша
                    активность
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Избранные события ({favoriteEvents.length})
              </h3>

              {favoriteEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteEvents.slice(0, 6).map((event: Event) => (
                    <EventCard
                      key={event.$id}
                      event={event}
                      variant="compact"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Нет избранных событий
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Добавляйте интересные события в избранное
                  </p>
                  <a
                    href="/events"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    Найти события
                  </a>
                </div>
              )}

              {favoriteEvents.length > 6 && (
                <div className="text-center">
                  <a
                    href="/favorites"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Показать все избранные
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
