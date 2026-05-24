import { DatabaseSchema, SystemArchitecture } from "./types";

export const ARCHITECTURE_DATA: SystemArchitecture[] = [
  {
    module: "1. Mobile Frontend (React Native / Flutter Client)",
    description: "Designed using Single-State Clean Architecture. Renders dynamic price graphs, manages price notification settings via local push configurations, and handles alternative side-by-side spec sheets.",
    technologies: ["React Native", "Tailwind CSS", "TypeScript", "Recharts / SVG", "AsyncStorage"]
  },
  {
    module: "2. API Gateway & Middleware Proxy (Express Node.js)",
    description: "Orchestrates API calls to retail APIs, intercepts requests, loads server environment secrets (such as GEMINI_API_KEY) safely, and encapsulates caching mechanisms to avoid duplicate API rate-limit stress.",
    technologies: ["Node.js", "Express", "TypeScript", "Helmet", "CORS"]
  },
  {
    module: "3. Gemini Core Analytics (AI Engine Layer)",
    description: "Communicates with Gemini 3.5-flash. Executes JSON-schema-constrained semantic processing to calculate normal median prices, predictions, fake markdown indices, and equivalent substitute options.",
    technologies: ["@google/genai", "Gemini 3.5-flash", "JSON Schema validation"]
  },
  {
    module: "4. Persistent Infrastructure & Auth (Firebase / Firestore)",
    description: "Maintains real-time documents for users, triggers webhooks on discount triggers, and allows secure synchronizations across personal multi-platform environments.",
    technologies: ["Firebase Auth", "Cloud Firestore", "Cloud Functions (Cron trackers)", "FCM (Push alerts)"]
  }
];

export const DATABASE_SCHEMA_DATA: DatabaseSchema[] = [
  {
    collectionName: "users",
    description: "Stores user accounts and push notification tokens.",
    fields: [
      { name: "uid", type: "String", description: "Firebase Auth unique user ID identifier", isPrimary: true },
      { name: "email", type: "String", description: "User email address" },
      { name: "fcmToken", type: "String", description: "Firebase Cloud Messaging token for mobile push alerts" },
      { name: "createdAt", type: "Datetime", description: "Account creation timestamp" }
    ]
  },
  {
    collectionName: "products",
    description: "Caches general details and historical fluctuations.",
    fields: [
      { name: "productId", type: "String", description: "Globally unique identifier or hashed URL identifier", isPrimary: true },
      { name: "title", type: "String", description: "Display name of the catalog product" },
      { name: "imageUrl", type: "String", description: "Unsplash or retail asset link for thumbnail displays" },
      { name: "currentPrice", type: "Number", description: "Most recent scraped ticker price in INR" },
      { name: "normalAverage", type: "Number", description: "Median pricing trend calculated by AI analytics" },
      { name: "specifications", type: "Map", description: "Key-value map of hardware specifications" },
      { name: "lastUpdated", type: "Datetime", description: "Point of last scraper review" }
    ]
  },
  {
    collectionName: "price_history",
    description: "Stores historical datapoints for graphing charts.",
    fields: [
      { name: "historyId", type: "String", description: "Unique trace point key", isPrimary: true },
      { name: "productId", type: "String", description: "Foreign key reference linking to the associated catalog product" },
      { name: "price", type: "Number", description: "Historical price log value" },
      { name: "recordedAt", type: "Datetime", description: "Chronological trace timestamp" }
    ]
  },
  {
    collectionName: "alerts",
    description: "Manages price drop notification thresholds set by users.",
    fields: [
      { name: "alertId", type: "String", description: "Unique alert instance tracking key", isPrimary: true },
      { name: "userId", type: "String", description: "The creator's user identifier reference" },
      { name: "productId", type: "String", description: "The tracked product association reference" },
      { name: "targetPrice", type: "Number", description: "Trigger threshold pricing specified by the shopper" },
      { name: "isActive", type: "Boolean", description: "Active state toggle of the alert" },
      { name: "createdAt", type: "Datetime", description: "Timestamp of alert setup" }
    ]
  }
];

export const FEATURE_FLOW_STEPS = [
  {
    title: "1. Search / Paste Link",
    desc: "User inputs product name (e.g., 'Sony WH-1000XM5') or pastes a merchant web link. Dynamic state initiates loading sequence."
  },
  {
    title: "2. AI Spec Translation",
    desc: "Backend proxies the query to Gemini. It structures the brand layout, fetches specs, and calculates pricing history parameters."
  },
  {
    title: "3. Buy/Wait Analytics & Fake Detection",
    desc: "PriceWise compares current quotes against median historical graphs. Flags misleading markdowns and calculates a drop timeline."
  },
  {
    title: "4. Alternative Recommendation Matcher",
    desc: "AI search evaluates cheaper equivalents matching specifications, mapping side-by-side similarities and showing precise monetary savings."
  },
  {
    title: "5. Set Target Alert",
    desc: "Shoppers customize targeted limits. Price-drop trackers persist in real-time, waiting for a threshold breach to trigger notification."
  }
];

export const ROADMAP_ROAD = [
  {
    phase: "Phase 1: Brand & Interactive Prototyping (Current Status)",
    status: "Completed",
    bullets: [
      "Establish interactive full-stack applet architecture using Vite + Express.",
      "Incorporate live server-side Gemini 3.5-flash pipelines constrained by JSON structures.",
      "Design mobile emulator shell framing with custom responsive SVG analytics charts.",
      "Preprogram high-fidelity offline templates for fallback robustness."
    ]
  },
  {
    phase: "Phase 2: Database Storage & FCM Notification Hookups",
    status: "In Progress",
    bullets: [
      "Set up dynamic user schemas in Cloud Firestore to track user preferences.",
      "Configure Firebase Cloud Messaging (FCM) on native iOS/Android client SDKs.",
      "Implement persistent social sign-ins (Email, Google Auth) to preserve dashboards."
    ]
  },
  {
    phase: "Phase 3: Wholesale Scrapers & Automated Price Cron Workers",
    status: "Planned",
    bullets: [
      "Incorporate headless browser scripts (Puppeteer/Playwright) for background retail scanning.",
      "Deploy background cron routines (Cloud Tasks) executing every 6-12 hours.",
      "Evaluate pricing alerts triggering push warnings natively when drops hit targets."
    ]
  },
  {
    phase: "Phase 4: Advanced Predictive AI Engine Integration",
    status: "Future Option",
    bullets: [
      "Train custom machine learning regressors on aggregated pricing timeseries.",
      "Ground predictions using seasonal calendar indices, inflation curves, and merchant catalogs.",
      "Suggest smart combined-merchant bundle options."
    ]
  }
];

export const RECENT_SEARCHES = [
  { name: "iPhone 15", category: "Phones", tag: "Hot Search", term: "iphone" },
  { name: "Sony WH-1000XM5", category: "Headphones", tag: "Lowest Price Drop", term: "sony" },
  { name: "MacBook Air M3", category: "Laptops", tag: "Deal Active", term: "laptop" }
];

export const POPULAR_DEALS = [
  {
    name: "iPhone 15 (128GB)",
    discountLabel: "Flat ₹7,901 Discount",
    currentPrice: 71999,
    originalMSRP: 79900,
    status: "WAIT",
    statusText: "Sale due soon",
    img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=300",
    term: "iphone"
  },
  {
    name: "Sony WH-1000XM5",
    discountLabel: "Best Price in 90 Days",
    currentPrice: 28999,
    originalMSRP: 34990,
    status: "BUY_NOW",
    statusText: "Buy Now",
    img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=300",
    term: "sony"
  },
  {
    name: "Apple MacBook Air M3",
    discountLabel: "Stable Pricing Drop",
    currentPrice: 104900,
    originalMSRP: 114900,
    status: "GOOD_DEAL",
    statusText: "Good Deal",
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=300",
    term: "laptop"
  }
];
