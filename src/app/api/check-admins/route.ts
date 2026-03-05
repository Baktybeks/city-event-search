import { NextResponse } from "next/server";
import { databases } from "@/services/appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { UserRole } from "@/types";
import { Query } from "appwrite";

export async function GET() {
  try {
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
    return NextResponse.json({
      isFirstUser: true,
      adminCount: 0,
    });
  }
}
