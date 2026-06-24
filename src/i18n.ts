export type Lang = 'en' | 'fa';

const dict = {
  en: {
    home: 'Home',
    projects: 'Projects',
    about: 'About',
    hire: 'Hire',
    writing: 'Writing',
    links: 'Links',
    notes: 'Notes',
    tags: 'Tags',
    archive: 'Archive',
    entry: 'Entry',
    link: 'Link',
    note: 'Note',
    words: 'words',
    empty: 'Nothing here yet. Check back soon.',
    rss: 'RSS feed',
    allTags: 'All tags →',
    fullArchive: 'Full archive →',
    skip: 'Skip to content',
  },
  fa: {
    home: 'خانه',
    projects: 'پروژه‌ها',
    about: 'درباره',
    hire: 'همکاری',
    writing: 'نوشته‌ها',
    links: 'پیوندها',
    notes: 'یادداشت‌ها',
    tags: 'برچسب‌ها',
    archive: 'بایگانی',
    entry: 'نوشته',
    link: 'پیوند',
    note: 'یادداشت',
    words: 'واژه',
    empty: 'هنوز چیزی اینجا نیست. بعداً سر بزنید.',
    rss: 'خوراک آر‌اس‌اس',
    allTags: 'همهٔ برچسب‌ها →',
    fullArchive: 'بایگانی کامل →',
    skip: 'رفتن به محتوا',
  },
} as const;

export type StringKey = keyof (typeof dict)['en'];

export const t = (lang: Lang, key: StringKey): string => dict[lang]?.[key] ?? dict.en[key];
