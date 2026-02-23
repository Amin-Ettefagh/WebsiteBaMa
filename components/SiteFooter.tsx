import Link from 'next/link';
import { SITE_NAME, SITE_PHONE, SITE_SUPPORT_EMAIL } from '@/lib/site';

const footerLinks = [
  { href: '/about', label: 'About us' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
  { href: '/terms', label: 'Terms & conditions' }
];

const serviceLinks = [
  { href: '/marketplace', label: 'Marketplace solutions' },
  { href: '/packages', label: 'Website packages' },
  { href: '/customers', label: 'Customer stories' },
  { href: '/blog', label: 'Blog insights' }
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div>
            <div className="site-footer__title">{SITE_NAME}</div>
            <p className="site-footer__list">
              Design, build, and grow your ecommerce presence with a modern site and
              conversion-focused tools.
            </p>
          </div>
          <div>
            <div className="site-footer__title">Quick links</div>
            <ul className="site-footer__list">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="site-footer__title">Services</div>
            <ul className="site-footer__list">
              {serviceLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
            <ul className="site-footer__list" style={{ marginTop: 12 }}>
              <li>Phone: {SITE_PHONE}</li>
              <li>Email: {SITE_SUPPORT_EMAIL}</li>
            </ul>
          </div>
        </div>
        <div className="footer-note">
          All rights reserved. Copyright {SITE_NAME}.
        </div>
      </div>
    </footer>
  );
}
