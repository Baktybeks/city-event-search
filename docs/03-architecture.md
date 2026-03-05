# Архитектура и маршруты

## Структура проекта

```
city-event-search/
├── docs/                    # Документация
├── public/                  # Статические файлы
├── scripts/
│   ├── setupCollections.js # Создание/сброс коллекций Appwrite
│   └── testConnection.js   # Проверка подключения к Appwrite
├── src/
│   ├── app/
│   │   ├── (auth)/         # Группа маршрутов: логин, регистрация
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/         # Основной layout с navbar
│   │   │   ├── admin/      # Админ-панель
│   │   │   ├── organizer/  # Панель организатора
│   │   │   ├── events/     # Список событий
│   │   │   ├── search/     # Поиск
│   │   │   ├── profile/    # Профиль
│   │   │   ├── favorites/  # Избранное
│   │   │   ├── my-events/  # Мои события
│   │   │   └── ...
│   │   ├── events/[id]/    # Публичная страница события
│   │   ├── api/            # API routes
│   │   ├── layout.tsx
│   │   ├── page.tsx        # Главная (редирект по роли)
│   │   ├── globals.css
│   │   └── providers.tsx
│   ├── components/
│   │   ├── auth/           # ProtectedRoute и др.
│   │   ├── events/         # EventCard, EventDetail, фильтры
│   │   ├── layout/         # Navbar
│   │   ├── admin/          # Компоненты админки
│   │   └── ui/             # ErrorBoundary, Loading, toast
│   ├── constants/          # appwriteConfig
│   ├── hooks/              # useAuth, useSyncAuthCookie
│   ├── services/
│   │   ├── appwriteClient.ts
│   │   ├── authService.ts
│   │   ├── eventsService.ts
│   │   └── userService.ts
│   ├── store/              # authStore (Zustand)
│   ├── types/              # User, Event, enum'ы, DTO
│   └── utils/               # dateUtils, performance
├── .env.example
├── .env.local               # Не коммитить
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Роли пользователей

| Роль | Описание |
|------|----------|
| **ADMIN** | Полный доступ: пользователи, события, настройки, аналитика |
| **ORGANIZER** | Создание и редактирование своих событий, аналитика организатора |
| **USER** | Просмотр событий, избранное, регистрация на события, профиль |

Новые пользователи (кроме первого, который становится админом) по умолчанию имеют роль USER и требуют активации администратором (`isActive: true`).

## Маршруты и доступ

### Публичные (без авторизации)

| Путь | Описание |
|------|----------|
| `/` | Главная (для гостя — лендинг/каталог; для авторизованного — редирект по роли) |
| `/events` | Каталог событий |
| `/search` | Поиск событий |
| `/events/[id]` | Страница события |

### Для авторизованных (любая роль)

| Путь | Описание |
|------|----------|
| `/profile` | Профиль пользователя |
| `/favorites` | Избранные события |
| `/my-events` | События, на которые пользователь зарегистрирован |

### Организатор (и админ)

| Путь | Описание |
|------|----------|
| `/organizer` | Дашборд организатора |
| `/organizer/create` | Создание события |
| `/organizer/events/[id]/edit` | Редактирование события |
| `/organizer/analytics` | Аналитика |
| `/organizer/settings` | Настройки организатора |

### Только администратор

| Путь | Описание |
|------|----------|
| `/admin` | Дашборд админа |
| `/admin/users` | Управление пользователями |
| `/admin/events` | Управление всеми событиями |
| `/admin/analytics` | Аналитика системы |
| `/admin/settings` | Настройки системы |

### Авторизация

| Путь | Описание |
|------|----------|
| `/login` | Вход |
| `/register` | Регистрация |

## Middleware и редиректы

Файл `src/middleware.ts`:

- Читает cookie `auth-storage` и определяет текущего пользователя и роль.
- Публичные пути (`/`, `/events`, `/search`, `/events/*`) доступны всем.
- `/login` и `/register`: если пользователь уже авторизован и активен — редирект по роли.
- Остальные защищённые пути: при отсутствии авторизации или неактивном аккаунте — редирект на `/login`.
- Доступ к `/admin` только для роли ADMIN, к `/organizer` — для ADMIN и ORGANIZER.
- После входа редирект: ADMIN → `/admin`, ORGANIZER → `/organizer`, USER → `/`.

## Ключевые сервисы

- **authService** — регистрация, вход, выход, получение текущего пользователя, активация/деактивация (админ).
- **eventsService** — CRUD событий, избранное, регистрации, просмотры, списки для админа и организатора.
- **userService** — работа с пользователями (при необходимости).
- **appwriteClient** — общий клиент Appwrite (Account, Databases, Storage).

Типы и константы: `src/types/index.ts`, `src/constants/appwriteConfig.ts`.
