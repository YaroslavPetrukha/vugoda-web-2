// Smoke-тести для 13 сторінок — Phase 0 safety net.
// Перевіряємо: компонент рендериться без runtime error.
// Layout навмисно виключено — тестуємо сторінки ізольовано.

import { type ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect } from 'vitest';

import Home from '@/app/routes/_index';
import Approach from '@/app/routes/pidkhid';
import Portfolio from '@/app/routes/portfolio._index';
import ProjectLakeview from '@/app/routes/portfolio.lakeview';
import ProjectEtnoDim from '@/app/routes/portfolio.etno-dim';
import ProjectMaetok from '@/app/routes/portfolio.maetok';
import ProjectNterest from '@/app/routes/portfolio.nterest';
import ProjectPipeline04 from '@/app/routes/portfolio.pipeline-04';
import Investors from '@/app/routes/investoram';
import Partners from '@/app/routes/partneram';
import Contacts from '@/app/routes/kontakty';
import News from '@/app/routes/novyny';
import NotFound from '@/app/routes/$';

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
