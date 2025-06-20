// src/app/api/check-admins/route.ts
import { NextResponse } from "next/server";
import { databases } from "@/services/appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { UserRole } from "@/types";
import { Query } from "appwrite";

export async function GET() {
  try {
    // Проверяем наличие администраторов в системе
    const adminCheck = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.users,
      [Query.equal("role", UserRole.ADMIN)]
    );

    const isFirstUser = adminCheck.total === 0;

    return NextResponse.json({
      isFirstUser,
      adminCount: adminCheck.total,
    });
  } catch (error) {
    console.error("Ошибка при проверке администраторов:", error);

    // Если ошибка связана с отсутствием коллекции или базы данных,
    // предполагаем что это первый пользователь
    return NextResponse.json({
      isFirstUser: true,
      adminCount: 0,
    });
  }
}
