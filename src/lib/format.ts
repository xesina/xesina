type Lang = 'en' | 'fa';

const mk = (locale: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale, { ...opts, timeZone: 'UTC' });

// Persian formatters use the Shamsi (Jalali) calendar with Persian month names
// and Persian (Eastern Arabic) digits.
const DAY = {
  en: mk('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
  fa: mk('fa-IR-u-ca-persian', { day: '2-digit', month: 'long', year: 'numeric' }),
};
const TIME = {
  en: mk('en-GB', { hour: '2-digit', minute: '2-digit' }),
  fa: mk('fa-IR-u-ca-persian', { hour: '2-digit', minute: '2-digit' }),
};
const MONTH_YEAR = {
  en: mk('en-GB', { month: 'short', year: 'numeric' }),
  fa: mk('fa-IR-u-ca-persian', { month: 'short', year: 'numeric' }),
};

/** e.g. "22 June 2026" / "۱ تیر ۱۴۰۵" */
export const fmtDay = (d: Date, lang: Lang = 'en') => DAY[lang].format(d);

/** e.g. "10:24" / "۱۰:۲۴" */
export const fmtTime = (d: Date, lang: Lang = 'en') => TIME[lang].format(d);

/** e.g. "Jun 2026" */
export const fmtMonthYear = (d: Date, lang: Lang = 'en') => MONTH_YEAR[lang].format(d);

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Convert ASCII digits in a string to Persian numerals. */
export const toFaDigits = (s: string | number) => String(s).replace(/[0-9]/g, (d) => FA_DIGITS[+d]);

/** Render a number, using Persian numerals when lang === 'fa'. */
export const faNum = (n: string | number, lang: Lang = 'en') =>
  lang === 'fa' ? toFaDigits(n) : String(n);

/** Rough word count from raw markdown. */
export const wordCount = (s: string) => (s.trim().match(/\S+/g) || []).length;

/** Hostname without leading www. — for external link labels. */
export const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};
