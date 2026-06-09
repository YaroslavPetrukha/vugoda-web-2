// /novyny category filter — URL-driven, accessible, data-derived.
// Covers: chip derivation, default (all), per-category filtering, empty state,
// and the a11y contract (nav label, aria-current, no aria-pressed).

import { type ReactElement } from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect } from 'vitest';

import News from '@/app/routes/novyny';
import { articles, articleCategoryChips } from '@/src/data/articles';

const at = (url: string): ReactElement => (
  <MemoryRouter initialEntries={[url]}>
    <News />
  </MemoryRouter>
);

// Helper: the editorial article cards link to /novyny/<slug>.
const articleCardTitles = () =>
  screen
    .getAllByRole('link')
    .filter((a) => a.getAttribute('href')?.startsWith('/novyny/'))
    .map((a) => a.textContent);

describe('articleCategoryChips (derived)', () => {
  it('derives one chip per present category, in canonical order', () => {
    expect(articleCategoryChips.map((c) => c.slug)).toEqual([
      'construction-progress',
      'guide',
      'analysis',
    ]);
  });

  it('label comes from the article categoryLabel', () => {
    const guide = articleCategoryChips.find((c) => c.slug === 'guide');
    expect(guide?.label).toBe('Гід покупця');
  });
});

describe('/novyny category filter', () => {
  it('default (no param) shows ALL articles; «Усі» is aria-current', () => {
    render(at('/novyny'));
    expect(articleCardTitles()).toHaveLength(articles.length);
    const all = screen.getByRole('link', { name: 'Усі' });
    expect(all).toHaveAttribute('aria-current', 'true');
  });

  it('?category=analysis shows only the analysis article', () => {
    render(at('/novyny?category=analysis'));
    const titles = articleCardTitles();
    expect(titles).toHaveLength(1);
    expect(titles[0]).toContain('Франківському');
    // active chip marked, «Усі» not
    expect(screen.getByRole('link', { name: 'Аналітика' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'Усі' })).not.toHaveAttribute('aria-current');
  });

  it('?category=guide shows only the guide article', () => {
    render(at('/novyny?category=guide'));
    const titles = articleCardTitles();
    expect(titles).toHaveLength(1);
    expect(titles[0]).toContain('перевірити забудовника');
  });

  it('unknown category → empty state with a reset link, count 0', () => {
    render(at('/novyny?category=bogus'));
    expect(articleCardTitles()).toHaveLength(0);
    expect(screen.getByRole('link', { name: /Показати всі/i })).toHaveAttribute('href', '/novyny');
  });

  it('a11y: filter is a labelled <nav>, chips are links, none use aria-pressed', () => {
    render(at('/novyny'));
    const nav = screen.getByRole('navigation', { name: /категорі/i });
    const chips = within(nav).getAllByRole('link');
    expect(chips.length).toBe(articleCategoryChips.length + 1); // + «Усі»
    chips.forEach((c) => expect(c).not.toHaveAttribute('aria-pressed'));
  });

  it('a11y: a polite status region announces the result count', () => {
    render(at('/novyny?category=guide'));
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status.textContent).toMatch(/1/);
  });
});
