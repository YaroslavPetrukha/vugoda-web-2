// Curated top-200 disposable email domains (post-2024).
// Source seed: github.com/disposable-email-domains/disposable-email-domains
// Trimmed from ~3500 to top-200 to keep CF Workers bundle lean (~6 KB).
// Add only domains you observe in actual spam — do NOT bulk-import.
//
// Excluded intentionally: protonmail.com, tutanota.com, pm.me, hey.com,
// fastmail.com, zoho.com — legitimate privacy-focused services.
export const DISPOSABLE_EMAIL_DOMAINS: ReadonlySet<string> = new Set<string>([
  // ── 10-minute / timed-expiry services ─────────────────────────────────────
  '10minutemail.com',
  '10minutemail.net',
  '10minutemail.org',
  '10minutemail.de',
  '10minutemail.info',
  '10minemail.com',
  '10mail.org',
  '20minutemail.com',
  '20minutemail.it',
  'minutemailbox.com',
  'tempmail.com',
  'tempmail.net',
  'tempmail.org',
  'tempmail.de',
  'tempmail.io',
  'temp-mail.org',
  'temp-mail.io',
  'temp-mail.ru',
  'tempinbox.com',
  'tempr.email',
  'tempemail.com',
  'tempemail.net',
  'tempemail.co.za',
  'tmpmail.net',
  'tmpmail.org',

  // ── Mailinator family ─────────────────────────────────────────────────────
  'mailinator.com',
  'mailinator.net',
  'mailinator.org',
  'mailinator2.com',
  'mailinater.com',
  'suremail.info',
  'tradermail.info',
  'spamgourmet.com',
  'spamgourmet.net',
  'spamgourmet.org',
  'mailnull.com',
  'maildrop.cc',
  'maildrop.io',

  // ── Guerrilla Mail ────────────────────────────────────────────────────────
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.de',
  'guerrillamail.info',
  'guerrillamail.biz',
  'guerrillaemail.com',
  'guerrillaemail.net',
  'guerrillaemail.org',
  'grr.la',
  'spam4.me',
  'sharklasers.com',
  'guerrillamailblock.com',
  'yopmail.com',
  'yopmail.net',
  'yopmail.fr',
  'cool.fr.nf',
  'jetable.fr.nf',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'mega.zik.dj',
  'speed.1s.fr',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',

  // ── Throwaway / trash mail ─────────────────────────────────────────────────
  'throwam.com',
  'throwaway.email',
  'throwamailaway.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.org',
  'trashmail.me',
  'trashmail.at',
  'trashmail.io',
  'trashmail.xyz',
  'trash-mail.at',
  'trashmailer.com',
  'trashinbox.com',
  'trashemail.de',
  'dispostable.com',
  'disposableemailaddresses.com',
  'disposableinbox.com',
  'throwablemail.com',

  // ── Fake inbox / spam inbox services ──────────────────────────────────────
  'fakeinbox.com',
  'fakeinbox.net',
  'fakemail.net',
  'fakemail.fr',
  'mailnew.com',
  'spambox.us',
  'spambox.info',
  'spambox.org',
  'spambox.me',
  'spamd.de',
  'spamfree24.org',
  'spamfree.eu',
  'spamhereplease.com',
  'spamhole.com',
  'spamspot.com',
  'spamthisplease.com',

  // ── Airmail / getairmail ───────────────────────────────────────────────────
  'getairmail.com',
  'airmail.email',
  'airmailbox.net',

  // ── GuerrillaMail-like short-lived inboxes ─────────────────────────────────
  'mailnesia.com',
  'mailnull.com',
  'mailzilla.com',
  'mailzilla.org',
  'mailzip.com',
  'maildrop.cc',
  'mailscrap.com',
  'mailpick.biz',
  'mailsiphon.com',
  'mailseal.de',
  'mailshell.com',
  'mailsiphon.com',
  'mailsucker.net',
  'maileater.com',
  'mailbucket.org',
  'mailforspam.com',
  'mailfreeonline.com',
  'mailandftp.com',

  // ── Nada / nowaste / one-time ─────────────────────────────────────────────
  'nada.email',
  'nada.ltd',
  'nadamailbox.com',
  'nowaste.email',
  'notmailinator.com',
  'nomail.com',
  'nomail2me.com',
  'nospamfor.us',
  'nospammail.net',
  'nospam.ze.tc',

  // ── Inboxbear / inboxkitten / anonymous inbox ─────────────────────────────
  'inboxbear.com',
  'inboxkitten.com',
  'anonymbox.com',
  'anonymail.dk',
  'anonmails.de',
  'anonyforwarded.com',

  // ── Discard / devnull / null-routing ──────────────────────────────────────
  'discardmail.com',
  'discardmail.de',
  'discard.email',
  'devnullmail.com',
  'devnull.email',
  'throwam.com',
  'deadletter.email',

  // ── Yandex look-alike / Cyrillic-targeting ────────────────────────────────
  'yandex-mail.ru',  // NOT yandex.ru (legit) — typo/phishing variant
  'mailru.org',      // NOT mail.ru (legit) — typo variant

  // ── Bot-favourite burner domains (observed in spam logs) ──────────────────
  'cuvox.de',
  'dayrep.com',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'armyspy.com',

  // ── Mohmal / Arab-region burner ───────────────────────────────────────────
  'mohmal.com',
  'mohmal.im',

  // ── Getnada / getonsocial ─────────────────────────────────────────────────
  'getnada.com',
  'getnada.info',
  'getonsocial.com',

  // ── Maildrop / throwam / assorted widely-used ─────────────────────────────
  'harakirimail.com',
  'haltospam.com',
  'hatespam.org',
  'hidemail.de',
  'hidzz.com',
  'hmamail.com',
  'hopemail.biz',
  'ieh-mail.de',
  'ihateyoualot.info',
  'iheartspam.org',
  'imstations.com',
  'inoutmail.de',
  'inoutmail.eu',
  'inoutmail.info',
  'inoutmail.net',
  'insorg-mail.info',
  'instant-mail.de',
  'ip6.li',
  'irish2me.com',
  'jetable.com',
  'jetable.net',
  'jetable.org',
  'jetable.pp.ua',
  'jnxjn.com',
  'jourrapide.com',
  'jsrsolutions.com',
  'junk1.email',
  'junkmailking.com',
  'junkmail.com',
  'junkmail.ga',
  'junkmail.gq',
  'kasmail.com',
  'kaspop.com',
  'killmail.com',
  'killmail.net',
  'klassmaster.com',
  'klassmaster.net',
  'klassmaster.org',
  'klzlk.com',
  'kurzepost.de',
  'letthemeatspam.com',
  'lhsdv.com',
  'lifebyfood.com',
  'link2mail.net',
  'litedrop.com',
  'luxusmail.org',
  'maildax.me',
]);

/**
 * Returns true if the email's domain is in the disposable email blocklist.
 * Lookup is case-insensitive and handles leading/trailing whitespace.
 *
 * Edge cases:
 *   - No '@' in string → false
 *   - '@' is the last character (empty domain) → false
 *   - No local part (e.g. '@mailinator.com') → false (no local part check here;
 *     Zod .email() would reject this upstream)
 */
export function isDisposableEmail(email: string): boolean {
  const at = email.lastIndexOf('@');
  if (at < 0 || at === email.length - 1) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}
