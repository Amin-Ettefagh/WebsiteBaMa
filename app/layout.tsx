import './globals.css';
import type { Metadata } from 'next';
import {
  LEGACY_STYLESHEETS,
  SITE_DESCRIPTION,
  SITE_DIR,
  SITE_LANG,
  SITE_NAME
} from '@/lib/site';
import ThemeToggleClient from '@/components/ThemeToggleClient';

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: '/Logo.png'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={SITE_LANG}
      dir={SITE_DIR}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        {LEGACY_STYLESHEETS.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
      </head>
      <body className="custom-scroll">
        {children}
        <ThemeToggleClient />
      </body>
    </html>
  );
}
