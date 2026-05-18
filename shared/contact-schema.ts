import { z } from 'zod';

// All form source identifiers used across routes
export const FORM_SOURCES = [
  'hero',
  'investors',
  'partners',
  'kontakty',
  'contacts',
  'project-lakeview',
  'project-maetok',
  'project-etno-dim',
  'project-nterest',
  'project-pipeline-04',
  'news-subscribe',
] as const;

export type FormSource = (typeof FORM_SOURCES)[number];

// Ukrainian phone: allows +380XX XXX XX XX with spaces/dashes/parens
const PHONE_REGEX = /^[+\d][\d\s()+-]{7,20}$/;

export const ContactSchema = z.object({
  name: z
    .string()
    .min(2, "Ім'я має містити мінімум 2 символи")
    .max(100, "Ім'я задовге")
    .trim(),
  phone: z.string().regex(PHONE_REGEX, 'Невірний формат телефону').trim(),
  email: z
    .string()
    .email('Невірний email')
    .optional()
    .or(z.literal('')),
  message: z.string().max(2000, 'Повідомлення задовге').optional().or(z.literal('')),
  project: z.string().max(200).optional().or(z.literal('')),
  investor_format: z.string().max(100).optional().or(z.literal('')),
  org_type: z.string().max(100).optional().or(z.literal('')),
  goal: z.string().max(500).optional().or(z.literal('')),
  topic: z.string().max(100).optional().or(z.literal('')),
  source: z.enum(FORM_SOURCES),
  consent: z.literal(true, {
    error: "Згода на обробку ПД обов'язкова",
  }),
  turnstileToken: z.string().min(1, 'Перевірка Turnstile не пройдена'),
  // Honeypot: must be empty — bots fill it
  company: z.string().max(0, 'Spam detected').optional().or(z.literal('')),
});

export type ContactPayload = z.infer<typeof ContactSchema>;

// Response schemas
export const ContactSuccess = z.object({
  ok: z.literal(true),
  requestId: z.string(),
});

export const ContactError = z.object({
  ok: z.literal(false),
  error: z.enum(['validation', 'origin', 'turnstile', 'rate_limit', 'spam', 'server']),
  message: z.string(),
  retryAfter: z.number().optional(),
});

export type ContactResponse =
  | z.infer<typeof ContactSuccess>
  | z.infer<typeof ContactError>;
