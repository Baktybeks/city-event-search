# Модели данных

Типы и интерфейсы определены в `src/types/index.ts`. Коллекции Appwrite соответствуют этим моделям.

## Роли и статусы

### UserRole

| Значение | Описание |
|----------|----------|
| `ADMIN` | Администратор |
| `ORGANIZER` | Организатор событий |
| `USER` | Обычный пользователь |

### EventStatus

| Значение | Описание |
|----------|----------|
| `DRAFT` | Черновик (не опубликовано) |
| `PUBLISHED` | Опубликовано |
| `CANCELLED` | Отменено |
| `COMPLETED` | Завершено |

### EventCategory

Концерт, выставка, театр, мастер-класс, фестиваль, спорт, конференция, вечеринка, еда, другое. Полный список — в `EventCategory` и `EventCategoryLabels` в `src/types/index.ts`.

---

## Коллекции

### users

Профиль пользователя (связан с Appwrite Auth по `$id`).

| Поле | Тип | Описание |
|------|-----|----------|
| name | string | Имя |
| email | string (email) | Email (уникальный) |
| role | enum | ADMIN / ORGANIZER / USER |
| isActive | boolean | Активирован ли аккаунт (для входа) |
| avatar | url (opt) | Ссылка на аватар |
| phone | string (opt) | Телефон |
| bio | string (opt) | О себе |
| createdAt | datetime | Дата создания (кастомный атрибут при необходимости) |

Индексы: `email` (unique), `role`, `isActive`.

---

### events

| Поле | Тип | Описание |
|------|-----|----------|
| title | string | Название |
| description | string | Описание |
| category | enum | Категория события |
| startDate | datetime | Начало |
| endDate | datetime (opt) | Окончание |
| location | string | Место (название) |
| address | string | Адрес |
| organizer | string | ID пользователя (organizer) |
| price | integer (opt) | Цена |
| isFree | boolean | Бесплатное |
| maxAttendees | integer (opt) | Макс. участников |
| registrationRequired | boolean | Нужна регистрация |
| registrationUrl | url (opt) | Ссылка на регистрацию |
| ticketUrl | url (opt) | Ссылка на билеты |
| imageUrl | url (opt) | Изображение |
| tags | string[] | Теги |
| status | enum | DRAFT / PUBLISHED / CANCELLED / COMPLETED |
| viewCount | integer | Счётчик просмотров |
| likes | integer | Лайки |
| featured | boolean | Рекомендуемое |
| createdAt | datetime | Дата создания |

Индексы: organizer, category, status, startDate, isFree, featured, location, viewCount.

---

### registrations

Регистрация пользователя на событие.

| Поле | Тип | Описание |
|------|-----|----------|
| eventId | string | ID события |
| userId | string | ID пользователя |
| registeredAt | datetime | Время регистрации |
| status | enum | registered / attended / cancelled |

Уникальный индекс: пара (eventId, userId).

---

### favorites

Избранные события пользователя.

| Поле | Тип | Описание |
|------|-----|----------|
| userId | string | ID пользователя |
| eventId | string | ID события |
| createdAt | datetime | Когда добавлено |

Уникальный индекс: пара (userId, eventId).

---

### views

Просмотры события (аналитика).

| Поле | Тип | Описание |
|------|-----|----------|
| eventId | string | ID события |
| userId | string (opt) | ID пользователя (если авторизован) |
| viewedAt | datetime | Время просмотра |
| ipAddress | string (opt) | IP |

Индексы: eventId, userId, viewedAt.

---

## DTO и вспомогательные типы

- **CreateEventDto** — поля для создания события (без organizer, status, viewCount, likes, featured).
- **UpdateEventDto** — частичное обновление + опционально `status`.
- **EventFilters** — фильтры поиска: search, category, isFree, startDate, endDate, location, featured, status.
- **EventWithDetails** — событие + organizerInfo, isUserRegistered, isUserFavorite, registrationCount.

Вспомогательные функции в `src/types/index.ts`: `getRoleLabel`, `getCategoryLabel`, `getStatusLabel`, `formatPrice`, `isEventPast`, `isEventToday`, `isEventUpcoming`.
