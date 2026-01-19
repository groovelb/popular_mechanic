// ============================================
// Popular Mechanics 1959 - Magazine Content
// ============================================

export const MAGAZINE_META = {
  title: 'Popular Mechanics',
  subtitle: 'Magazine',
  slogan: 'Written So You Can Understand It',
  volume: 'Volume 111',
  number: 'Number 1',
  date: 'JANUARY 1959',
  price: '35 CENTS',
};

// ============================================
// Table of Contents
// ============================================
export const TABLE_OF_CONTENTS = {
  automotive: {
    title: 'Annual Automotive Section',
    articles: [
      { title: 'Heroic Years of the Automobile', subtitle: 'Parade of New Cars—1909 to 1959', page: 89 },
      { title: 'Where Did the Inches Come From?', page: 106 },
      { title: 'Why Do Cars Look the Way They Do?', page: 112 },
      { title: 'The Suburban Breakdown', page: 118 },
      { title: 'How Good Are the Gadgets?', page: 124 },
      { title: 'Do You Know Ignition?', page: 130 },
    ],
  },
  craftsman: {
    title: 'For the Craftsman',
    articles: [
      { title: 'Shop-Load Tables', page: 140 },
      { title: 'Modeling the French Chalet—Part III', page: 146 },
      { title: 'Machining Makes the Difference', page: 152 },
      { title: "It's the Cutting Edge That Counts", page: 158 },
      { title: 'Sculpture in Welded Steel', page: 164 },
    ],
  },
  regular: {
    title: 'Regular Departments',
    articles: [
      { title: 'Know This Old-Timer?', subtitle: 'Quiz', page: 44 },
      { title: "What's New for Your Home", page: 126 },
      { title: 'Shopping for Santa', page: 134 },
      { title: 'Radio, TV and Electronics', page: 170 },
      { title: 'Bouncing for Health', page: 182 },
      { title: "This Month's Star Maps", page: 196 },
    ],
  },
};

// ============================================
// Feature Articles
// ============================================
export const FEATURE_ARTICLES = [
  {
    id: 'heroic-years',
    category: 'AUTOMOTIVE',
    title: 'Heroic Years of the Automobile',
    subtitle: 'A Color Album',
    author: 'Robert C. Grant',
    leadParagraph: `The automobile industry celebrates its golden anniversary this year, and what better way to honor this milestone than to look back at the magnificent machines that have shaped American transportation. From the humble horseless carriages of 1909 to the sleek, chrome-laden beauties of 1959, the automobile has transformed not just how we travel, but how we live.`,
    content: [
      `In fifty years, the automobile has evolved from a noisy, unreliable novelty into the most sophisticated consumer product ever manufactured. The early pioneers—Ford, Olds, Duryea—could scarcely have imagined the powerful, comfortable, and beautiful machines that roll off assembly lines today.`,
      `Consider the changes: engines have grown from sputtering one-cylinder affairs producing perhaps 8 horsepower to mighty V-8s delivering 300 horses or more. Bodies have progressed from wooden frames and hand-formed panels to precisely stamped steel unibodies. And comfort—once an afterthought—now includes power everything, air conditioning, and hi-fi radio.`,
      `But perhaps the most dramatic transformation has been in style. The boxy, utilitarian shapes of early automobiles have given way to the sweeping, sculptural forms that define modern automotive design. Fins soar, chrome gleams, and colors dazzle the eye.`,
    ],
    pullQuote: '"The automobile has transformed not just how we travel, but how we live."',
    images: [
      { src: '/images/vintage-car-1.jpg', caption: '1959 Cadillac Eldorado represents the pinnacle of American automotive design' },
      { src: '/images/vintage-car-2.jpg', caption: 'The 1909 Ford Model T started it all' },
    ],
  },
  {
    id: 'car-stylists',
    category: 'DESIGN',
    title: 'Car Stylists Talk Back',
    subtitle: 'Designers defend the modern automobile',
    author: 'William K. Hartford',
    leadParagraph: `Critics say modern cars are too long, too low, too gaudy. We asked the men who design them to respond. Their answers may surprise you.`,
    content: [
      `"People say they want simple, practical cars," says Harley Earl, GM's legendary design chief. "But when they walk into a showroom, they buy the one with the most chrome, the biggest fins, the brightest colors. We give the public what they actually want, not what they say they want."`,
      `The designers point to function behind the flash. Those controversial tailfins? They provide visual length cues for easier parking and serve as mounting points for larger taillights—a genuine safety improvement. The wraparound windshield? Better visibility at intersections.`,
      `"Every line on a modern car is there for a reason," insists Virgil Exner of Chrysler. "We don't add decoration for its own sake. Form follows function—we've just learned to make function beautiful."`,
    ],
    pullQuote: '"We give the public what they actually want, not what they say they want."',
    images: [],
  },
  {
    id: 'ignition-check',
    category: 'HOW-TO',
    title: 'How to Check Your Ignition',
    subtitle: 'A step-by-step guide to keeping your spark strong',
    author: 'Technical Staff',
    leadParagraph: `A weak spark means weak performance. Here's how to diagnose and fix common ignition problems before they leave you stranded.`,
    content: [
      `The ignition system is the heart of your engine's electrical system. When it fails, so does your car. But with a few simple tools and techniques, you can keep your ignition in top shape.`,
      `Start with the spark plugs. Remove one and examine the electrode. A light tan or gray color indicates proper combustion. Black, sooty deposits suggest a rich fuel mixture or oil burning. White, blistered electrodes mean the engine is running too hot.`,
      `Check the points next. With the distributor cap removed, slowly rotate the engine until the points are fully open. The gap should measure .016 to .020 inches on most cars. Pitted or burned points should be replaced immediately.`,
      `Finally, inspect the condenser, rotor, and distributor cap for cracks or carbon tracking. These inexpensive parts can cause mysterious misfires that puzzle even experienced mechanics.`,
    ],
    pullQuote: 'A weak spark means weak performance.',
    images: [],
  },
];

// ============================================
// Vintage Advertisements
// ============================================
export const ADVERTISEMENTS = [
  {
    id: 'gale-buccaneer',
    brand: 'GALE',
    product: 'Buccaneer',
    tagline: 'Smart, tough, and terrific',
    headline: 'The dramatic new 35 hp. Sovereign',
    description: `by GALE is an exciting outboard motor, equally at home at a swank club anchorage or on the racing waters of a North Woods river! This handsome husky, in spray-white and black, comes with trim, functional lines and smart styling—and underneath, pure power!`,
    price: null,
    ctaText: 'Write to us today for the name of your nearby GALE Buccaneer dealer, and a free catalog.',
    company: 'Gale Products, Dept. 319, Galesburg, Ill., Div. Outboard Marine Corp.',
  },
  {
    id: 'ge-headlamps',
    brand: 'GENERAL ELECTRIC',
    product: 'SUBURBAN Headlamps',
    tagline: 'Progress Is Our Most Important Product',
    headline: 'Now...See in spite of the other car\'s lights!',
    description: `No other 2-headlamp system ever gave you as much light in the low beam as new General Electric SUBURBAN Headlamps. And you need more light in the low beam when meeting oncoming cars—even if the other driver dims his lights and has them aimed properly.`,
    features: [
      'Built-in spotlight effect in the low beam',
      'Helps you recover your vision more quickly',
      'Puts more light along the right shoulder',
    ],
    ctaText: 'See your dealer, garage or service station!',
    company: 'General Electric Co., Miniature Lamp Dept., Nela Park, Cleveland 12, Ohio',
  },
  {
    id: 'black-decker',
    brand: 'BLACK & DECKER',
    product: 'B&D Attachments',
    tagline: 'New B&D Drill for Christmas?',
    headline: 'SAVE UP TO $11 ON B&D ATTACHMENTS WITH CERTIFICATE BELOW!',
    description: `A wonderful opportunity for the proud owner of a Black & Decker ¼" Drill or Power Driver! Through January 31, the special certificate below will be redeemed at any Black & Decker dealer's toward an or all of B&D's six most popular attachments!`,
    originalPrice: '$24.95',
    salePrice: '$13.95',
    savings: '$11.00',
    ctaText: 'Clip this certificate and save!',
    company: "Black & Decker Mfg. Co., Towson 4, Maryland—World's Largest Maker of Electric Tools",
  },
  {
    id: 'lasalle-accounting',
    brand: 'LaSalle Extension University',
    product: 'Accounting Course',
    tagline: 'A Correspondence Institution',
    headline: 'LEARN ACCOUNTING for a BETTER JOB',
    subheadline: 'MORE MONEY',
    description: `You can go special talents to be a success in accounting. All you need is the ambition to learn. Accounting knowledge of bookkeeping. And teach yourself, too, can get into the permanent and fast-growing field of accounting.`,
    features: [
      'A Short Streamlined Course to Prepare You Quickly',
      'Free Sample Lesson Will Prove You Can Master Accounting',
      'We Guide You Step By Step',
    ],
    ctaText: 'Send for Free Sample Lesson and Free Book.',
    company: 'LaSalle Extension University, 417 S. Dearborn Street, Chicago 5, Illinois',
  },
];

// ============================================
// Editorial Columns
// ============================================
export const EDITORIAL_COLUMNS = {
  acrossTheDesk: {
    title: 'Across the Desk',
    subtitle: 'Letters from our readers',
    letters: [
      {
        topic: 'What Engineers Say About Today\'s Cars',
        content: `[August] broke one to make this statement: If automotive manufacturers were suddenly finding their best-engineered equipment loosening in a lake, whereupon, I am sure, the ensuing waves would be lively in the public expression of the utmost criticism of the product.`,
        author: 'Edward Kramer, San Jose, California',
      },
      {
        topic: 'First Time Reader',
        content: `This is the first time I have ever read a PM magazine, mostly because I am not much of a mechanic's operative, or otherwise. I enjoyed it so much, though, that I am celebrating the occasion by writing my first letter to any editor.`,
        author: 'Mrs. J. Patterson, Denver, Colorado',
      },
    ],
  },
  nextMonth: {
    title: 'Next Month...',
    preview: `ARE YOU a cultured boot? A PM editor reports next month on his ride at the side of the newest railroad scenic, an $800 European-get special, behind the new 1959 diesel. Our February article will show how car "ding-dams" are turning up the crispy. FAIRNESS TO BE a pilot, or an American Airlines captain, writes in the next issue of his job—testing the camera pilots to the Boeing 707 airplane into the transcontinental routes.`,
  },
};

// ============================================
// Page Footer
// ============================================
export const PAGE_FOOTER = {
  left: 'POPULAR MECHANICS',
  center: 'JANUARY 1959',
  right: '', // Page number
};

// ============================================
// Typography Styles (for reference)
// ============================================
export const TYPOGRAPHY = {
  headline: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontWeight: 700,
  },
  subheadline: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontStyle: 'italic',
  },
  body: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: '14px',
    lineHeight: 1.6,
  },
  caption: {
    fontFamily: "Arial, sans-serif",
    fontSize: '11px',
  },
  label: {
    fontFamily: "Arial, sans-serif",
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
};

// ============================================
// Color Palette for Editorial
// ============================================
export const EDITORIAL_COLORS = {
  paper: '#f5f0e6',        // Aged paper background
  paperDark: '#e8e0d0',    // Darker paper
  ink: '#1a1a1a',          // Black ink
  inkLight: '#4a4a4a',     // Lighter ink
  accent: '#c41e1e',       // Red accent
  highlight: '#d8b830',    // Yellow highlight
  border: '#2a2a2a',       // Border color
  sepia: '#8b7355',        // Sepia tone
};
