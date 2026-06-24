export const SITE = {
  title: 'Sina Saeidi',
  description: 'Software engineer and open-source enthusiast. Writing, links, and notes.',
  author: 'Sina Saeidi',
  tagline: 'Software engineer · open-source enthusiast',
  url: 'https://xesina.com',
  email: 'hi@xesina.com',
  github: 'https://github.com/xesina',
  linkedin: 'https://www.linkedin.com/in/xesina/',
  // Google Search Console "HTML tag" verification token (the content="..." value).
  googleSiteVerification: 'zkJsnS7JYbDhivGtxz0-3hbiz-M92eNsL3bJD0ey--4',
} as const;

export const NAV = [
  { key: 'home', href: '/' },
  { key: 'projects', href: '/projects/' },
  { key: 'about', href: '/about/' },
] as const;
