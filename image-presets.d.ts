// Декларації типів для vite-imagetools ?preset= директив
// ?as=picture повертає PictureSource (srcset рядки для avif, webp + img fallback)

type PictureSourceRef = {
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

declare module '*?preset=hero' {
  const src: PictureSourceRef;
  export default src;
}

declare module '*?preset=card' {
  const src: PictureSourceRef;
  export default src;
}

declare module '*?preset=gallery' {
  const src: PictureSourceRef;
  export default src;
}

declare module '*?preset=construction' {
  const src: PictureSourceRef;
  export default src;
}
