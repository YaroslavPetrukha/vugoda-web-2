import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { imagetools } from 'vite-imagetools';
import path from 'path';
import { defineConfig } from 'vite';

// Пресети для imagetools: ширини + формати AVIF/WebP/JPG як picture-об'єкт
const presets: Record<string, URLSearchParams> = {
  hero: new URLSearchParams('w=480;768;1280;1920&format=avif;webp;jpg&as=picture'),
  card: new URLSearchParams('w=320;640&format=avif;webp;jpg&as=picture'),
  gallery: new URLSearchParams('w=600;1200&format=avif;webp;jpg&as=picture'),
  construction: new URLSearchParams('w=400;800&format=avif;webp;jpg&as=picture&quality=70'),
};

export default defineConfig({
  plugins: [
    reactRouter(),
    tailwindcss(),
    imagetools({
      defaultDirectives: (url) => {
        const preset = url.searchParams.get('preset');
        return preset && presets[preset] ? presets[preset] : new URLSearchParams();
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
