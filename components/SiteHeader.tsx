'use client';

import Link from 'next/link';
import { useState } from 'react';
import clsx from 'clsx';
import { SITE_NAME } from '@/lib/site';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/packages', label: 'Packages' },
  { href: '/customers', label: 'Customers' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About us' },
  { href: '/contact', label: 'Contact' }
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container">
        <div className="site-header__inner">
          <div className="brand">
            <Link href="/" aria-label={SITE_NAME}>
              <img className="brand__logo" src="/Logo.png" alt={SITE_NAME} />
            </Link>
            <span className="brand__title">{SITE_NAME}</span>
          </div>

          <nav className="nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="nav__link">
                {item.label}
              </Link>
            ))}
            <Link href="/panel" className="nav__cta">
              Client panel
            </Link>
          </nav>

          <button
            type="button"
            className="mobile-toggle"
            aria-label="Toggle menu"
            onClick={() => setOpen((prev) => !prev)}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h16m-7 6h7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className={clsx('mobile-menu', open && 'is-open')}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav__link"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/panel" className="nav__cta" onClick={() => setOpen(false)}>
            Client panel
          </Link>
        </div>
      </div>
    </header>
  );
}
