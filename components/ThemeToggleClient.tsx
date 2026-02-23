'use client';

import { useEffect } from 'react';

const THEME_KEY = 'websitebama-theme';
const DEFAULT_THEME = 'light';

type ThemeMode = 'dark' | 'light';

const getStoredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

const applyTheme = (theme: ThemeMode) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore storage errors
  }

  const labelText =
    theme === 'dark'
      ? 'Light mode'
      : 'Dark mode';
  const toggles = root.querySelectorAll<HTMLElement>('[data-theme-toggle]');
  toggles.forEach((toggle) => {
    toggle.setAttribute('data-theme', theme);
    toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    const label = toggle.querySelector<HTMLElement>('.theme-toggle__label');
    if (label) {
      label.textContent = labelText;
    }
  });
};

const createToggle = (compact: boolean) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = compact ? 'theme-toggle theme-toggle--compact' : 'theme-toggle';
  button.setAttribute('data-theme-toggle', 'true');
  button.setAttribute(
    'aria-label',
    'Toggle theme'
  );
  button.innerHTML = '<span class="theme-toggle__dot"></span><span class="theme-toggle__label"></span>';
  return button;
};

// The legacy HTML does not include a theme toggle, so we inject one client-side.
const insertToggleButtons = () => {
  const header = document.querySelector('header#header') || document.querySelector('header');
  if (!header) return;
  if (header.querySelector('[data-theme-toggle]')) return;

  const desktopTarget = header.querySelector<HTMLElement>('.lg\\:flex.hidden.justify-end')
    || header.querySelector<HTMLElement>('.lg\\:flex.hidden');
  const mobileTarget = header.querySelector<HTMLElement>('.lg\\:hidden.inline-flex')
    || header.querySelector<HTMLElement>('.lg\\:hidden');
  const menuTarget = header.querySelector<HTMLElement>('.header_top-menu')
    || header.querySelector<HTMLElement>('.header__top--menu');
  const logoTarget = header.querySelector<HTMLElement>('.header_top-logo')
    || header.querySelector<HTMLElement>('.header__top--logo');
  const fallbackTarget = header.querySelector<HTMLElement>('.flex');

  let inserted = false;

  if (desktopTarget) {
    const button = createToggle(false);
    desktopTarget.prepend(button);
    inserted = true;
  }

  if (mobileTarget && mobileTarget !== desktopTarget) {
    const button = createToggle(true);
    mobileTarget.prepend(button);
    inserted = true;
  }

  if (!inserted && menuTarget) {
    const button = createToggle(false);
    menuTarget.prepend(button);
    inserted = true;
  }

  if (!inserted && logoTarget && logoTarget.parentElement) {
    const button = createToggle(false);
    logoTarget.parentElement.appendChild(button);
    inserted = true;
  }

  if (!inserted && fallbackTarget) {
    const button = createToggle(false);
    fallbackTarget.appendChild(button);
  }
};

export default function ThemeToggleClient() {
  useEffect(() => {
    const theme = getStoredTheme();
    applyTheme(theme);
    insertToggleButtons();
    applyTheme(theme);

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest('[data-theme-toggle]') as HTMLElement | null;
      if (!button) return;
      event.preventDefault();
      const current = (document.documentElement.dataset.theme as ThemeMode) || DEFAULT_THEME;
      const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    };

    document.addEventListener('click', handleClick);

    const observer = new MutationObserver(() => {
      insertToggleButtons();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('click', handleClick);
      observer.disconnect();
    };
  }, []);

  return null;
}
