"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/services/eventsService";
import { EventCard } from "@/components/events/EventCard";
import { Calendar, Clock, CheckCircle, X, Ticket } from "lucide-react";
import { EventStatus } from "@/types";

export default function MyEventsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "past" | "registered"
  >("upcoming");

  // В реальном приложении здесь будут отдельные запросы для каждой категории
  const { data: eventsData, isLoading } = useEvents({
    // Фильтры для получения событий пользователя
  });

  const events = eventsData?.pages.flatMap((page) => page.events) || [];

  // Фильтрация событий по категориям
  const now = new Date();
  const upcomingEvents = events.filter(
    (event) => new Date(event.startDate) > now
  );
  const pastEvents = events.filter(
    (event) => new Date(event.startDate) <= now
  );

  // Заглушка для зарегистрированных событий
  const registere