import React from "react";
import { Image } from "lucide-react";
import { optimizeImageUrl } from "../lib/optimizeImage";

interface ImagePlaceholderProps {
  width?: string;
  height?: string;
  aspectRatio?: string;
  className?: string;
  label?: string;
  subLabel?: string;
  clean?: boolean;
  src?: string;
  alt?: string;
  /** lazy = below fold, eager = hero / first screen */
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  imageWidth?: number;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  aspectRatio = "aspect-[3/4]",
  className = "",
  label = "Superior Trends",
  subLabel = "Al Alisha Collection",
  clean = false,
  src,
  alt = "",
  loading = "lazy",
  fetchPriority = "auto",
  imageWidth = 480,
}) => {
  const [imgFailed, setImgFailed] = React.useState(false);
  const optimizedSrc = optimizeImageUrl(src, imageWidth);

  if (optimizedSrc && !imgFailed) {
    return (
      <div
        className={`relative w-full ${aspectRatio} overflow-hidden bg-[#F3EFEA] ${className}`}
      >
        <img
          src={optimizedSrc}
          alt={alt || label}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${aspectRatio} bg-[#F3EFEA] border border-[#E6DFD5] overflow-hidden flex flex-col items-center justify-center p-6 text-center select-none group hover:bg-[#EAE3DA] transition-colors duration-500 ${className}`}
    >
      <svg
        className="absolute inset-0 w-full h-full text-[#E0D8CE]/40 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="0"
          y1="0"
          x2="100%"
          y2="100%"
          stroke="currentColor"
          strokeWidth="0.5"
        />
        <line
          x1="100%"
          y1="0"
          x2="0"
          y2="100%"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      </svg>

      <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-brand-gold/40" />
      <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-brand-gold/40" />
      <div className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-brand-gold/40" />
      <div className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-brand-gold/40" />

      {!clean && (
        <div className="relative z-10 flex flex-col items-center space-y-3 transition-transform duration-500 group-hover:scale-[1.03]">
          <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center text-brand-gold shadow-sm border border-brand-gold/15">
            <Image size={18} strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#4E483F] font-sans">
              {label}
            </p>
            <p className="text-[9px] tracking-widest uppercase italic text-brand-gold font-serif">
              {subLabel}
            </p>
          </div>
          <span className="text-[8px] tracking-wider text-[#A09587] uppercase font-sans mt-2 bg-white/40 px-2 py-0.5 border border-[#E0D8CE]">
            Asset Placeholder
          </span>
        </div>
      )}
    </div>
  );
};
