type TrustFact = { label: string; value: string };

type TrustStripeProps = {
  facts?: TrustFact[];
  className?: string;
};

const DEFAULT_FACTS: TrustFact[] = [
  { label: 'ЄДРПОУ', value: '42016395' },
  { label: 'Ліцензія', value: 'від 27.12.2019' },
  { label: 'Технологія', value: 'Монолітно-каркас' },
  { label: 'У роботі', value: '4 проєкти' },
];

const TrustStripe = ({ facts = DEFAULT_FACTS, className = '' }: TrustStripeProps) => {
  return (
    <section
      className={`bg-bg-deep border-y border-bg-surface py-8 px-6 lg:px-8 ${className}`}
      aria-label="Юридичний фактаж"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-bg-surface">
        {facts.map((f) => (
          <div key={f.label} className="bg-bg-deep p-6">
            <div className="text-[10px] uppercase tracking-widest text-text-secondary mb-2">
              {f.label}
            </div>
            <div className="text-base md:text-lg font-bold text-text-primary">
              {f.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustStripe;
