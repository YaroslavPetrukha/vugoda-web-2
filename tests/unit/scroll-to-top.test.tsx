// ScrollToTop — visibility-on-scroll, accessible toggle, reduced-motion behaviour.
// jsdom lacks window.scrollTo and rAF timing control — both are stubbed below.

import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import ScrollToTop from '@/src/components/ScrollToTop';

// Drive scrollY + flush the rAF-throttled handler synchronously.
const setScrollY = (y: number) => {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
};

beforeEach(() => {
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  // rAF in jsdom is undefined → run the callback immediately.
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
  window.scrollTo = vi.fn();
});

afterEach(() => {
  // Restore everything this file touched so it cannot pollute other test files
  // under any execution order: stubbed globals, scrollY, scrollTo, matchMedia.
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  delete (window as { scrollTo?: unknown }).scrollTo;
});

describe('ScrollToTop', () => {
  it('is hidden (not a tab-stop) before the scroll threshold', () => {
    render(<ScrollToTop />);
    const btn = screen.getByRole('button', { hidden: true });
    expect(btn).toHaveAttribute('aria-hidden', 'true');
    expect(btn).toHaveAttribute('tabindex', '-1');
    expect(btn.className).toContain('opacity-0');
    expect(btn.className).toContain('pointer-events-none');
  });

  it('becomes visible and keyboard-reachable past the threshold', () => {
    render(<ScrollToTop />);
    setScrollY(800);
    const btn = screen.getByRole('button', { hidden: true });
    expect(btn).toHaveAttribute('aria-hidden', 'false');
    expect(btn).toHaveAttribute('tabindex', '0');
    expect(btn).toHaveAccessibleName('Прокрутити вгору');
    expect(btn.className).toContain('opacity-100');
  });

  it('hides again when scrolled back near the top', () => {
    render(<ScrollToTop />);
    setScrollY(800);
    setScrollY(100);
    const btn = screen.getByRole('button', { hidden: true });
    expect(btn).toHaveAttribute('aria-hidden', 'true');
  });

  it('scrolls smoothly to top on click (motion allowed)', () => {
    render(<ScrollToTop />);
    setScrollY(800);
    act(() => {
      screen.getByRole('button', { hidden: true }).click();
    });
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('scrolls instantly under prefers-reduced-motion', () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList);

    render(<ScrollToTop />);
    setScrollY(800);
    act(() => {
      screen.getByRole('button', { hidden: true }).click();
    });
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });
});
