import './globals.css';
import type { Metadata } from 'next';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';
import ThemeToggleClient from '@/components/ThemeToggleClient';

const legacyStyles = [
  '/legacy/mihanshop.com/build/assets/app-f420f844.css',
  '/legacy/mihanshop.com/build/assets/app-27f4bc3a.css',
  '/legacy/mihanshop.com/build/assets/app-blog-05db8ef3.css',
  '/legacy/mihanshop.com/build/assets/blog-938c2921.css',
  '/legacy/mihanshop.com/build/assets/home-1e5cc67e.css',
  '/legacy/mihanshop.com/build/assets/faq-3fc42301.css',
  '/legacy/mihanshop.com/build/assets/marketplace-95c948b0.css',
  '/legacy/mihanshop.com/build/assets/package-52b2b5ba.css',
  '/legacy/mihanshop.com/build/assets/restaurant-27b1a8a7.css',
  '/legacy/mihanshop.com/build/assets/theme-sugar-26086724.css',
  '/legacy/mihanshop.com/build/assets/Certificate-5f8be1f2.css',
  '/legacy/mihanshop.com/build/assets/CounselingRequest-8054b46d.css',
  '/legacy/mihanshop.com/build/assets/LoginModal-846ef44f.css',
  '/legacy/mihanshop.com/build/assets/app-setup-84e934e8.css',
  '/legacy/mihanshop.com/static/css/swiper-bundle.min.css'
];

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
    <html lang="fa" dir="rtl" data-theme="light" suppressHydrationWarning>
      <head>
        {legacyStyles.map((href) => (
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
