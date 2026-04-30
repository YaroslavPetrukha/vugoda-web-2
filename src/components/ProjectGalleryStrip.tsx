type ImgItem = {
  src: string;
  alt: string;
  caption?: string;
};

type ProjectGalleryStripProps = {
  images: ImgItem[];
  variant?: 'wide' | 'square';
  className?: string;
  ariaLabel?: string;
};

const ProjectGalleryStrip = ({
  images,
  variant = 'wide',
  className = '',
  ariaLabel = 'Галерея зображень проекту',
}: ProjectGalleryStripProps) => {
  const itemSize =
    variant === 'wide'
      ? 'w-[80%] md:w-[480px] aspect-[4/3]'
      : 'w-[70%] md:w-[360px] aspect-square';

  return (
    <ul
      role="list"
      aria-label={ariaLabel}
      className={`flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 lg:mx-0 lg:px-0 ${className}`}
    >
      {images.map((img, i) => (
        <li
          key={`${img.src}-${i}`}
          className={`flex-none ${itemSize} snap-start relative bg-bg-surface`}
        >
          <img
            src={img.src}
            alt={img.alt}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover rounded-none"
          />
          {img.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-bg-deep/80 backdrop-blur-sm px-4 py-2 text-xs uppercase tracking-widest text-text-primary">
              {img.caption}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default ProjectGalleryStrip;
