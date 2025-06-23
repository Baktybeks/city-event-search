// scripts/setupCollections.js
const { Client, Databases, Permission, Role } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const appwriteConfig = {
  endpoint:
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
  collections: {
    users: process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || "users",
    events: process.env.NEXT_PUBLIC_EVENTS_COLLECTION_ID || "events",
    registrations:
      process.env.NEXT_PUBLIC_REGISTRATIONS_COLLECTION_ID || "registrations",
    favorites: process.env.NEXT_PUBLIC_FAVORITES_COLLECTION_ID || "favorites",
    views: process.env.NEXT_PUBLIC_VIEWS_COLLECTION_ID || "views",
  },
};

const COLLECTION_SCHEMAS = {
  users: {
    name: { type: "string", required: true, size: 255 },
    email: { type: "email", required: true, size: 320 },
    role: {
      type: "enum",
      required: true,
      elements: ["ADMIN", "ORGANIZER", "USER"],
    },
    isActive: { type: "boolean", required: false, default: false },
    avatar: { type: "url", required: false, size: 500 },
    phone: { type: "string", required: false, size: 20 },
    bio: { type: "string", required: false, size: 1000 },
    createdAt: { type: "datetime", required: true },
  },

  events: {
    title: { type: "string", required: true, size: 255 },
    description: { type: "string", required: true, size: 5000 },
    category: {
      type: "enum",
      required: true,
      elements: [
        "CONCERT",
        "EXHIBITION",
        "THEATER",
        "WORKSHOP",
        "FESTIVAL",
        "SPORT",
        "CONFERENCE",
        "PARTY",
        "FOOD",
        "OTHER",
      ],
    },
    startDate: { type: "datetime", required: true },
    endDate: { type: "datetime", required: false },
    location: { type: "string", required: true, size: 255 },
    address: { type: "string", required: true, size: 500 },
    organizer: { type: "string", required: true, size: 36 },
    price: { type: "integer", required: false, min: 0 },
    isFree: { type: "boolean", required: false, default: true },
    maxAttendees: { type: "integer", required: false, min: 1 },
    registrationRequired: { type: "boolean", required: false, default: false },
    registrationUrl: { type: "url", required: false, size: 500 },
    ticketUrl: { type: "url", required: false, size: 500 },
    imageUrl: { type: "url", required: false, size: 500 },
    tags: { type: "string", required: false, array: true },
    status: {
      type: "enum",
      required: true,
      elements: ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"],
      default: "DRAFT",
    },
    viewCount: { type: "integer", required: false, default: 0 },
    likes: { type: "integer", required: false, default: 0 },
    featured: { type: "boolean", required: false, default: false },
    createdAt: { type: "datetime", required: true },
  },

  registrations: {
    eventId: { type: "string", required: true, size: 36 },
    userId: { type: "string", required: true, size: 36 },
    registeredAt: { type: "datetime", required: true },
    status: {
      type: "enum",
      required: true,
      elements: ["registered", "attended", "cancelled"],
      default: "registered",
    },
  },

  favorites: {
    userId: { type: "string", required: true, size: 36 },
    eventId: { type: "string", required: true, size: 36 },
    createdAt: { type: "datetime", required: true },
  },

  views: {
    eventId: { type: "string", required: true, size: 36 },
    userId: { type: "string", required: false, size: 36 },
    viewedAt: { type: "datetime", required: true },
    ipAddress: { type: "string", required: false, size: 45 },
  },
};

const COLLECTION_INDEXES = {
  users: [
    { key: "email", type: "unique" },
    { key: "role", type: "key" },
    { key: "isActive", type: "key" },
  ],
  events: [
    { key: "organizer", type: "key" },
    { key: "category", type: "key" },
    { key: "status", type: "key" },
    { key: "startDate", type: "key" },
    { key: "isFree", type: "key" },
    { key: "featured", type: "key" },
    { key: "location", type: "key" },
    { key: "viewCount", type: "key" },
  ],
  registrations: [
    { key: "eventId", type: "key" },
    { key: "userId", type: "key" },
    { key: "status", type: "key" },
    {
      key: "eventId_userId",
      type: "unique",
      attributes: ["eventId", "userId"],
    },
  ],
  favorites: [
    { key: "userId", type: "key" },
    { key: "eventId", type: "key" },
    {
      key: "userId_eventId",
      type: "unique",
      attributes: ["userId", "eventId"],
    },
  ],
  views: [
    { key: "eventId", type: "key" },
    { key: "userId", type: "key" },
    { key: "viewedAt", type: "key" },
  ],
};

const client = new Client();
client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const createAttribute = async (databaseId, collectionId, key, schema) => {
  try {
    const attributeType = schema.type;
    let isRequired = schema.required || false;
    let defaultValue = schema.default;

    if (isRequired && defaultValue !== null && defaultValue !== undefined) {
      console.log(
        `    ⚠️ Исправление ${key}: required=true с default значением -> required=false`
      );
      isRequired = false;
    }

    switch (attributeType) {
      case "string":
        return await databases.createStringAttribute(
          databaseId,
          collectionId,
          key,
          schema.size || 255,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "email":
        return await databases.createEmailAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "enum":
        return await databases.createEnumAttribute(
          databaseId,
          collectionId,
          key,
          schema.elements,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "boolean":
        return await databases.createBooleanAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue !== null && defaultValue !== undefined
            ? defaultValue
            : null,
          schema.array || false
        );

      case "datetime":
        return await databases.createDatetimeAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "integer":
        return await databases.createIntegerAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          schema.min || null,
          schema.max || null,
          defaultValue || null,
          schema.array || false
        );

      case "url":
        return await databases.createUrlAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      default:
        throw new Error(`Неподдерживаемый тип атрибута: ${attributeType}`);
    }
  } catch (error) {
    console.error(`Ошибка создания атрибута ${key}:`, error.message);
    throw error;
  }
};

const createIndex = async (databaseId, collectionId, indexConfig) => {
  try {
    return await databases.createIndex(
      databaseId,
      collectionId,
      indexConfig.key,
      indexConfig.type,
      indexConfig.attributes || [indexConfig.key],
      indexConfig.orders || ["ASC"]
    );
  } catch (error) {
    console.error(`Ошибка создания индекса ${indexConfig.key}:`, error.message);
    throw error;
  }
};

const setupCollections = async () => {
  try {
    console.log("🚀 Начинаем создание коллекций...");
    console.log(
      "📋 Всего коллекций для создания:",
      Object.keys(COLLECTION_SCHEMAS).length
    );

    const databaseId = appwriteConfig.databaseId;

    if (!databaseId) {
      throw new Error("Database ID не найден! Проверьте переменные окружения.");
    }

    for (const [collectionName, schema] of Object.entries(COLLECTION_SCHEMAS)) {
      console.log(`\n📁 Создание коллекции: ${collectionName}`);

      try {
        const collectionId = appwriteConfig.collections[collectionName];

        const collection = await databases.createCollection(
          databaseId,
          collectionId,
          collectionName,
          [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ],
          false
        );

        console.log(
          `  ✅ Коллекция ${collectionName} создана (ID: ${collectionId})`
        );

        console.log(`  📝 Добавление атрибутов...`);
        let attributeCount = 0;

        for (const [attributeKey, attributeSchema] of Object.entries(schema)) {
          try {
            await createAttribute(
              databaseId,
              collectionId,
              attributeKey,
              attributeSchema
            );
            attributeCount++;
            console.log(`    ✅ ${attributeKey} (${attributeSchema.type})`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`    ❌ ${attributeKey}: ${error.message}`);
          }
        }

        console.log(
          `  📊 Создано атрибутов: ${attributeCount}/${
            Object.keys(schema).length
          }`
        );

        if (COLLECTION_INDEXES[collectionName]) {
          console.log(`  🔍 Создание индексов...`);
          let indexCount = 0;

          for (const indexConfig of COLLECTION_INDEXES[collectionName]) {
            try {
              await createIndex(databaseId, collectionId, indexConfig);
              indexCount++;
              console.log(`    ✅ Индекс: ${indexConfig.key}`);
              await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (error) {
              console.error(
                `    ❌ Индекс ${indexConfig.key}: ${error.message}`
              );
            }
          }

          console.log(
            `  📈 Создано индексов: ${indexCount}/${COLLECTION_INDEXES[collectionName].length}`
          );
        }
      } catch (error) {
        console.error(
          `❌ Ошибка создания коллекции ${collectionName}:`,
          error.message
        );
      }
    }

    console.log("\n🎉 Настройка коллекций завершена!");
    console.log("🔗 Откройте консоль Appwrite для проверки результата.");
  } catch (error) {
    console.error("💥 Общая ошибка:", error.message);
    console.log("\n🔍 Проверьте:");
    console.log("- Переменные окружения в .env.local");
    console.log("- Права доступа API ключа");
    console.log("- Подключение к интернету");
  }
};

const resetCollections = async () => {
  try {
    console.log("🗑️ Удаление существующих коллекций...");

    const databaseId = appwriteConfig.databaseId;
    let deletedCount = 0;

    for (const [collectionName] of Object.entries(COLLECTION_SCHEMAS)) {
      try {
        const collectionId = appwriteConfig.collections[collectionName];
        await databases.deleteCollection(databaseId, collectionId);
        deletedCount++;
        console.log(`✅ ${collectionName} удалена`);
      } catch (error) {
        console.log(`⚠️ ${collectionName} не найдена или уже удалена`);
      }
    }

    console.log(`🧹 Удалено коллекций: ${deletedCount}`);
  } catch (error) {
    console.error("Ошибка при удалении коллекций:", error.message);
  }
};

const deleteAttribute = async () => {
  const databaseId = appwriteConfig.databaseId;
  const collectionId = appwriteConfig.collections.users; // например, users
  const attributeId = "profileData"; // тут укажи свой зависший атрибут

  try {
    await databases.deleteAttribute(databaseId, collectionId, attributeId);
    console.log(`✅ Атрибут "${attributeId}" успешно удалён`);
  } catch (error) {
    console.error(
      `❌ Ошибка при удалении атрибута "${attributeId}":`,
      error.message
    );
  }
};

const checkEnvironment = () => {
  const required = [
    "NEXT_PUBLIC_APPWRITE_ENDPOINT",
    "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
    "NEXT_PUBLIC_APPWRITE_DATABASE_ID",
    "APPWRITE_API_KEY",
  ];

  const missing = required.filter((env) => !process.env[env]);

  if (missing.length > 0) {
    console.error("❌ Отсутствуют переменные окружения:");
    missing.forEach((env) => console.error(`  - ${env}`));
    console.log("\n💡 Создайте файл .env.local с необходимыми переменными");
    process.exit(1);
  }

  console.log("✅ Все переменные окружения найдены");
};

const main = async () => {
  console.log("🔧 EventCity - Настройка базы данных\n");

  checkEnvironment();

  const command = process.argv[2];

  switch (command) {
    case "setup":
      await setupCollections();
      break;
    case "reset":
      await resetCollections();
      break;
      break;
    case "deleteAttribute":
      await deleteAttribute();
      break;
    case "reset-setup":
      await resetCollections();
      console.log("\n⏳ Ожидание 3 секунды перед созданием...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await setupCollections();
      break;
    default:
      console.log("📖 Использование:");
      console.log(
        "  node scripts/setupCollections.js setup        - Создать коллекции"
      );
      console.log(
        "  node scripts/setupCollections.js reset        - Удалить коллекции"
      );
      console.log(
        "  node scripts/setupCollections.js reset-setup  - Пересоздать коллекции"
      );
      break;
  }
};

if (require.main === module) {
  main().catch(console.error);
}
