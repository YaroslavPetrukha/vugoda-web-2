import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Мок для vite-imagetools ?preset= директив у тестовому середовищі (jsdom).
// Vitest не запускає vite-imagetools — підставляємо заглушку PictureSource.
// Стратегія: transform перехоплює файли що мають ?preset= у query string.
const MOCK_PICTURE_SOURCE = JSON.stringify({
  sources: { avif: '', webp: '' },
  img: { src: 'mock.jpg', w: 100, h: 100 },
});

const imagetoolsMock = {
  name: 'imagetools-mock',
  enforce: 'pre' as const,
  load(id: string) {
    // Vitest передає id з query string: /abs/path/to/file.jpg?preset=hero
    if (/\.(jpe?g|webp|png|avif)\?preset=/.test(id)) {
      return `export default ${MOCK_PICTURE_SOURCE};`;
    }
  },
};

export default defineConfig({
  plugins: [imagetoolsMock, react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
