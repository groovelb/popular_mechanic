import React from 'react';
import { EDITORIAL_COLORS } from '../../content/magazineContent';

// ============================================
// Base Layout Components
// ============================================

interface PageProps {
  children: React.ReactNode;
  pageNumber?: number;
  className?: string;
}

export const MagazinePage: React.FC<PageProps> = ({ children, pageNumber, className = '' }) => (
  <section
    className={`relative min-h-screen py-8 sm:py-12 md:py-16 px-3 sm:px-4 md:px-8 lg:px-16 ${className}`}
    style={{ backgroundColor: EDITORIAL_COLORS.paper }}
  >
    <div className="max-w-5xl mx-auto">
      {children}
    </div>
    {pageNumber && (
      <div
        className="absolute bottom-2 sm:bottom-4 right-4 sm:right-8 text-xs sm:text-sm"
        style={{ color: EDITORIAL_COLORS.inkLight, fontFamily: "Georgia, serif" }}
      >
        {pageNumber}
      </div>
    )}
  </section>
);

// Two Column Layout
interface TwoColumnProps {
  children: React.ReactNode;
  gap?: string;
  className?: string;
}

export const TwoColumn: React.FC<TwoColumnProps> = ({ children, gap = 'gap-8', className = '' }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 ${gap} ${className}`}>
    {children}
  </div>
);

// Three Column Layout
export const ThreeColumn: React.FC<TwoColumnProps> = ({ children, gap = 'gap-6', className = '' }) => (
  <div className={`grid grid-cols-1 md:grid-cols-3 ${gap} ${className}`}>
    {children}
  </div>
);

// ============================================
// Typography Components
// ============================================

interface HeadlineProps {
  children: React.ReactNode;
  size?: 'xl' | '2xl' | '3xl' | '4xl';
  underline?: boolean;
  className?: string;
}

export const Headline: React.FC<HeadlineProps> = ({
  children,
  size = '3xl',
  underline = false,
  className = ''
}) => {
  const sizeClasses = {
    xl: 'text-xl md:text-2xl',
    '2xl': 'text-2xl md:text-3xl',
    '3xl': 'text-3xl md:text-4xl',
    '4xl': 'text-4xl md:text-5xl',
  };

  return (
    <h2
      className={`font-bold leading-tight ${sizeClasses[size]} ${className}`}
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: EDITORIAL_COLORS.ink,
        textDecoration: underline ? 'underline' : 'none',
        textDecorationThickness: '3px',
        textUnderlineOffset: '4px',
      }}
    >
      {children}
    </h2>
  );
};

interface SubheadlineProps {
  children: React.ReactNode;
  italic?: boolean;
  className?: string;
}

export const Subheadline: React.FC<SubheadlineProps> = ({
  children,
  italic = true,
  className = ''
}) => (
  <h3
    className={`text-lg md:text-xl ${className}`}
    style={{
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontStyle: italic ? 'italic' : 'normal',
      color: EDITORIAL_COLORS.inkLight,
    }}
  >
    {children}
  </h3>
);

interface BodyTextProps {
  children: React.ReactNode;
  columns?: 1 | 2;
  dropCap?: boolean;
  className?: string;
}

export const BodyText: React.FC<BodyTextProps> = ({
  children,
  columns = 1,
  dropCap = false,
  className = ''
}) => (
  <div
    className={`text-base leading-relaxed ${className}`}
    style={{
      fontFamily: "Georgia, 'Times New Roman', serif",
      color: EDITORIAL_COLORS.ink,
      columnCount: columns,
      columnGap: '2rem',
      textAlign: 'justify',
    }}
  >
    {dropCap ? (
      <span className="first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:leading-none">
        {children}
      </span>
    ) : (
      children
    )}
  </div>
);

interface LabelProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({
  children,
  color = EDITORIAL_COLORS.ink,
  className = ''
}) => (
  <span
    className={`text-xs uppercase tracking-widest font-bold ${className}`}
    style={{
      fontFamily: "Arial, sans-serif",
      color,
    }}
  >
    {children}
  </span>
);

// ============================================
// Decorative Elements
// ============================================

interface DividerProps {
  style?: 'line' | 'double' | 'dotted' | 'ornament';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ style = 'line', className = '' }) => {
  if (style === 'double') {
    return (
      <div className={`my-6 ${className}`}>
        <div className="border-t-2 border-b" style={{ borderColor: EDITORIAL_COLORS.border, paddingBottom: '2px' }} />
      </div>
    );
  }

  if (style === 'dotted') {
    return (
      <div
        className={`my-6 border-b-2 border-dotted ${className}`}
        style={{ borderColor: EDITORIAL_COLORS.inkLight }}
      />
    );
  }

  if (style === 'ornament') {
    return (
      <div className={`my-8 flex items-center justify-center ${className}`}>
        <span style={{ color: EDITORIAL_COLORS.ink, fontFamily: "Georgia, serif" }}>
          ◆ ◆ ◆
        </span>
      </div>
    );
  }

  return (
    <div
      className={`my-6 border-b ${className}`}
      style={{ borderColor: EDITORIAL_COLORS.border }}
    />
  );
};

interface PullQuoteProps {
  children: React.ReactNode;
  attribution?: string;
  className?: string;
}

export const PullQuote: React.FC<PullQuoteProps> = ({
  children,
  attribution,
  className = ''
}) => (
  <blockquote
    className={`my-8 py-6 px-8 border-t-4 border-b-4 ${className}`}
    style={{
      borderColor: EDITORIAL_COLORS.border,
      backgroundColor: EDITORIAL_COLORS.paperDark,
    }}
  >
    <p
      className="text-2xl md:text-3xl italic leading-relaxed"
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: EDITORIAL_COLORS.ink,
      }}
    >
      {children}
    </p>
    {attribution && (
      <cite
        className="block mt-4 text-sm not-italic"
        style={{
          fontFamily: "Arial, sans-serif",
          color: EDITORIAL_COLORS.inkLight,
        }}
      >
        — {attribution}
      </cite>
    )}
  </blockquote>
);

// ============================================
// Box/Frame Components
// ============================================

interface BoxProps {
  children: React.ReactNode;
  variant?: 'default' | 'highlight' | 'dark';
  border?: boolean;
  className?: string;
}

export const Box: React.FC<BoxProps> = ({
  children,
  variant = 'default',
  border = true,
  className = ''
}) => {
  const bgColors = {
    default: EDITORIAL_COLORS.paper,
    highlight: EDITORIAL_COLORS.highlight,
    dark: EDITORIAL_COLORS.ink,
  };

  const textColors = {
    default: EDITORIAL_COLORS.ink,
    highlight: EDITORIAL_COLORS.ink,
    dark: EDITORIAL_COLORS.paper,
  };

  return (
    <div
      className={`p-6 ${className}`}
      style={{
        backgroundColor: bgColors[variant],
        color: textColors[variant],
        border: border ? `3px solid ${EDITORIAL_COLORS.border}` : 'none',
      }}
    >
      {children}
    </div>
  );
};

interface PriceTagProps {
  originalPrice?: string;
  salePrice: string;
  label?: string;
  className?: string;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  originalPrice,
  salePrice,
  label,
  className = ''
}) => (
  <div
    className={`inline-block p-4 text-center ${className}`}
    style={{
      backgroundColor: EDITORIAL_COLORS.highlight,
      border: `3px solid ${EDITORIAL_COLORS.border}`,
    }}
  >
    {label && (
      <div
        className="text-xs uppercase font-bold mb-1"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {label}
      </div>
    )}
    {originalPrice && (
      <div
        className="text-lg line-through opacity-60"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {originalPrice}
      </div>
    )}
    <div
      className="text-3xl font-black"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {salePrice}
    </div>
  </div>
);

// ============================================
// Image Components
// ============================================

interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  className?: string;
}

export const Figure: React.FC<FigureProps> = ({
  src,
  alt,
  caption,
  credit,
  className = ''
}) => (
  <figure className={`${className}`}>
    <div
      className="overflow-hidden"
      style={{ border: `1px solid ${EDITORIAL_COLORS.border}` }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-500"
      />
    </div>
    {(caption || credit) && (
      <figcaption
        className="mt-2 text-sm"
        style={{
          fontFamily: "Arial, sans-serif",
          color: EDITORIAL_COLORS.inkLight,
        }}
      >
        {caption}
        {credit && <span className="italic"> — {credit}</span>}
      </figcaption>
    )}
  </figure>
);

// ============================================
// Page Header/Footer
// ============================================

interface PageHeaderProps {
  left?: string;
  center?: string;
  right?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  left,
  center,
  right,
  className = ''
}) => (
  <div
    className={`flex justify-between items-center pb-2 sm:pb-4 mb-4 sm:mb-8 border-b-2 text-[9px] sm:text-[11px] ${className}`}
    style={{
      borderColor: EDITORIAL_COLORS.border,
      fontFamily: "Arial, sans-serif",
      color: EDITORIAL_COLORS.inkLight,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    }}
  >
    <span className="hidden sm:inline">{left}</span>
    <span className="font-bold">{center}</span>
    <span className="hidden sm:inline">{right}</span>
  </div>
);

export const PageFooter: React.FC<PageHeaderProps> = ({
  left,
  center,
  right,
  className = ''
}) => (
  <div
    className={`flex justify-between items-center pt-2 sm:pt-4 mt-4 sm:mt-8 border-t text-[9px] sm:text-[11px] ${className}`}
    style={{
      borderColor: EDITORIAL_COLORS.border,
      fontFamily: "Arial, sans-serif",
      color: EDITORIAL_COLORS.inkLight,
    }}
  >
    <span className="hidden sm:inline">{left}</span>
    <span>{center}</span>
    <span className="font-bold">{right}</span>
  </div>
);
