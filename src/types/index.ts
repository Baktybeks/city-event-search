export enum UserRole {
  ADMIN = "ADMIN",
  ORGANIZER = "ORGANIZER",
  USER = "USER",
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Администратор",
  [UserRole.ORGANIZER]: "Организатор",
  [UserRole.USER]: "Пользователь",
};

export const UserRoleColors: Record<UserRole, string> = {
  [UserRole.ADMIN]: "bg-red-100 text-red-800",
  [UserRole.ORGANIZER]: "bg-blue-100 text-blue-800",
  [UserRole.USER]: "bg-green-100 text-green-800",
};

export enum EventCategory {
  CONCERT = "CONCERT",
  EXHIBITION = "EXHIBITION",
  THEATER = "THEATER",
  WORKSHOP = "WORKSHOP",
  FESTIVAL = "FESTIVAL",
  SPORT = "SPORT",
  CONFERENCE = "CONFERENCE",
  PARTY = "PARTY",
  FOOD = "FOOD",
  OTHER = "OTHER",
}

export const EventCategoryLabels: Record<EventCategory, string> = {
  [EventCategory.CONCERT]: "Концерт",
  [EventCategory.EXHIBITION]: "Выставка",
  [EventCategory.THEATER]: "Театр",
  [EventCategory.WORKSHOP]: "Мастер-класс",
  [EventCategory.FESTIVAL]: "Фестиваль",
  [EventCategory.SPORT]: "Спорт",
  [EventCategory.CONFERENCE]: "Конференция",
  [EventCategory.PARTY]: "Вечеринка",
  [EventCategory.FOOD]: "Еда",
  [EventCategory.OTHER]: "Другое",
};

export const EventCategoryIcons: Record<EventCategory, string> = {
  [EventCategory.CONCERT]: "🎵",
  [EventCategory.EXHIBITION]: "🎨",
  [EventCategory.THEATER]: "🎭",
  [EventCategory.WORKSHOP]: "🛠️",
  [EventCategory.FESTIVAL]: "🎉",
  [EventCategory.SPORT]: "⚽",
  [EventCategory.CONFERENCE]: "🎯",
  [EventCategory.PARTY]: "🥳",
  [EventCategory.FOOD]: "🍕",
  [EventCategory.OTHER]: "📅",
};

export enum EventStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export const EventStatusLabels: Record<EventStatus, string> = {
  [EventStatus.DRAFT]: "Ожидаемый",
  [EventStatus.PUBLISHED]: "Опубликовано",
  [EventStatus.CANCELLED]: "Отменено",
  [EventStatus.COMPLETED]: "Завершено",
};

export interface BaseDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
}

export interface User extends BaseDocument {
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  phone?: string;
  bio?: string;
}

export interface Event extends BaseDocument {
  title: string;
  description: string;
  category: EventCategory;
  startDate: string;
  endDate?: string;
  location: string;
  address: string;
  organizer: string; // ID пользователя
  price?: number;
  isFree: boolean;
  maxAttendees?: number;
  registrationRequired: boolean;
  registrationUrl?: string;
  ticketUrl?: string;
  imageUrl?: string;
  tags: string[];
  status: EventStatus;
  viewCount: number;
  likes: number;
  featured: boolean;
}

export interface EventRegistration extends BaseDocument {
  eventId: string;
  userId: string;
  registeredAt: string;
  status: "registered" | "attended" | "cancelled";
}

export interface UserFavorite extends BaseDocument {
  userId: string;
  eventId: string;
}

export interface EventView extends BaseDocument {
  eventId: string;
  userId?: string;
  viewedAt: string;
  ipAddress?: string;
}

// DTOs
export interface CreateEventDto {
  title: string;
  description: string;
  category: EventCategory;
  startDate: string;
  endDate?: string;
  location: string;
  address: string;
  price?: number;
  isFree: boolean;
  maxAttendees?: number;
  registrationRequired: boolean;
  registrationUrl?: string;
  ticketUrl?: string;
  imageUrl?: string;
  tags: string[];
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
  status?: EventStatus;
}

export interface EventFilters {
  search?: string;
  category?: EventCategory;
  isFree?: boolean;
  startDate?: string;
  endDate?: string;
  location?: string;
  featured?: boolean;
  status?: EventStatus;
}

export interface EventWithDetails extends Event {
  organizerInfo?: User;
  isUserRegistered?: boolean;
  isUserFavorite?: boolean;
  registrationCount?: number;
}

// Utility functions
export const getRoleLabel = (role: UserRole): string => {
  return UserRoleLabels[role] || role;
};

export const getRoleColor = (role: UserRole): string => {
  return UserRoleColors[role] || "bg-gray-100 text-gray-800";
};

export const getCategoryLabel = (category: EventCategory): string => {
  return EventCategoryLabels[category] || category;
};

export const getCategoryIcon = (category: EventCategory): string => {
  return EventCategoryIcons[category] || "📅";
};

export const getStatusLabel = (status: EventStatus): string => {
  return EventStatusLabels[status] || status;
};

export const formatPrice = (
  price: number | undefined,
  isFree: boolean
): string => {
  if (isFree) return "Бесплатно";
  if (!price) return "Цена не указана";
  return `${price} сом`;
};

export const isEventPast = (
  endDate: string | undefined,
  startDate: string
): boolean => {
  const eventDate = endDate ? new Date(endDate) : new Date(startDate);
  return eventDate < new Date();
};

export const isEventToday = (startDate: string): boolean => {
  const eventDate = new Date(startDate);
  const today = new Date();
  return eventDate.toDateString() === today.toDateString();
};

export const isEventUpcoming = (startDate: string): boolean => {
  const eventDate = new Date(startDate);
  const today = new Date();
  return eventDate > today;
};
