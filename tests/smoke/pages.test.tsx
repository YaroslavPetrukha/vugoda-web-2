// Smoke-тести для 14 сторінок — Phase 0 safety net.
// Перевіряємо: компонент рендериться без runtime error.
// Layout навмисно виключено — тестуємо сторінки ізольовано.

import { type ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
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
import ThankYou from '@/app/routes/diakuyu';

const wrap = (ui: ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Smoke tests — 14 сторінок', () => {
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

  it('ThankYou рендериться без помилок та містить heading', () => {
    wrap(<ThankYou />);
    expect(screen.getByRole('heading', { level: 1, name: 'Заявку прийнято' })).toBeTruthy();
  });

  it('ThankYou — invalid source та id не рендерять DOM content з params', () => {
    render(
      <MemoryRouter initialEntries={['/?source=javascript%3Aalert(1)&id=<script>evil</script>']}>
        <ThankYou />
      </MemoryRouter>,
    );
    // Invalid source → no source-specific link; invalid id → no requestId block
    const body = document.body.innerHTML;
    expect(body).not.toContain('javascript:alert');
    expect(body).not.toContain('<script>evil');
    // Heading still present
    expect(screen.getByRole('heading', { level: 1, name: 'Заявку прийнято' })).toBeTruthy();
  });

  it('ThankYou — valid source project-lakeview → Lakeview link', () => {
    render(
      <MemoryRouter initialEntries={['/diakuyu?source=project-lakeview&id=550e8400']}>
        <ThankYou />
      </MemoryRouter>,
    );
    expect(screen.getByText('Подивитись Lakeview')).toBeTruthy();
    // requestId text split across text nodes due to nbsp — use regex matcher
    expect(screen.getByText(/550e8400/)).toBeTruthy();
  });
});
