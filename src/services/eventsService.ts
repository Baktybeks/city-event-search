import { appwriteConfig } from "@/constants/appwriteConfig";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { Databases, Query, ID } from "appwrite";
import {
  Event,
  EventFilters,
  CreateEventDto,
  UpdateEventDto,
  EventWithDetails,
  EventStatus,
  EventCategory,
  UserFavorite,
  EventRegistration,
  EventView,
} from "@/types";
import { databases } from "./appwriteClient";

const { databaseId: DATABASE_ID, collections } = appwriteConfig;

export const eventsApi = {
  // Получение всех событий с фильтрацией
  getEvents: async (filters?: EventFilters, limit = 20, offset = 0) => {
    try {
      const queries = [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc("$createdAt"),
        Query.equal("status", EventStatus.PUBLISHED),
      ];

      // Поиск по тексту - ищем в title, description
      if (filters?.search) {
        const searchTerm = filters.search.trim();
        if (searchTerm) {
          // Используем OR запрос для поиска по нескольким полям
          // Сначала попробуем поиск по title
          try {
            queries.push(Query.search("title", searchTerm));
          } catch (error) {
            console.warn(
              "Fulltext поиск недоступен, используем альтернативный метод"
            );
            // Если fulltext недоступен, используем contains (работает не для всех случаев)
            // В продакшене лучше настроить fulltext индексы
            queries.push(Query.contains("title", searchTerm));
          }
        }
      }

      if (filters?.category) {
        queries.push(Query.equal("category", filters.category));
      }

      if (filters?.isFree !== undefined) {
        queries.push(Query.equal("isFree", filters.isFree));
      }

      if (filters?.startDate) {
        queries.push(Query.greaterThanEqual("startDate", filters.startDate));
      }

      if (filters?.endDate) {
        queries.push(Query.lessThanEqual("startDate", filters.endDate));
      }

      // Для поиска по локации тоже используем fulltext или contains
      if (filters?.location) {
        try {
          queries.push(Query.search("location", filters.location));
        } catch (error) {
          queries.push(Query.contains("location", filters.location));
        }
      }

      if (filters?.featured) {
        queries.push(Query.equal("featured", filters.featured));
      }

      const result = await databases.listDocuments(
        DATABASE_ID,
        collections.events,
        queries
      );

      return {
        events: result.documents as unknown as Event[],
        total: result.total,
      };
    } catch (error) {
      console.error("Ошибка при получении событий:", error);
      throw error;
    }
  },

  // Получение популярных событий
  getFeaturedEvents: async (limit = 6) => {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        collections.events,
        [
          Query.equal("status", EventStatus.PUBLISHED),
          Query.equal("featured", true),
          Query.limit(limit),
          Query.orderDesc("viewCount"),
        ]
      );

      return result.documents as unknown as Event[];
    } catch (error) {
      console.error("Ошибка при получении популярных событий:", error);
      throw error;
    }
  },

  // Получение событий по категории
  getEventsByCategory: async (category: EventCategory, limit = 10) => {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        collections.events,
        [
          Query.equal("status", EventStatus.PUBLISHED),
          Query.equal("category", category),
          Query.limit(limit),
          Query.orderDesc("startDate"),
        ]
      );

      return result.documents as unknown as Event[];
    } catch (error) {
      console.error("Ошибка при получении событий по категории:", error);
      throw error;
    }
  },

  // Получение события по ID с дополнительной информацией
  getEventById: async (
    eventId: string,
    userId?: string
  ): Promise<EventWithDetails> => {
    try {
      const event = (await databases.getDocument(
        DATABASE_ID,
        collections.events,
        eventId
      )) as unknown as Event;

      // Получаем информацию об организаторе
      const organizerInfo = await databases.getDocument(
        DATABASE_ID,
        collections.users,
        event.organizer
      );

      let isUserRegistered = false;
      let isUserFavorite = false;
      let registrationCount = 0;

      // Если пользователь авторизован, проверяем его связи с событием
      if (userId) {
        // Проверяем регистрацию
        const registrations = await databases.listDocuments(
          DATABASE_ID,
          collections.registrations,
          [
            Query.equal("eventId", eventId),
            Query.equal("userId", userId),
            Query.equal("status", "registered"),
          ]
        );
        isUserRegistered = registrations.total > 0;

        // Проверяем избранное
        const favorites = await databases.listDocuments(
          DATABASE_ID,
          collections.favorites,
          [Query.equal("eventId", eventId), Query.equal("userId", userId)]
        );
        isUserFavorite = favorites.total > 0;
      }

      // Получаем количество регистраций
      const allRegistrations = await databases.listDocuments(
        DATABASE_ID,
        collections.registrations,
        [Query.equal("eventId", eventId), Query.equal("status", "registered")]
      );
      registrationCount = allRegistrations.total;

      return {
        ...event,
        organizerInfo: organizerInfo as unknown as any,
        isUserRegistered,
        isUserFavorite,
        registrationCount,
      };
    } catch (error) {
      console.error("Ошибка при получении события:", error);
      throw error;
    }
  },

  // Создание события
  createEvent: async (
    eventData: CreateEventDto,
    organizerId: string
  ): Promise<Event> => {
    try {
      const newEvent = {
        ...eventData,
        organizer: organizerId,
        status: EventStatus.DRAFT,
        viewCount: 0,
        likes: 0,
        featured: false,
        createdAt: new Date().toISOString(),
      };

      const result = await databases.createDocument(
        DATABASE_ID,
        collections.events,
        ID.unique(),
        newEvent
      );

      return result as unknown as Event;
    } catch (error) {
      console.error("Ошибка при создании события:", error);
      throw error;
    }
  },

  // Обновление события
  updateEvent: async (
    eventId: string,
    updates: UpdateEventDto
  ): Promise<Event> => {
    try {
      const result = await databases.updateDocument(
        DATABASE_ID,
        collections.events,
        eventId,
        updates
      );

      return result as unknown as Event;
    } catch (error) {
      console.error("Ошибка при обновлении события:", error);
      throw error;
    }
  },

  // Удаление события
  deleteEvent: async (eventId: string): Promise<void> => {
    try {
      await databases.deleteDocument(DATABASE_ID, collections.events, eventId);
    } catch (error) {
      console.error("Ошибка при удалении события:", error);
      throw error;
    }
  },

  // Получение событий организатора
  getOrganizerEvents: async (organizerId: string) => {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        collections.events,
        [Query.equal("organizer", organizerId), Query.orderDesc("$createdAt")]
      );

      return result.documents as unknown as Event[];
    } catch (error) {
      console.error("Ошибка при получении событий организатора:", error);
      throw error;
    }
  },

  // Регистрация на событие
  registerForEvent: async (
    eventId: string,
    userId: string
  ): Promise<EventRegistration> => {
    try {
      const registrationData = {
        eventId,
        userId,
        registeredAt: new Date().toISOString(),
        status: "registered" as const,
      };

      const result = await databases.createDocument(
        DATABASE_ID,
        collections.registrations,
        ID.unique(),
        registrationData
      );

      return result as unknown as EventRegistration;
    } catch (error) {
      console.error("Ошибка при регистрации на событие:", error);
      throw error;
    }
  },

  // Отмена регистрации
  unregisterFromEvent: async (
    eventId: string,
    userId: string
  ): Promise<void> => {
    try {
      const registrations = await databases.listDocuments(
        DATABASE_ID,
        collections.registrations,
        [Query.equal("eventId", eventId), Query.equal("userId", userId)]
      );

      if (registrations.documents.length > 0) {
        await databases.deleteDocument(
          DATABASE_ID,
          collections.registrations,
          registrations.documents[0].$id
        );
      }
    } catch (error) {
      console.error("Ошибка при отмене регистрации:", error);
      throw error;
    }
  },

  // Добавление в избранное
  addToFavorites: async (
    eventId: string,
    userId: string
  ): Promise<UserFavorite> => {
    try {
      const favoriteData = {
        eventId,
        userId,
        createdAt: new Date().toISOString(),
      };

      const result = await databases.createDocument(
        DATABASE_ID,
        collections.favorites,
        ID.unique(),
        favoriteData
      );

      return result as unknown as UserFavorite;
    } catch (error) {
      console.error("Ошибка при добавлении в избранное:", error);
      throw error;
    }
  },

  // Удаление из избранного
  removeFromFavorites: async (
    eventId: string,
    userId: string
  ): Promise<void> => {
    try {
      const favorites = await databases.listDocuments(
        DATABASE_ID,
        collections.favorites,
        [Query.equal("eventId", eventId), Query.equal("userId", userId)]
      );

      if (favorites.documents.length > 0) {
        await databases.deleteDocument(
          DATABASE_ID,
          collections.favorites,
          favorites.documents[0].$id
        );
      }
    } catch (error) {
      console.error("Ошибка при удалении из избранного:", error);
      throw error;
    }
  },

  // Получение избранных событий пользователя
  getUserFavorites: async (userId: string) => {
    try {
      const favorites = await databases.listDocuments(
        DATABASE_ID,
        collections.favorites,
        [Query.equal("userId", userId)]
      );

      const eventIds = favorites.documents.map((fav) => fav.eventId);

      if (eventIds.length === 0) return [];

      const events = await databases.listDocuments(
        DATABASE_ID,
        collections.events,
        [Query.equal("$id", eventIds)]
      );

      return events.documents as unknown as Event[];
    } catch (error) {
      console.error("Ошибка при получении избранных событий:", error);
      throw error;
    }
  },
  getAllEventsForAdmin: async (
    filters?: EventFilters,
    limit = 20,
    offset = 0
  ) => {
    try {
      const queries = [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc("$createdAt"),
        // НЕ фильтруем по статусу - показываем все события
      ];

      if (filters?.search) {
        queries.push(Query.search("title", filters.search));
      }

      if (filters?.category) {
        queries.push(Query.equal("category", filters.category));
      }

      if (filters?.isFree !== undefined) {
        queries.push(Query.equal("isFree", filters.isFree));
      }

      if (filters?.startDate) {
        queries.push(Query.greaterThanEqual("startDate", filters.startDate));
      }

      if (filters?.endDate) {
        queries.push(Query.lessThanEqual("startDate", filters.endDate));
      }

      if (filters?.location) {
        queries.push(Query.search("location", filters.location));
      }

      if (filters?.featured) {
        queries.push(Query.equal("featured", filters.featured));
      }

      // Фильтр по статусу (если указан)
      if (filters?.status) {
        queries.push(Query.equal("status", filters.status));
      }

      const result = await databases.listDocuments(
        DATABASE_ID,
        collections.events,
        queries
      );

      return {
        events: result.documents as unknown as Event[],
        total: result.total,
      };
    } catch (error) {
      console.error("Ошибка при получении событий для админа:", error);
      throw error;
    }
  },
  publishEvent: async (eventId: string): Promise<Event> => {
    try {
      const result = await databases.updateDocument(
        DATABASE_ID,
        collections.events,
        eventId,
        { status: EventStatus.PUBLISHED }
      );

      console.log("✅ Событие опубликовано:", result.title);
      return result as unknown as Event;
    } catch (error) {
      console.error("Ошибка при публикации события:", error);
      throw error;
    }
  },

  // Снятие с публикации
  unpublishEvent: async (eventId: string): Promise<Event> => {
    try {
      const result = await databases.updateDocument(
        DATABASE_ID,
        collections.events,
        eventId,
        { status: EventStatus.DRAFT }
      );

      console.log("✅ Событие снято с публикации:", result.title);
      return result as unknown as Event;
    } catch (error) {
      console.error("Ошибка при снятии с публикации:", error);
      throw error;
    }
  },

  // Отмена события
  cancelEvent: async (eventId: string): Promise<Event> => {
    try {
      const result = await databases.updateDocument(
        DATABASE_ID,
        collections.events,
        eventId,
        { status: EventStatus.CANCELLED }
      );

      console.log("✅ Событие отменено:", result.title);
      return result as unknown as Event;
    } catch (error) {
      console.error("Ошибка при отмене события:", error);
      throw error;
    }
  },

  // Завершение события
  completeEvent: async (eventId: string): Promise<Event> => {
    try {
      const result = await databases.updateDocument(
        DATABASE_ID,
        collections.events,
        eventId,
        { status: EventStatus.COMPLETED }
      );

      console.log("✅ Событие завершено:", result.title);
      return result as unknown as Event;
    } catch (error) {
      console.error("Ошибка при завершении события:", error);
      throw error;
    }
  },

  // Переключение featured статуса
  toggleEventFeatured: async (
    eventId: string,
    featured: boolean
  ): Promise<Event> => {
    try {
      const result = await databases.updateDocument(
        DATABASE_ID,
        collections.events,
        eventId,
        { featured }
      );

      console.log(
        `✅ Событие ${featured ? "добавлено в" : "убрано из"} рекомендуемых:`,
        result.title
      );
      return result as unknown as Event;
    } catch (error) {
      console.error("Ошибка при изменении featured статуса:", error);
      throw error;
    }
  },
  // Регистрация просмотра события
  recordEventView: async (
    eventId: string,
    userId?: string,
    ipAddress?: string
  ): Promise<void> => {
    try {
      const viewData = {
        eventId,
        viewedAt: new Date().toISOString(),
        ...(userId && { userId }),
        ...(ipAddress && { ipAddress }),
      };

      await databases.createDocument(
        DATABASE_ID,
        collections.views,
        ID.unique(),
        viewData
      );

      // Увеличиваем счетчик просмотров события
      const event = await databases.getDocument(
        DATABASE_ID,
        collections.events,
        eventId
      );
      await databases.updateDocument(DATABASE_ID, collections.events, eventId, {
        viewCount: (event.viewCount || 0) + 1,
      });
    } catch (error) {
      console.error("Ошибка при регистрации просмотра:", error);
      // Не выбрасываем ошибку, чтобы не нарушать основной поток
    }
  },
};

// Ключи для React Query
export const eventsKeys = {
  adminList: (filters?: EventFilters) =>
    [...eventsKeys.all, "admin-list", filters] as const,
  all: ["events"] as const,
  lists: () => [...eventsKeys.all, "list"] as const,
  list: (filters?: EventFilters) => [...eventsKeys.lists(), filters] as const,
  details: () => [...eventsKeys.all, "detail"] as const,
  detail: (id: string) => [...eventsKeys.details(), id] as const,
  featured: () => [...eventsKeys.all, "featured"] as const,
  category: (category: EventCategory) =>
    [...eventsKeys.all, "category", category] as const,
  organizer: (organizerId: string) =>
    [...eventsKeys.all, "organizer", organizerId] as const,
  favorites: (userId: string) =>
    [...eventsKeys.all, "favorites", userId] as const,
};

// React Query хуки
export const useEvents = (filters?: EventFilters) => {
  return useInfiniteQuery({
    queryKey: eventsKeys.list(filters),
    queryFn: ({ pageParam = 0 }) =>
      eventsApi.getEvents(filters, 20, pageParam * 20),
    getNextPageParam: (lastPage, pages) => {
      const totalLoaded = pages.length * 20;
      return totalLoaded < lastPage.total ? pages.length : undefined;
    },
    initialPageParam: 0,
  });
};

export const useFeaturedEvents = () => {
  return useQuery({
    queryKey: eventsKeys.featured(),
    queryFn: () => eventsApi.getFeaturedEvents(),
    staleTime: 1000 * 60 * 10, // 10 минут
  });
};

export const useEventsByCategory = (category: EventCategory) => {
  return useQuery({
    queryKey: eventsKeys.category(category),
    queryFn: () => eventsApi.getEventsByCategory(category),
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

export const useEvent = (eventId: string, userId?: string) => {
  return useQuery({
    queryKey: eventsKeys.detail(eventId),
    queryFn: () => eventsApi.getEventById(eventId, userId),
    enabled: !!eventId,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventData,
      organizerId,
    }: {
      eventData: CreateEventDto;
      organizerId: string;
    }) => eventsApi.createEvent(eventData, organizerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      updates,
    }: {
      eventId: string;
      updates: UpdateEventDto;
    }) => eventsApi.updateEvent(eventId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: eventsKeys.detail(variables.eventId),
      });
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
    },
  });
};

export const useOrganizerEvents = (organizerId: string) => {
  return useQuery({
    queryKey: eventsKeys.organizer(organizerId),
    queryFn: () => eventsApi.getOrganizerEvents(organizerId),
    enabled: !!organizerId,
  });
};

export const useRegisterForEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      eventsApi.registerForEvent(eventId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: eventsKeys.detail(variables.eventId),
      });
    },
  });
};

export const useUnregisterFromEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      eventsApi.unregisterFromEvent(eventId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: eventsKeys.detail(variables.eventId),
      });
    },
  });
};

export const useAddToFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      eventsApi.addToFavorites(eventId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: eventsKeys.detail(variables.eventId),
      });
      queryClient.invalidateQueries({
        queryKey: eventsKeys.favorites(variables.userId),
      });
    },
  });
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      eventsApi.removeFromFavorites(eventId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: eventsKeys.detail(variables.eventId),
      });
      queryClient.invalidateQueries({
        queryKey: eventsKeys.favorites(variables.userId),
      });
    },
  });
};

export const useUserFavorites = (userId: string) => {
  return useQuery({
    queryKey: eventsKeys.favorites(userId),
    queryFn: () => eventsApi.getUserFavorites(userId),
    enabled: !!userId,
  });
};

export const useAdminEvents = (filters?: EventFilters) => {
  return useInfiniteQuery({
    queryKey: eventsKeys.adminList(filters),
    queryFn: ({ pageParam = 0 }) =>
      eventsApi.getAllEventsForAdmin(filters, 20, pageParam * 20),
    getNextPageParam: (lastPage, pages) => {
      const totalLoaded = pages.length * 20;
      return totalLoaded < lastPage.total ? pages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 0, // Данные считаются устаревшими сразу
    gcTime: 0, // Не кешируем данные в garbage collection
    refetchOnMount: true, // Всегда перезапрашиваем при монтировании
    refetchOnWindowFocus: true, // Перезапрашиваем при фокусе окна
    refetchOnReconnect: true, // Перезапрашиваем при восстановлении сети
    retry: false,
  });
};

export const usePublishEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.publishEvent(eventId),
    onSuccess: (updatedEvent, eventId) => {
      console.log("✅ Событие опубликовано, обновляем кеш");

      // Инвалидируем ВСЕ связанные кеши
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventsKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: eventsKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventsKeys.featured() });

      // Также обновляем данные напрямую в кеше админских событий
      queryClient.setQueriesData(
        { queryKey: eventsKeys.adminList() },
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              events: page.events.map((event: any) =>
                event.$id === eventId
                  ? { ...event, status: EventStatus.PUBLISHED }
                  : event
              ),
            })),
          };
        }
      );
    },
    onError: (error) => {
      console.error("❌ Ошибка публикации:", error);
    },
  });
};

export const useUnpublishEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.unpublishEvent(eventId),
    onSuccess: (updatedEvent, eventId) => {
      console.log("✅ Событие снято с публикации, обновляем кеш");

      // Инвалидируем ВСЕ связанные кеши
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventsKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: eventsKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventsKeys.featured() });

      // Обновляем данные напрямую в кеше
      queryClient.setQueriesData(
        { queryKey: eventsKeys.adminList() },
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              events: page.events.map((event: any) =>
                event.$id === eventId
                  ? { ...event, status: EventStatus.DRAFT }
                  : event
              ),
            })),
          };
        }
      );
    },
    onError: (error) => {
      console.error("❌ Ошибка снятия с публикации:", error);
    },
  });
};

export const useCancelEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.cancelEvent(eventId),
    onSuccess: (updatedEvent, eventId) => {
      console.log("✅ Событие отменено, обновляем кеш");

      // Инвалидируем ВСЕ связанные кеши
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventsKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: eventsKeys.detail(eventId) });

      // Обновляем данные напрямую в кеше
      queryClient.setQueriesData(
        { queryKey: eventsKeys.adminList() },
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              events: page.events.map((event: any) =>
                event.$id === eventId
                  ? { ...event, status: EventStatus.CANCELLED }
                  : event
              ),
            })),
          };
        }
      );
    },
    onError: (error) => {
      console.error("❌ Ошибка отмены события:", error);
    },
  });
};

export const useCompleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.completeEvent(eventId),
    onSuccess: (updatedEvent, eventId) => {
      console.log("✅ Событие завершено, обновляем кеш");

      // Инвалидируем ВСЕ связанные кеши
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventsKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: eventsKeys.detail(eventId) });

      // Обновляем данные напрямую в кеше
      queryClient.setQueriesData(
        { queryKey: eventsKeys.adminList() },
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              events: page.events.map((event: any) =>
                event.$id === eventId
                  ? { ...event, status: EventStatus.COMPLETED }
                  : event
              ),
            })),
          };
        }
      );
    },
    onError: (error) => {
      console.error("❌ Ошибка завершения события:", error);
    },
  });
};

export const useToggleEventFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      featured,
    }: {
      eventId: string;
      featured: boolean;
    }) => eventsApi.toggleEventFeatured(eventId, featured),
    onSuccess: (updatedEvent, { eventId, featured }) => {
      console.log(`✅ Статус featured изменен на ${featured}, обновляем кеш`);

      // Инвалидируем ВСЕ связанные кеши
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventsKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: eventsKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventsKeys.featured() });

      // Обновляем данные напрямую в кеше
      queryClient.setQueriesData(
        { queryKey: eventsKeys.adminList() },
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              events: page.events.map((event: any) =>
                event.$id === eventId ? { ...event, featured } : event
              ),
            })),
          };
        }
      );
    },
    onError: (error) => {
      console.error("❌ Ошибка изменения featured статуса:", error);
    },
  });
};
