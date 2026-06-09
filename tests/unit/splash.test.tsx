// Unit-тест для <Splash/> — site-load preloader (cube «Конструктор»).
// Перевіряємо детермінований hydration-safe markup + a11y контракт.

import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Splash from '@/src/components/Splash';

describe('Splash preloader', () => {
  it('рендериться без помилок', () => {
    const { container } = render(<Splash />);
    expect(container).toBeTruthy();
  });

  it('має overlay #vg-splash, декоративний (aria-hidden)', () => {
    const { container } = render(<Splash />);
    const overlay = container.querySelector('#vg-splash');
    expect(overlay).not.toBeNull();
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
  });

  it('містить 3 грані куба з outer/inner path-ами', () => {
    const { container } = render(<Splash />);
    expect(container.querySelectorAll('.vg-face')).toHaveLength(3);
    expect(container.querySelectorAll('.vg-outer')).toHaveLength(3);
    expect(container.querySelectorAll('.vg-inner')).toHaveLength(3);
  });

  it('outer-грані нормалізовані pathLength=1 (для stroke-draw)', () => {
    const { container } = render(<Splash />);
    container.querySelectorAll('.vg-outer').forEach((p) => {
      expect(p).toHaveAttribute('pathLength', '1');
    });
  });

  it('кожна грань має stagger-індекс --i', () => {
    const { container } = render(<Splash />);
    const faces = Array.from(container.querySelectorAll<HTMLElement>('.vg-face'));
    expect(faces.map((f) => f.style.getPropertyValue('--i'))).toEqual(['0', '1', '2']);
  });

  it('не містить фокусованих елементів (без focus-trap)', () => {
    const { container } = render(<Splash />);
    const focusable = container.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]',
    );
    expect(focusable).toHaveLength(0);
  });
});
