import React from 'react';
import {
  MagazinePage,
  TwoColumn,
  Headline,
  Subheadline,
  BodyText,
  Label,
  Divider,
  PullQuote,
  Box,
  PriceTag,
  PageHeader,
  PageFooter,
} from './MagazineLayout';
import {
  TABLE_OF_CONTENTS,
  FEATURE_ARTICLES,
  ADVERTISEMENTS,
  EDITORIAL_COLUMNS,
  EDITORIAL_COLORS,
} from '../../content/magazineContent';

// ============================================
// Table of Contents Section
// ============================================
export const TableOfContents: React.FC = () => (
  <MagazinePage pageNumber={2} className="border-t-8" style={{ borderColor: EDITORIAL_COLORS.border }}>
    <PageHeader
      left="Popular Mechanics Magazine"
      center="JANUARY 1959"
      right="Volume 111"
    />

    <TwoColumn gap="gap-12">
      {/* Left Column - TOC */}
      <div>
        <Headline size="2xl" className="mb-8">In This Issue...</Headline>

        {/* Automotive Section */}
        <div className="mb-8">
          <h3
            className="text-lg font-bold uppercase tracking-wide mb-4 pb-2 border-b-2"
            style={{
              fontFamily: "Arial, sans-serif",
              color: EDITORIAL_COLORS.ink,
              borderColor: EDITORIAL_COLORS.border,
            }}
          >
            {TABLE_OF_CONTENTS.automotive.title}
          </h3>
          <ul className="space-y-2">
            {TABLE_OF_CONTENTS.automotive.articles.map((article, idx) => (
              <li key={idx} className="flex justify-between items-baseline">
                <span
                  className="text-sm"
                  style={{ fontFamily: "Georgia, serif", color: EDITORIAL_COLORS.ink }}
                >
                  {article.title}
                  {article.subtitle && (
                    <span className="italic text-xs ml-2" style={{ color: EDITORIAL_COLORS.inkLight }}>
                      {article.subtitle}
                    </span>
                  )}
                </span>
                <span
                  className="text-sm font-bold ml-2"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  {article.page}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Craftsman Section */}
        <div className="mb-8">
          <h3
            className="text-lg font-bold uppercase tracking-wide mb-4 pb-2 border-b-2"
            style={{
              fontFamily: "Arial, sans-serif",
              color: EDITORIAL_COLORS.ink,
              borderColor: EDITORIAL_COLORS.border,
            }}
          >
            {TABLE_OF_CONTENTS.craftsman.title}
          </h3>
          <ul className="space-y-2">
            {TABLE_OF_CONTENTS.craftsman.articles.map((article, idx) => (
              <li key={idx} className="flex justify-between items-baseline">
                <span
                  className="text-sm"
                  style={{ fontFamily: "Georgia, serif", color: EDITORIAL_COLORS.ink }}
                >
                  {article.title}
                </span>
                <span
                  className="text-sm font-bold ml-2"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  {article.page}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Regular Departments */}
        <div className="mb-8">
          <h3
            className="text-lg font-bold uppercase tracking-wide mb-4 pb-2 border-b-2"
            style={{
              fontFamily: "Arial, sans-serif",
              color: EDITORIAL_COLORS.ink,
              borderColor: EDITORIAL_COLORS.border,
            }}
          >
            {TABLE_OF_CONTENTS.regular.title}
          </h3>
          <ul className="space-y-2">
            {TABLE_OF_CONTENTS.regular.articles.map((article, idx) => (
              <li key={idx} className="flex justify-between items-baseline">
                <span
                  className="text-sm"
                  style={{ fontFamily: "Georgia, serif", color: EDITORIAL_COLORS.ink }}
                >
                  {article.title}
                  {article.subtitle && (
                    <span className="italic text-xs ml-2" style={{ color: EDITORIAL_COLORS.inkLight }}>
                      {article.subtitle}
                    </span>
                  )}
                </span>
                <span
                  className="text-sm font-bold ml-2"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  {article.page}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Month Preview */}
        <Box variant="highlight" className="mt-8">
          <h4
            className="text-base font-bold uppercase mb-2"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            {EDITORIAL_COLUMNS.nextMonth.title}
          </h4>
          <p
            className="text-sm leading-relaxed"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {EDITORIAL_COLUMNS.nextMonth.preview}
          </p>
        </Box>
      </div>

      {/* Right Column - Featured Article Preview */}
      <div>
        <div
          className="p-6 mb-6"
          style={{
            backgroundColor: '#fff',
            border: `2px solid ${EDITORIAL_COLORS.border}`,
          }}
        >
          <Headline size="xl" className="mb-2">
            How I retired in 15 years with $300 a month
          </Headline>
          <Divider style="line" />
          <BodyText className="text-sm">
            "Something you promised me—security. And one was an afternoon Des Moines and I spent fishing in May 1948. It startled me because of him that I'm retired today—only 15 years later. It proves, with a little self-discipline, any man can take away..."
          </BodyText>
          <p
            className="mt-4 text-xs italic"
            style={{ fontFamily: "Georgia, serif", color: EDITORIAL_COLORS.inkLight }}
          >
            Continue reading on page 3...
          </p>
        </div>

        {/* Mini Ad */}
        <div
          className="p-4 text-center"
          style={{
            backgroundColor: EDITORIAL_COLORS.paperDark,
            border: `1px solid ${EDITORIAL_COLORS.border}`,
          }}
        >
          <p
            className="text-xs uppercase tracking-wider mb-2"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            Phoenix Mutual
          </p>
          <p
            className="text-lg font-bold"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Retirement Income Plan
          </p>
          <p
            className="text-xs mt-2"
            style={{ fontFamily: "Arial, sans-serif", color: EDITORIAL_COLORS.inkLight }}
          >
            GUARANTEES YOUR FUTURE
          </p>
        </div>
      </div>
    </TwoColumn>

    <PageFooter
      left="POPULAR MECHANICS"
      center="JANUARY 1959"
      right="2"
    />
  </MagazinePage>
);

// ============================================
// Feature Article Section
// ============================================
interface ArticleSectionProps {
  articleId?: string;
}

export const ArticleSection: React.FC<ArticleSectionProps> = ({ articleId = 'heroic-years' }) => {
  const article = FEATURE_ARTICLES.find(a => a.id === articleId) || FEATURE_ARTICLES[0];

  return (
    <MagazinePage pageNumber={89}>
      <PageHeader
        left="POPULAR MECHANICS"
        center={article.category}
        right="JANUARY 1959"
      />

      {/* Article Header */}
      <div className="mb-12 text-center">
        <Label color={EDITORIAL_COLORS.accent} className="mb-4 block">
          {article.category}
        </Label>
        <Headline size="4xl" className="mb-4">
          {article.title}
        </Headline>
        <Subheadline className="mb-6">
          {article.subtitle}
        </Subheadline>
        <p
          className="text-sm uppercase tracking-widest"
          style={{ fontFamily: "Arial, sans-serif", color: EDITORIAL_COLORS.inkLight }}
        >
          By {article.author}
        </p>
      </div>

      <Divider style="double" />

      {/* Article Content */}
      <div className="mt-8">
        {/* Lead Paragraph - Drop Cap */}
        <p
          className="text-lg leading-relaxed mb-8 first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: EDITORIAL_COLORS.ink,
          }}
        >
          {article.leadParagraph}
        </p>

        {/* Two Column Body */}
        <TwoColumn gap="gap-8">
          <div>
            {article.content.slice(0, 2).map((para, idx) => (
              <p
                key={idx}
                className="mb-6 text-base leading-relaxed text-justify"
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  color: EDITORIAL_COLORS.ink,
                }}
              >
                {para}
              </p>
            ))}
          </div>
          <div>
            {/* Pull Quote */}
            {article.pullQuote && (
              <PullQuote attribution={article.author}>
                {article.pullQuote}
              </PullQuote>
            )}

            {article.content.slice(2).map((para, idx) => (
              <p
                key={idx}
                className="mb-6 text-base leading-relaxed text-justify"
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  color: EDITORIAL_COLORS.ink,
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </TwoColumn>
      </div>

      <Divider style="ornament" />

      <PageFooter
        left="POPULAR MECHANICS"
        center="JANUARY 1959"
        right="89"
      />
    </MagazinePage>
  );
};

// ============================================
// Advertisement Section
// ============================================
interface AdSectionProps {
  layout?: 'full' | 'split';
}

export const AdvertisementSection: React.FC<AdSectionProps> = ({ layout = 'split' }) => {
  const galeAd = ADVERTISEMENTS.find(a => a.id === 'gale-buccaneer');
  const geAd = ADVERTISEMENTS.find(a => a.id === 'ge-headlamps');

  if (layout === 'full') {
    return (
      <MagazinePage pageNumber={4}>
        {geAd && (
          <div className="text-center">
            {/* GE Ad - Full Width */}
            <Headline size="3xl" className="mb-4">
              Now...See <span style={{ textDecoration: 'underline', textDecorationThickness: '3px' }}>in spite of</span> the other car's lights!
            </Headline>

            <div
              className="my-8 p-8 flex items-center justify-center"
              style={{ backgroundColor: '#1a1a1a', minHeight: '300px' }}
            >
              <p className="text-white text-xl italic" style={{ fontFamily: "Georgia, serif" }}>
                [Headlamp Demonstration Image]
              </p>
            </div>

            <TwoColumn gap="gap-12" className="text-left mt-8">
              <div>
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  New G-E SUBURBAN Headlamps have
                </h3>
                <BodyText>
                  {geAd.description}
                </BodyText>
              </div>
              <div>
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  a "built-in spotlight"...in the low beam!
                </h3>
                <ul className="space-y-2">
                  {geAd.features?.map((feature, idx) => (
                    <li
                      key={idx}
                      className="text-sm flex items-start"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      <span className="mr-2">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <p
                  className="mt-6 text-sm font-bold"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  {geAd.ctaText}
                </p>
              </div>
            </TwoColumn>

            <div className="mt-12 flex justify-end items-center">
              <div className="text-right">
                <p
                  className="text-xs italic mb-1"
                  style={{ fontFamily: "Georgia, serif", color: EDITORIAL_COLORS.inkLight }}
                >
                  {geAd.tagline}
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  {geAd.brand}
                </p>
              </div>
            </div>
          </div>
        )}

        <PageFooter
          left="POPULAR MECHANICS"
          center="JANUARY 1959"
          right="4"
        />
      </MagazinePage>
    );
  }

  // Split Layout - Two Ads Side by Side
  return (
    <MagazinePage pageNumber={1}>
      <TwoColumn gap="gap-0">
        {/* Left Ad - Gale */}
        {galeAd && (
          <div
            className="p-6"
            style={{ borderRight: `1px solid ${EDITORIAL_COLORS.border}` }}
          >
            <div
              className="mb-6 flex items-center justify-center"
              style={{ backgroundColor: '#d4c4b0', minHeight: '250px' }}
            >
              <p className="text-center italic" style={{ fontFamily: "Georgia, serif", color: EDITORIAL_COLORS.inkLight }}>
                [Outboard Motor Image]
              </p>
            </div>

            <Headline size="3xl" className="mb-2">
              {galeAd.brand}
            </Headline>
            <h3
              className="text-2xl uppercase tracking-widest mb-6"
              style={{ fontFamily: "Arial, sans-serif", letterSpacing: '0.3em' }}
            >
              {galeAd.product}
            </h3>

            <Divider style="line" />

            <h4
              className="text-base font-bold mt-4 mb-3"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              {galeAd.tagline}
            </h4>

            <BodyText className="text-sm">
              {galeAd.description}
            </BodyText>

            <p
              className="mt-6 text-xs"
              style={{ fontFamily: "Arial, sans-serif", color: EDITORIAL_COLORS.inkLight }}
            >
              {galeAd.company}
            </p>
          </div>
        )}

        {/* Right Ad - Black & Decker Style */}
        <div className="p-6">
          <Box variant="highlight" className="mb-6">
            <h3
              className="text-lg font-black uppercase leading-tight"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              SAVE UP TO $11 ON B&D ATTACHMENTS WITH CERTIFICATE BELOW!
            </h3>
          </Box>

          <BodyText className="text-sm mb-6">
            A wonderful opportunity for the proud owner of a Black & Decker ¼" Drill or Power Driver! Through January 31, the special certificate below will be redeemed at any Black & Decker dealer's toward one or all of B&D's six most popular attachments!
          </BodyText>

          <div className="flex gap-4 mb-6">
            <PriceTag
              label="Regular"
              originalPrice="$24.95"
              salePrice="$13.95"
            />
            <div className="flex items-center">
              <span
                className="text-xl font-bold"
                style={{ fontFamily: "Arial, sans-serif", color: EDITORIAL_COLORS.accent }}
              >
                YOU SAVE $11!
              </span>
            </div>
          </div>

          {/* Certificate Box */}
          <div
            className="p-4 border-dashed border-2"
            style={{ borderColor: EDITORIAL_COLORS.border }}
          >
            <p
              className="text-center text-xs uppercase tracking-wider font-bold mb-2"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              ✂ CLIP THIS CERTIFICATE ✂
            </p>
            <p
              className="text-center text-sm"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Present to your Black & Decker dealer for special savings
            </p>
          </div>

          <p
            className="mt-6 text-xs text-center"
            style={{ fontFamily: "Arial, sans-serif", color: EDITORIAL_COLORS.inkLight }}
          >
            Black & Decker Mfg. Co., Towson 4, Maryland
          </p>
        </div>
      </TwoColumn>

      <PageFooter
        left="POPULAR MECHANICS"
        center="JANUARY 1959"
        right="1"
      />
    </MagazinePage>
  );
};

// ============================================
// Editorial Column Section
// ============================================
export const EditorialColumn: React.FC = () => (
  <MagazinePage pageNumber={6}>
    <PageHeader
      left="POPULAR MECHANICS"
      center="ACROSS THE DESK"
      right="JANUARY 1959"
    />

    <TwoColumn gap="gap-12">
      {/* Letters Column */}
      <div>
        <Headline size="2xl" className="mb-2">
          Across the Desk
        </Headline>
        <Subheadline className="mb-6">
          Letters from our readers
        </Subheadline>

        <Divider style="double" />

        {EDITORIAL_COLUMNS.acrossTheDesk.letters.map((letter, idx) => (
          <div key={idx} className="mb-8">
            <h4
              className="text-base font-bold mb-3"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              {letter.topic}
            </h4>
            <BodyText className="text-sm mb-2">
              {letter.content}
            </BodyText>
            <p
              className="text-xs italic text-right"
              style={{ fontFamily: "Georgia, serif", color: EDITORIAL_COLORS.inkLight }}
            >
              — {letter.author}
            </p>
            {idx < EDITORIAL_COLUMNS.acrossTheDesk.letters.length - 1 && (
              <Divider style="dotted" />
            )}
          </div>
        ))}
      </div>

      {/* Education Ad */}
      <div>
        <div
          className="p-6"
          style={{
            backgroundColor: '#fff',
            border: `2px solid ${EDITORIAL_COLORS.border}`,
          }}
        >
          <div className="text-center mb-6">
            <h3
              className="text-2xl uppercase tracking-wide"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              LEARN ACCOUNTING
            </h3>
            <p
              className="text-lg italic my-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              for a
            </p>
            <h3
              className="text-3xl font-black uppercase"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              BETTER JOB
            </h3>
            <div
              className="mt-4 inline-block px-4 py-2"
              style={{ backgroundColor: EDITORIAL_COLORS.highlight }}
            >
              <span
                className="text-xl font-bold"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                MORE MONEY
              </span>
            </div>
          </div>

          <Divider style="line" />

          <h4
            className="text-sm font-bold uppercase tracking-wide text-center my-4"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            A Short Streamlined Course to Prepare You Quickly for Your Start in a Successful Accounting Career!
          </h4>

          <BodyText className="text-sm mb-4">
            You owe no special talents to be a success in accounting. All you need is the ambition to learn. Accountants with this valuable knowledge of bookkeeping can teach yourself, too, can get into the permanent and fast-growing field of accounting.
          </BodyText>

          <Box variant="highlight" className="my-4">
            <p
              className="text-sm font-bold text-center"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              Free Sample Lesson Will PROVE You Can Master Accounting
            </p>
          </Box>

          <p
            className="text-xs text-center mt-4"
            style={{ fontFamily: "Arial, sans-serif", color: EDITORIAL_COLORS.inkLight }}
          >
            Send for Free Sample Lesson and Free Book.
          </p>

          <div
            className="mt-4 p-3 text-center"
            style={{ backgroundColor: EDITORIAL_COLORS.paperDark }}
          >
            <p
              className="text-xs font-bold uppercase"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              LaSalle Extension University
            </p>
            <p
              className="text-xs italic"
              style={{ fontFamily: "Georgia, serif" }}
            >
              A Correspondence Institution
            </p>
          </div>
        </div>
      </div>
    </TwoColumn>

    <PageFooter
      left="POPULAR MECHANICS"
      center="JANUARY 1959"
      right="6"
    />
  </MagazinePage>
);
