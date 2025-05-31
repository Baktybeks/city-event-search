"use client";

import { Navbar } from "@/components/layout/Navbar";
import HomePage from "./(main)/page";

export default function RootPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <HomePage />
      </main>
    </div>
  );
}
