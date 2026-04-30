import type { ProjectStage } from '../types';

type StagePillProps = {
  stage: ProjectStage;
  label?: string;
  className?: string;
};

const STAGE_LABELS: Record<ProjectStage, string> = {
  memorandum: 'Меморандум',
  estimation: 'Кошторис',
  permits: 'Дозвільна',
  'pre-budget': 'Прорахунок',
  construction: 'Будується',
};

const StagePill = ({ stage, label, className = '' }: StagePillProps) => {
  const isActive = stage === 'construction';
  const text = label ?? STAGE_LABELS[stage];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-none border ${
        isActive
          ? 'bg-accent text-bg-deep border-accent'
          : 'bg-bg-surface text-text-primary border-text-secondary/30'
      } ${className}`}
    >
      {text}
    </span>
  );
};

export default StagePill;
