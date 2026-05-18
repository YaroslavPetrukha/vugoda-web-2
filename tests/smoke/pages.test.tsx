// Smoke-тести для 13 сторінок — Phase 0 safety net.
// Перевіряємо: компонент рендериться без runtime error.
// Layout навмисно виключено — тестуємо сторінки ізольовано.

import { type ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

import Home from '@/src/pages/Home';
import Approach from '@/src/pages/Approach';
import Portfolio from '@/src/pages/Portfolio';
import ProjectLakeview from '@/src/pages/ProjectLakeview';
import ProjectEtnoDim from '@/src/pages/ProjectEtnoDim';
import ProjectMaetok from '@/src/pages/ProjectMaetok';
import ProjectNterest from '@/src/pages/ProjectNterest';
import ProjectPipeline04 from '@/src/pages/ProjectPipeline04';
import Investors from '@/src/pages/Investors';
import Partners from '@/src/pages/Partners';
import Contacts from '@/src/pages/Contacts';
import News from '@/src/pages/News';
import NotFound from '@/src/pages/NotFound';

const wrap = (ui: ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Smoke tests — 13 сторінок', () => {
  it('Home рендериться без помилок', () => {
    wrap(<Home />);
    expect(document.body).toBeTruthy();
  });

  it('Approach рендериться без помилок', () => {
    wrap(<Approach />);
    expect(document.body).toBeTruthy();
  });

  it('Portfolio рендериться без помилок', () => {
    wrap(<Portfolio />);
    expect(document.body).toBeTruthy();
  });

  it('ProjectLakeview рендериться без помилок', () => {
    wrap(<ProjectLakeview />);
    expect(document.body).toBeTruthy();
  });

  it('ProjectEtnoDim рендериться без помилок', () => {
    wrap(<ProjectEtnoDim />);
    expect(document.body).toBeTruthy();
  });

  it('ProjectMaetok рендериться без помилок', () => {
    wrap(<ProjectMaetok />);
    expect(document.body).toBeTruthy();
  });

  it('ProjectNterest рендериться без помилок', () => {
    wrap(<ProjectNterest />);
    expect(document.body).toBeTruthy();
  });

  it('ProjectPipeline04 рендериться без помилок', () => {
    wrap(<ProjectPipeline04 />);
    expect(document.body).toBeTruthy();
  });

  it('Investors рендериться без помилок', () => {
    wrap(<Investors />);
    expect(document.body).toBeTruthy();
  });

  it('Partners рендериться без помилок', () => {
    wrap(<Partners />);
    expect(document.body).toBeTruthy();
  });

  it('Contacts рендериться без помилок', () => {
    wrap(<Contacts />);
    expect(document.body).toBeTruthy();
  });

  it('News рендериться без помилок', () => {
    wrap(<News />);
    expect(document.body).toBeTruthy();
  });

  it('NotFound рендериться без помилок', () => {
    wrap(<NotFound />);
    expect(document.body).toBeTruthy();
  });
});
