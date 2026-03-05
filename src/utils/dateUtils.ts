/**
 * Форматирует дату для отображения в локальном времени
 */
export const formatLocalDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  };

  return (
    date.toLocaleDateString("ru-RU", dateOptions) +
    " " +
    date.toLocaleTimeString("ru-RU", timeOptions)
  );
};

/**
 * Форматирует дату для отображения только даты в локальном времени
 */
export const formatLocalDate = (dateString: string): string => {
  const date = new Date(dateString);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return date.toLocaleDateString("ru-RU", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const APP_TIMEZONE_KEY = "app_timezone";
export const DEFAULT_APP_TIMEZONE = "Europe/Moscow";

export const getStoredAppTimezone = (): string => {
  if (typeof window === "undefined") return DEFAULT_APP_TIMEZONE;
  return localStorage.getItem(APP_TIMEZONE_KEY) || DEFAULT_APP_TIMEZONE;
};

export const setStoredAppTimezone = (tz: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(APP_TIMEZONE_KEY, tz);
};

/** Смещение часового пояса в мс для даты (UTC+3 = -10800000 для Москвы) */
function getTimezoneOffsetMs(timeZone: string, date: Date): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(date);
    const offsetPart = parts.find((p) => p.type === "timeZoneName");
    if (!offsetPart?.value) return 0;
    const match = offsetPart.value.match(/GMT([+-])(\d+)(?::(\d+))?/);
    if (!match) return 0;
    const sign = match[1] === "+" ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = match[3] ? parseInt(match[3], 10) : 0;
    return sign * (hours * 3600 + minutes * 60) * 1000;
  } catch {
    return 0;
  }
}

/**
 * Форматирует ISO-дату в указанном часовом поясе для отображения (дата + время)
 */
export const formatInTimezone = (
  isoString: string,
  timeZone: string,
  options?: { dateStyle?: "short" | "medium"; timeStyle?: "short" }
): string => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(date);
};

/** Только время в указанном поясе (HH:mm) */
export const formatTimeInTimezone = (
  isoString: string,
  timeZone: string
): string => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/** Проверка «сегодня» в указанном часовом поясе */
export const isTodayInTimezone = (
  isoString: string,
  timeZone: string
): boolean => {
  const date = new Date(isoString);
  const formatter = new Intl.DateTimeFormat("ru-RU", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const today = new Date();
  const todayStr = new Intl.DateTimeFormat("ru-RU", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(today);
  return formatter.format(date) === todayStr;
};

/**
 * Конвертирует ISO в значение для input datetime-local в заданном часовом поясе
 */
export const formatISOToDatetimeLocal = (
  isoString: string,
  timeZone: string
): string => {
  const date = new Date(isoString);
  const offsetMs = getTimezoneOffsetMs(timeZone, date);
  const inTz = new Date(date.getTime() + offsetMs);
  const y = inTz.getUTCFullYear();
  const m = String(inTz.getUTCMonth() + 1).padStart(2, "0");
  const d = String(inTz.getUTCDate()).padStart(2, "0");
  const h = String(inTz.getUTCHours()).padStart(2, "0");
  const min = String(inTz.getUTCMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
};

/**
 * Парсит значение datetime-local как время в заданном поясе и возвращает ISO
 */
export const parseDatetimeLocalInTimezoneToISO = (
  localStr: string,
  timeZone: string
): string => {
  if (!localStr || !localStr.trim()) return "";
  const d = new Date(localStr + "Z");
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  const h = d.getUTCHours();
  const min = d.getUTCMinutes();
  const refDate = new Date(Date.UTC(y, m, day, h, min));
  const offsetMs = getTimezoneOffsetMs(timeZone, refDate);
  const utcMs = Date.UTC(y, m, day, h, min) - offsetMs;
  return new Date(utcMs).toISOString();
};

/**
 * Конвертирует локальное время из datetime-local в ISO строку
 * с сохранением локального времени (без сдвига в UTC)
 */
export const convertLocalDateTimeToISO = (localDateTime: string): string => {
  const localDate = new Date(localDateTime);
  return new Date(
    localDate.getTime() - localDate.getTimezoneOffset() * 60000
  ).toISOString();
};

/**
 * Конвертирует ISO строку в формат для datetime-local input (в заданном поясе)
 */
export const convertISOToLocalDateTime = (
  isoString: string,
  timeZone?: string
): string => {
  if (timeZone) return formatISOToDatetimeLocal(isoString, timeZone);
  const date = new Date(isoString);
  const localDate = new Date(
    date.getTime() + date.getTimezoneOffset() * 60000
  );
  return localDate.toISOString().slice(0, 16);
};

/**
 * Получает минимальную дату/время для datetime-local input (текущее время)
 */
export const getMinDateTime = (): string => {
  const now = new Date();
  return now.toISOString().slice(0, 16);
};

/**
 * Получает рекомендуемую дату/время (следующий час от текущего времени)
 */
export const getDefaultDateTime = (): string => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  now.setMinutes(0);
  now.setSeconds(0);
  return now.toISOString().slice(0, 16);
};

/**
 * Проверяет, является ли дата прошедшей
 */
export const isPastDate = (dateString: string): boolean => {
  return new Date(dateString) < new Date();
};

/**
 * Проверяет, является ли дата сегодняшней
 */
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Получает относительное описание даты (сегодня, завтра, вчера, и т.д.)
 */
export const getRelativeDateDescription = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Сегодня";
  if (diffDays === 1) return "Завтра";
  if (diffDays === -1) return "Вчера";
  if (diffDays > 1 && diffDays <= 7) return `Через ${diffDays} дней`;
  if (diffDays < -1 && diffDays >= -7)
    return `${Math.abs(diffDays)} дней назад`;

  return formatLocalDate(dateString);
};
