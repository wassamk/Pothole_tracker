// src/middleware/i18n.js
// Middleware to detect language from Accept-Language header
// and attach the correct locale messages to req.t()

import enMessages from '../locales/en/messages.js';
import urMessages from '../locales/ur/messages.js';

const locales = {
  en: enMessages,
  ur: urMessages,
};

/**
 * i18n Middleware
 *
 * Reads the Accept-Language header and attaches a translation helper
 * `req.t(key)` to every request object.
 *
 * Supported locales: 'en' (English), 'ur' (Urdu)
 * Defaults to English if the header is absent or unsupported.
 */
const i18nMiddleware = (req, res, next) => {
  // Parse Accept-Language: "ur-PK,ur;q=0.9,en;q=0.8" -> "ur"
  const acceptLanguage = req.headers['accept-language'] || 'en';
  const primaryLang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();

  // Resolve locale, default to English
  const lang = locales[primaryLang] ? primaryLang : 'en';
  const messages = locales[lang];

  // Attach language metadata to the request
  req.lang = lang;

  /**
   * Translation helper: req.t('KEY') returns the message for the current locale.
   * Falls back to English if key is missing in the target locale.
   */
  req.t = (key) => messages[key] || enMessages[key] || key;

  next();
};

export default i18nMiddleware;
