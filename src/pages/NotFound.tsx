import { ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import IsometricCubePlaceholder from '../components/IsometricCubePlaceholder';

const NotFound = () => (
  <section className="bg-bg-deep py-32 md:py-40 px-6 lg:px-8 min-h-[60vh] flex items-center">
    <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
      <IsometricCubePlaceholder
        size={160}
        className="text-accent opacity-40 mb-10"
        ariaLabel="404 — сторінку не знайдено"
      />
      <p className="text-accent font-mono text-xs uppercase tracking-widest mb-6">
        // 404
      </p>
      <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6 leading-[1.05] tracking-tight">
        Сторінку не знайдено
      </h1>
      <p className="text-text-secondary text-base md:text-lg mb-12 max-w-md leading-relaxed">
        Можливо, її ще не створено або URL некоректний. Поверніться на головну
        або перейдіть до портфеля.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button as="router" href="/" variant="primary" size="lg">
          На головну <ArrowRight className="w-4 h-4" />
        </Button>
        <Button as="router" href="/portfolio" variant="ghost" size="lg">
          Переглянути портфель
        </Button>
      </div>
    </div>
  </section>
);

export default NotFound;
