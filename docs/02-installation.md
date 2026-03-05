# Установка и настройка

## 1. Установка зависимостей

```bash
npm install
```

## 2. Переменные окружения

Скопируйте пример и создайте локальный конфиг:

```bash
cp .env.example .env.local
```

Откройте `.env.local` и заполните значения. Для работы приложения нужны следующие переменные.

### Обязательные (Appwrite)

| Переменная | Описание | Пример |
|------------|----------|--------|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | URL API Appwrite | `https://cloud.appwrite.io/v1` |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | ID проекта в Appwrite Console | строка из консоли |
| `NEXT_PUBLIC_APPWRITE_DATABASE_ID` | ID базы данных | строка из консоли |
| `NEXT_PUBLIC_APPWRITE_STORAGE_ID` | ID хранилища файлов | строка из консоли |
| `APPWRITE_API_KEY` | API-ключ (для скриптов и серверных операций) | секретный ключ из консоли |

### ID коллекций

После выполнения `npm run db:setup` в Appwrite Console появятся коллекции. Их ID можно подставить в `.env.local` (или оставить значения по умолчанию, если скрипт создаёт коллекции с именами из конфига):

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `NEXT_PUBLIC_USERS_COLLECTION_ID` | Коллекция пользователей | `users` |
| `NEXT_PUBLIC_EVENTS_COLLECTION_ID` | Коллекция событий | `events` |
| `NEXT_PUBLIC_REGISTRATIONS_COLLECTION_ID` | Регистрации на события | `registrations` |
| `NEXT_PUBLIC_FAVORITES_COLLECTION_ID` | Избранное | `favorites` |
| `NEXT_PUBLIC_VIEWS_COLLECTION_ID` | Просмотры событий | `views` |

### Пример заполненного `.env.local`

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=64a1b2c3d4e5f6789012345
NEXT_PUBLIC_APPWRITE_DATABASE_ID=64a1b2c3d4e5f6789012346
NEXT_PUBLIC_APPWRITE_STORAGE_ID=64a1b2c3d4e5f6789012347
APPWRITE_API_KEY=your_api_key_here

NEXT_PUBLIC_USERS_COLLECTION_ID=users
NEXT_PUBLIC_EVENTS_COLLECTION_ID=events
NEXT_PUBLIC_REGISTRATIONS_COLLECTION_ID=registrations
NEXT_PUBLIC_FAVORITES_COLLECTION_ID=favorites
NEXT_PUBLIC_VIEWS_COLLECTION_ID=views

NODE_ENV=development
```

Важно: после изменения `.env.local` нужно перезапустить `npm run dev`.

## 3. Настройка Appwrite

В [Appwrite Console](https://cloud.appwrite.io):

1. Создайте проект, получите **Project ID**.
2. Включите **Auth** → настройте провайдер (например, Email/Password).
3. Создайте **Database** и **Storage**, скопируйте их ID.
4. Создайте **API Key** с правами на Database и Storage (для скриптов `db:setup`, `db:reset` и т.д.).

## 4. Инициализация базы данных

Проверка подключения:

```bash
npm run db:test
```

Создание коллекций, атрибутов и индексов:

```bash
npm run db:setup
```

Подробнее о скриптах — в [Скрипты и база данных](05-scripts-database.md).

## 5. Запуск

Режим разработки:

```bash
npm run dev
```

Приложение будет доступно по адресу: **http://localhost:3000**

Сборка для production:

```bash
npm run build
npm run start
```
