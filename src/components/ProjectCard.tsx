import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '../types';
import StagePill from './StagePill';
import IsometricCubePlaceholder from './IsometricCubePlaceholder';

type Variant = 'featured' | 'default' | 'placeholder';

type ProjectCardProps = {
  project: Project;
  variant?: Variant;
  href?: string;
  external?: boolean;
  className?: string;
};

const ProjectCard = ({
  project,
  variant,
  href,
  external = false,
  className = '',
}: ProjectCardProps) => {
  const v: Variant =
    variant ??
    (project.slug === 'lakeview'
      ? 'featured'
      : project.hasRenders
      ? 'default'
      : 'placeholder');

  const targetHref = href ?? `/portfolio/${project.slug}`;

  const aspect =
    v === 'featured'
      ? 'aspect-[16/10]'
      : v === 'placeholder'
      ? 'aspect-[4/5]'
      : 'aspect-[4/5]';

  const wrapperCls = `relative block overflow-hidden bg-bg-surface border border-bg-surface group rounded-none ${aspect} ${className}`;

  const ariaLabel = `${project.name}, стадія: ${project.stageLabel}`;

  const Image = (
    <>
      {v !== 'placeholder' && project.cardImage && (
        <>
          <img
            src={`/vugoda-web-2${project.cardImage}`}
            alt={project.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-bg-deep/10 via-transparent to-bg-deep/85"
          />
        </>
      )}
      {v === 'placeholder' && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-deep">
          <IsometricCubePlaceholder
            size={288}
            className="opacity-50"
            ariaLabel={`${project.name} — стадія планування`}
          />
        </div>
      )}
    </>
  );

  const Overlay = (
    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 bg-bg-deep/75 backdrop-blur-md border-t border-bg-surface flex items-end justify-between gap-4">
      <div>
        <StagePill stage={project.stage} label={project.stageLabel} />
        <h3 className="text-lg md:text-2xl font-bold text-text-primary mt-3 leading-tight">
          {project.name}
        </h3>
        <p className="text-sm text-text-secondary mt-1">{project.location}</p>
      </div>
      <ArrowUpRight
        className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors flex-none"
        aria-hidden="true"
      />
    </div>
  );

  if (external) {
    return (
      <a
        href={targetHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={wrapperCls}
      >
        {Image}
        {Overlay}
      </a>
    );
  }

  return (
    <Link to={targetHref} aria-label={ariaLabel} className={wrapperCls}>
      {Image}
      {Overlay}
    </Link>
  );
};

export default ProjectCard;
