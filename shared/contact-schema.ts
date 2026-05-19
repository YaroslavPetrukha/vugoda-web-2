import { z } from 'zod';

// All form source identifiers used across routes.
// 'contacts' removed — canonical identifier is 'kontakty' (duplicate cleanup P1-7).
export const FORM_SOURCES = [
  'hero',
  'investors',
  'partners',
  'kontakty',
  'project-lakeview',
  'project-maetok',
  'project-etno-dim',
  'project-nterest',
  'project-pipeline-04',
  'news-subscribe',
] as const;

export type FormSource = (typeof FORM_SOURCES)[number];

// Ukrainian phone: allows +380XX XXX XX XX with spaces/dashes/parens.
// Two-step check: format regex + minimum 9 digits (P1-6).
const PHONE_REGEX = /^[+\d][\d\s()+-]{7,20}$/;

export const ContactSchema = z.object({
  name: z
    .string()
    .min(2, "Ім'я має містити мінімум 2 символи")
    .max(100, "Ім'я задовге")
    .trim(),
  phone: z
    .string()
    .regex(PHONE_REGEX, 'Невірний формат телефону')
    .refine((v) => (v.match(/\d/g) ?? []).length >= 9, {
      message: 'Телефон має містити мінімум 9 цифр',
    })
    .trim(),
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
  // Zod v4: 'error' string is the unified message for missing/invalid values (P1-8)
  source: z.enum(FORM_SOURCES, { error: "source поле обов'язкове або має невірне значення" }),
  consent: z.literal(true, {
    error: "Згода на обробку ПД обов'язкова",
  }),
  // Zod v4: 'error' string covers missing/invalid; .min(1) covers empty string (P1-8)
  turnstileToken: z
    .string({ error: 'Перевірка Turnstile не пройдена' })
    .min(1, 'Перевірка Turnstile не пройдена'),
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
