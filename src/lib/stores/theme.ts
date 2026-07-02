import { writable } from 'svelte/store';

export type ThemeType = 'dark' | 'light';

export const theme = writable<ThemeType>('dark');

let isInitialized = false;

export function initTheme() {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  // 1. Initialize Theme
  let savedTheme = localStorage.getItem('theme-preference') as ThemeType | null;
  if (!savedTheme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    savedTheme = prefersDark ? 'dark' : 'light';
  }
  theme.set(savedTheme);
  applyTheme(savedTheme);

  // Listen to OS changes if user hasn't explicitly set a preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme-preference')) {
      const nextTheme = e.matches ? 'dark' : 'light';
      theme.set(nextTheme);
      applyTheme(nextTheme);
    }
  });

  // Clear legacy device-accent preference if stored
  if (localStorage.getItem('device-accent-preference')) {
    localStorage.removeItem('device-accent-preference');
  }

  // Ensure legacy class is removed from root
  document.documentElement.classList.remove('device-accent');
}

export function toggleTheme() {
  theme.update((current) => {
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme-preference', next);
    applyTheme(next);
    return next;
  });
}

function applyTheme(t: ThemeType) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (t === 'light') {
    root.classList.add('light');
    root.style.colorScheme = 'light';
  } else {
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  }
}
