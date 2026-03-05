export const appwriteConfig = {
  endpoint:
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
  storageId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID || "",
  collections: {
    users: process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || "users",
    events: process.env.NEXT_PUBLIC_EVENTS_COLLECTION_ID || "events",
    registrations:
      process.env.NEXT_PUBLIC_REGISTRATIONS_COLLECTION_ID || "registrations",
    favorites: process.env.NEXT_PUBLIC_FAVORITES_COLLECTION_ID || "favorites",
    views: process.env.NEXT_PUBLIC_VIEWS_COLLECTION_ID || "views",
  },
} as const;

export type CollectionName = keyof typeof appwriteConfig.collections;

const requiredEnvVars = [
  "NEXT_PUBLIC_APPWRITE_ENDPOINT",
  "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
  "NEXT_PUBLIC_APPWRITE_DATABASE_ID",
  "NEXT_PUBLIC_APPWRITE_STORAGE_ID",
  "NEXT_PUBLIC_USERS_COLLECTION_ID",
  "NEXT_PUBLIC_EVENTS_COLLECTION_ID",
  "NEXT_PUBLIC_REGISTRATIONS_COLLECTION_ID",
  "NEXT_PUBLIC_FAVORITES_COLLECTION_ID",
  "NEXT_PUBLIC_VIEWS_COLLECTION_ID",
] as const;

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(
    `⚠️ Отсутствуют необходимые переменные окружения: ${missingEnvVars.join(
      ", "
    )}`
  );

  if (process.env.NODE_ENV !== "development") {
    console.error(
      "❌ В production режиме все переменные окружения обязательны!"
    );
  }
}

export const getCollectionId = (collectionName: CollectionName): string => {
  const id = appwriteConfig.collections[collectionName];
  if (!id) {
    throw new Error(`ID коллекции ${collectionName} не найден в конфигурации`);
  }
  return id;
};

export const validateAppwriteConfig = (): boolean => {
  const { endpoint, projectId, databaseId, storageId } = appwriteConfig;

  if (!endpoint || !projectId || !databaseId || !storageId) {
    console.error("❌ Основные параметры Appwrite не настроены");
    return false;
  }

  const emptyCollections = Object.entries(appwriteConfig.collections)
    .filter(([_, id]) => !id)
    .map(([name]) => name);

  if (emptyCollections.length > 0) {
    console.error(
      `❌ Не настроены ID коллекций: ${emptyCollections.join(", ")}`
    );
    return false;
  }

  console.log("✅ Конфигурация Appwrite валидна");
  return true;
};

export default appwriteConfig;
