import "./globals.css";
import { Providers } from "./providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EventCity - Найди свое событие",
  description:
    "Лучшие мероприятия твоего города в одном месте. Концерты, выставки, мастер-классы, фестивали и многое другое.",
  keywords: [
    "события",
    "мероприятия",
    "концерты",
    "выставки",
    "фестивали",
    "город",
  ],
  authors: [{ name: "EventCity Team" }],
  openGraph: {
    title: "EventCity - Найди свое событие",
    description: "Лучшие мероприятия твоего города в одном месте",
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "EventCity - Найди свое событие",
    description: "Лучшие мероприятия твоего города в одном месте",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
