import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// motion/react (framer-motion) використовує IntersectionObserver для whileInView —
// jsdom не реалізує його, тому підставляємо заглушку-клас
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// ResizeObserver — також відсутній у jsdom, використовується motion
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

// matchMedia — відсутній у jsdom; HeroAmbient та інші компоненти
// перевіряють prefers-reduced-motion через window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

afterEach(() => {
  cleanup();
});
