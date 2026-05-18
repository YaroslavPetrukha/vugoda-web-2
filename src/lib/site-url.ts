/// <reference types="vite/client" />
// Canonical site URL builder.
// Uses VITE_SITE_URL env var; falls back to vyhoda.lviv.ua (production canonical).

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://vyhoda.lviv.ua';

export const siteUrl = (path: string): string => {
  return new URL(path, SITE_URL).toString();
};

export const SITE_ORIGIN = SITE_URL;
