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
      className={`bg-bg-base border-t-2 border-t-accent border-b border-b-bg-surface py-10 md:py-12 px-6 lg:px-8 ${className}`}
      aria-label="Юридичний фактаж"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-bg-surface">
        {facts.map((f) => (
          <div key={f.label} className="bg-bg-base p-4 md:p-6">
            <div className="text-[11px] md:text-xs uppercase tracking-[0.14em] text-text-secondary mb-1.5">
              {f.label}
            </div>
            <div className="text-lg md:text-xl font-bold text-text-primary tabular-nums tracking-tight whitespace-nowrap">
              {f.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustStripe;
