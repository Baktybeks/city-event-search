// src/components/layout/Navbar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import {
  Menu,
  X,
  Search,
  Calendar,
  User,
  Settings,
  LogOut,
  Heart,
  Plus,
  Home,
  Users,
} from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  const navigation = [
    { name: "Главная", href: "/", icon: Home },
    { name: "События", href: "/events", icon: Calendar },
    { name: "Поиск", href: "/search", icon: Search },
  ];

  const userNavigation = [
    { name: "Профиль", href: "/profile", icon: User },
    { name: "Избранное", href: "/favorites", icon: Heart },
  ];

  if (user?.role === UserRole.ORGANIZER) {
    userNavigation.unshift({
      name: "Мои события",
      href: "/organizer",
      icon: Calendar,
    });
    userNavigation.unshift({
      name: "Создать событие",
      href: "/organizer/create",
      icon: Plus,
    });
  }

  if (user?.role === UserRole.ADMIN) {
    userNavigation.unshift({
      name: "Админ-панель",
      href: "/admin",
      icon: Settings,
    });
    userNavigation.unshift({
      name: "Пользователи",
      href: "/admin/users",
      icon: Users,
    });
  }

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Логотип */}
            <Link href="/" className="flex items-center">
              <div className="text-2xl font-bold text-gradient-primary">
                🎉 EventCity
              </div>
            </Link>

            {/* Навигация для десктопа */}
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-1 pt-1 text-sm font-medium nav-item ${
                      pathname === item.href
                        ? "text-blue-600 active"
                        : "text-gray-900 hover:text-blue-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Правая часть навигации */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Профиль пользователя */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user.name}
                    </span>
                  </button>

                  {/* Выпадающее меню профиля */}
                  {isProfileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-blue-600 mt-1">
                            {user.role === UserRole.ADMIN
                              ? "Администратор"
                              : user.role === UserRole.ORGANIZER
                              ? "Организатор"
                              : "Пользователь"}
                          </p>
                        </div>

                        <div className="py-1">
                          {userNavigation.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <Icon className="h-4 w-4" />
                                {item.name}
                              </Link>
                            );
                          })}

                          <hr className="my-1" />

                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Выйти
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Кнопки входа и регистрации */}
                <Link
                  href="/login"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Регистрация
                </Link>
              </>
            )}

            {/* Мобильное меню */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                    pathname === item.href
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-900 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}

            {isAuthenticated && user && (
              <>
                <hr className="my-2" />
                {userNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-base font-medium text-red-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Выйти
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
