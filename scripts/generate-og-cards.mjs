// Генерація OG-карток 1200×630 через SVG → sharp PNG
// Палітра: #2F3640 фон · #C1F33D lime акцент · #F5F7FA текст · #A7AFBC допоміжний

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../public/og');

fs.mkdirSync(outDir, { recursive: true });

// Декоративні ізометричні лінії — тонкий бренд-акцент
const isoLines = `
  <line x1="0" y1="420" x2="400" y2="190" stroke="#C1F33D" stroke-width="1" opacity="0.08"/>
  <line x1="0" y1="500" x2="500" y2="225" stroke="#C1F33D" stroke-width="1" opacity="0.08"/>
  <line x1="0" y1="580" x2="600" y2="260" stroke="#C1F33D" stroke-width="1" opacity="0.08"/>
  <line x1="900" y1="0" x2="1200" y2="150" stroke="#C1F33D" stroke-width="1" opacity="0.06"/>
  <line x1="800" y1="0" x2="1200" y2="267" stroke="#C1F33D" stroke-width="1" opacity="0.06"/>
`;

function buildSvg(title, subtitle) {
  // Екрануємо XML-символи у рядках
  const esc = (s) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- фон -->
  <rect width="1200" height="630" fill="#2F3640"/>

  <!-- декоративні лінії -->
  ${isoLines}

  <!-- lime-акцент зверху зліва -->
  <rect x="80" y="80" width="220" height="6" fill="#C1F33D" rx="3"/>

  <!-- заголовок -->
  <text
    x="80"
    y="260"
    font-family="Montserrat, Arial, sans-serif"
    font-size="68"
    font-weight="700"
    fill="#F5F7FA"
    letter-spacing="-1"
  >${esc(title)}</text>

  <!-- підзаголовок -->
  <text
    x="80"
    y="330"
    font-family="Montserrat, Arial, sans-serif"
    font-size="30"
    font-weight="500"
    fill="#A7AFBC"
  >${esc(subtitle)}</text>

  <!-- роздільник -->
  <rect x="80" y="368" width="60" height="3" fill="#C1F33D" rx="1.5"/>

  <!-- wordmark ВИГОДА знизу справа -->
  <text
    x="1120"
    y="578"
    font-family="Montserrat, Arial, sans-serif"
    font-size="40"
    font-weight="700"
    fill="#F5F7FA"
    text-anchor="end"
    opacity="0.9"
  >ВИГОДА</text>

  <!-- lime крапка перед wordmark -->
  <rect x="1124" y="558" width="6" height="6" fill="#C1F33D" rx="3"/>
</svg>`;
}

const cards = [
  // Типові сторінки
  { slug: 'home', title: 'Системний девелопмент', subtitle: 'ВИГОДА · Львів' },
  { slug: 'approach', title: 'Як ми будуємо', subtitle: 'Методологія' },
  { slug: 'investors', title: 'Для інвесторів', subtitle: 'Захист капіталу · доказовість' },
  { slug: 'partners', title: 'Для партнерів', subtitle: 'Банки · підрядники · юристи' },
  { slug: 'contacts', title: 'Контакти', subtitle: 'Зв\'яжіться з нами' },
  { slug: 'news', title: 'Новини', subtitle: 'Хід будівництва' },

  // Проєктні картки
  { slug: 'lakeview', title: 'ЖК Lakeview', subtitle: 'Бізнес-клас · Львів · 2027' },
  { slug: 'etno-dim', title: 'ЖК Етно Дім', subtitle: 'Pipeline · вул. Судова' },
  { slug: 'maetok', title: 'ЖК Маєток Винниківський', subtitle: 'Pipeline · Винники' },
  { slug: 'nterest', title: 'Дохідний дім NTEREST', subtitle: 'Pipeline · інвест. продукт' },
  { slug: 'pipeline-04', title: 'Новий проєкт', subtitle: 'У роботі' },
];

let generated = 0;

for (const { slug, title, subtitle } of cards) {
  const svg = buildSvg(title, subtitle);
  const outPath = path.join(outDir, `${slug}.png`);

  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 8 })
    .toFile(outPath);

  const stat = fs.statSync(outPath);
  const kb = (stat.size / 1024).toFixed(1);
  console.log(`  ${slug}.png — ${kb} KB`);
  generated++;
}

console.log(`\nГотово: ${generated} OG-карток у public/og/`);
