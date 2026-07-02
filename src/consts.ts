export const SITE = {
  title: 'Sina Saeidi',
  // Persian form of the name, used as the brand on /fa pages and as the
  // Person `alternateName` in JSON-LD so name searches in either script match.
  nameFa: 'سینا سعیدی',
  description: 'Software engineer and open-source enthusiast. Writing, links, and notes.',
  author: 'Sina Saeidi',
  tagline: 'Software engineer · open-source enthusiast',
  url: 'https://sinasaeidi.com',
  email: 'hi@sinasaeidi.com',
  github: 'https://github.com/xesina',
  linkedin: 'https://www.linkedin.com/in/xesina/',
  // Flip to false to show "not currently taking new projects" on /hire.
  available: true,
  // GoatCounter analytics endpoint, e.g. https://xesina.goatcounter.com/count
  // (register the code at goatcounter.com). Empty = analytics off.
  goatcounter: 'https://xesina.goatcounter.com/count',
  // Google Search Console "HTML tag" verification token (the content="..." value).
  googleSiteVerification: 'zkJsnS7JYbDhivGtxz0-3hbiz-M92eNsL3bJD0ey--4',
} as const;

export const NAV = [
  { key: 'home', href: '/' },
  { key: 'projects', href: '/projects/' },
  { key: 'about', href: '/about/' },
  { key: 'hire', href: '/hire/' },
] as const;
