"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import {
  getStoredAppTimezone,
  setStoredAppTimezone,
  DEFAULT_APP_TIMEZONE,
} from "@/utils/dateUtils";

type AppTimezoneContextType = {
  timezone: string;
  setTimezone: (tz: string) => void;
};

const AppTimezoneContext = createContext<AppTimezoneContextType | null>(null);

export function AppTimezoneProvider({ children }: { children: React.ReactNode }) {
  const [timezone, setTimezoneState] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_APP_TIMEZONE;
    return getStoredAppTimezone();
  });

  const setTimezone = useCallback((tz: string) => {
    setStoredAppTimezone(tz);
    setTimezoneState(tz);
  }, []);

  return (
    <AppTimezoneContext.Provider value={{ timezone, setTimezone }}>
      {children}
    </AppTimezoneContext.Provider>
  );
}

export function useAppTimezone(): string {
  const ctx = useContext(AppTimezoneContext);
  return ctx?.timezone ?? DEFAULT_APP_TIMEZONE;
}

export function useSetAppTimezone(): (tz: string) => void {
  const ctx = useContext(AppTimezoneContext);
  return ctx?.setTimezone ?? (() => {});
}
