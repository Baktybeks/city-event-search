// src/app/page.tsx
import { Navbar } from "@/components/layout/Navbar";
import HomePageClient from "./(main)/home-client";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <HomePageClient />
      </main>
    </div>
  );
}
