import type { CSSProperties, ImgHTMLAttributes } from 'react';

// Тип, який повертає vite-imagetools з `?as=picture` директивою
export type PictureSource = {
  sources: {
    avif?: string;
    webp?: string;
    [key: string]: string | undefined;
  };
  img: {
    src: string;
    w: number;
    h: number;
  };
};

export type PictureProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> & {
  source: PictureSource;
  alt: string;
  /** Якщо true — eager loading + high priority, для LCP-кандидата */
  priority?: boolean;
  /** sizes attribute для responsive */
  sizes?: string;
  className?: string;
  style?: CSSProperties;
};

const Picture = ({ source, alt, priority = false, sizes, className, style, ...imgProps }: PictureProps) => {
  return (
    <picture>
      {source.sources.avif && (
        <source type="image/avif" srcSet={source.sources.avif} sizes={sizes} />
      )}
      {source.sources.webp && (
        <source type="image/webp" srcSet={source.sources.webp} sizes={sizes} />
      )}
      <img
        src={source.img.src}
        width={source.img.w}
        height={source.img.h}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={className}
        style={style}
        {...imgProps}
      />
    </picture>
  );
};

export default Picture;
