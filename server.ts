import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK if API Key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey && geminiApiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini API Client:", error);
  }
} else {
  console.log("No valid GEMINI_API_KEY found, running in intelligent emulation mode.");
}

/**
 * Predefined mock products templates for high-fidelity responses when offline or keyword matches
 */
const fallbacks: Record<string, any> = {
  iphone: {
    product: {
      id: "iphone-15",
      name: "iPhone 15 (128GB, Black)",
      imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=400",
      category: "Phones",
      rating: 4.6,
      currentPrice: 71999,
      originalMSRP: 79900,
      currency: "₹",
      specifications: {
        "Display": "6.1 inches Super Retina XDR OLED",
        "Processor": "A16 Bionic chip",
        "Camera": "48MP Dual Camera system",
        "Battery": "Up to 20 hours video playback",
        "Weight": "171 grams",
        "Storage": "128GB",
      },
    },
    history: {
      lowest: 64999,
      highest: 79900,
      average: 73500,
      points: [
        { date: "2025-06-01", price: 79900 },
        { date: "2025-08-15", price: 77999 },
        { date: "2025-10-01", price: 71999 },
        { date: "2025-11-11", price: 64999 }, // big sale
        { date: "2025-12-25", price: 74900 },
        { date: "2026-02-15", price: 72999 },
        { date: "2026-04-10", price: 72499 },
        { date: "2026-05-24", price: 71999 },
      ],
    },
    recommendation: {
      status: "WAIT",
      statusLabel: "Wait",
      relativeDiff: -2,
      reason: "This product is currently moderately expensive compared to historical drops, and is expected to hit a major low soon.",
      bulletPoints: [
        "A major e-commerce shopping festival typically occurs in 10-15 days.",
        "Historical data shows Apple devices see an average price drop of 8-12% during seasonal sales.",
        "The current price has stabilized and is likely to decrease following upcoming retail cycles.",
      ],
    },
    prediction: {
      daysRange: "7-14 days",
      expectedRange: "₹64,999 - ₹67,999",
      confidence: 85,
      reasons: [
        "Annual mid-year sales are approaching shortly.",
        "Historic pricing cyclic patterns depict significant price relaxation at this lifecycle stage.",
        "Competitor price cuts typically force matching adjustments on general major retailers.",
      ],
    },
    fakeDiscount: {
      isPossibleFake: true,
      shownDiscount: "₹79,900 → ₹71,999",
      analysis: "Possible fake discount detected. Retailers list the launch price (MSRP) of ₹79,900 as 'original' to claim flat 10% off. In reality, the median trading price has consistently lingered around ₹72,500 over the past 90 days, making the actual current saving less than 1%.",
    },
    alternatives: [
      {
        name: "Samsung Galaxy S24 (256GB)",
        similarity: 91,
        price: 74999,
        savings: -3000,
        imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=400",
        betterFeature: "Double Storage & Galaxy AI",
        comparison: {
          "Performance": "Snapdragon 8 Gen 3 for Galaxy",
          "Display": "6.2 inches LTPO 120Hz Dynamic AMOLED 2X",
          "Battery": "Slightly longer active display runtime",
          "Storage": "256GB base storage (vs 128GB on iPhone)",
          "Camera": "Dedicated 3x optical zoom lens",
        },
      },
      {
        name: "iPhone 14 (128GB, Starlight)",
        similarity: 86,
        price: 58999,
        savings: 13000,
        imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=400",
        betterFeature: "Best price-to-spec index",
        comparison: {
          "Performance": "A15 Bionic chip (excellent speed)",
          "Display": "Similar size Retina display with small notch",
          "Price": "Save ₹13,000 instantly",
          "Camera": "12MP Dual camera system (highly capable)",
          "Battery": "Near identical battery resilience",
        },
      },
    ],
  },
  sony: {
    product: {
      id: "sony-wh-1000xm5",
      name: "Sony WH-1000XM5 Noise Canceling Headphones",
      imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400",
      category: "Headphones",
      rating: 4.8,
      currentPrice: 28999,
      originalMSRP: 34990,
      currency: "₹",
      specifications: {
        "Type": "Over-Ear Wireless",
        "Battery": "Up to 30 hours run-time",
        "Noise Canceling": "Dual processor HD noise cancellation",
        "Sensors": "Wearing sensor, touch controls",
        "Weight": "250 grams",
        "Drivers": "30mm specially designed dome driver",
      },
    },
    history: {
      lowest: 24999,
      highest: 34990,
      average: 29500,
      points: [
        { date: "2025-06-01", price: 34990 },
        { date: "2025-08-01", price: 32000 },
        { date: "2025-10-15", price: 29999 },
        { date: "2025-11-30", price: 24999 }, // lowest drop
        { date: "2025-12-20", price: 29500 },
        { date: "2026-02-14", price: 28999 },
        { date: "2026-04-18", price: 29500 },
        { date: "2026-05-24", price: 28999 },
      ],
    },
    recommendation: {
      status: "BUY_NOW",
      statusLabel: "Buy Now",
      relativeDiff: -1.7,
      reason: "This product is listed at a highly competitive rate, below its usual historical baseline price.",
      bulletPoints: [
        "The current price is within 15% of the absolute historical low of ₹24,999.",
        "It is trading below the average market pricing of ₹29,500.",
        "Manufacturers suggest a major price hike is upcoming due to supply constraints.",
      ],
    },
    prediction: {
      daysRange: "15-30 days",
      expectedRange: "₹28,500 - ₹29,500",
      confidence: 72,
      reasons: [
        "Highly stable demand supports the current solid discount tier.",
        "No near-term brand-sponsored sales are scheduled.",
        "Stock depletion is expected to shrink retail flexibility shortly.",
      ],
    },
    fakeDiscount: {
      isPossibleFake: false,
      shownDiscount: "₹34,990 → ₹28,999",
      analysis: "Legitimate discount detected. The price has truly been hovering around ₹29,500 and occasionally ₹32,000. Purchasing now offers an honest saving of roughly ₹6,000 relative to the retail launch index.",
    },
    alternatives: [
      {
        name: "Sony WH-1000XM4",
        similarity: 92,
        price: 19999,
        savings: 9000,
        imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400",
        betterFeature: "Foldable design & Best value",
        comparison: {
          "Noise Canceling": "95% performance parity of XM5",
          "Comfort": "Softer headband padding, easily foldable into compact travel case",
          "Price": "Save ₹9,000",
          "Battery": "Identical 30-hour playback duration",
          "Sound Quality": "Warm, punchy bass (highly customizable)",
        },
      },
      {
        name: "Soundcore Space Q45",
        similarity: 82,
        price: 9999,
        savings: 19000,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400",
        betterFeature: "Extraordinary battery & Budget price",
        comparison: {
          "Battery": "Sensation 50-hour runtime with ANC enabled",
          "Price": "Save a whopping ₹19,000",
          "Noise Canceling": "Fully adjustable adaptive ANC (good for office travel)",
          "Comfort": "Slightly heavier, non-leatherette cups",
        },
      },
    ],
  },
  laptop: {
    product: {
      id: "macbook-air-m3",
      name: "Apple MacBook Air M3 (13-inch, 8GB RAM, 256GB SSD)",
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400",
      category: "Laptops",
      rating: 4.7,
      currentPrice: 104900,
      originalMSRP: 114900,
      currency: "₹",
      specifications: {
        "Processor": "Apple M3 Chip with 8-core CPU",
        "Graphics": "8-core GPU, 16-core Neural Engine",
        "Memory": "8GB unified RAM",
        "Storage": "256GB superfast SSD",
        "Display": "13.6-inch Liquid Retina Display",
        "Weight": "1.24 kg fanless chassis",
      },
    },
    history: {
      lowest: 99900,
      highest: 114900,
      average: 108000,
      points: [
        { date: "2025-06-01", price: 114900 },
        { date: "2025-08-01", price: 112000 },
        { date: "2025-10-01", price: 108000 },
        { date: "2025-11-20", price: 99900 },
        { date: "2026-01-15", price: 106900 },
        { date: "2026-03-20", price: 105500 },
        { date: "2026-05-24", price: 104900 },
      ],
    },
    recommendation: {
      status: "GOOD_DEAL",
      statusLabel: "Good Deal",
      relativeDiff: -2.8,
      reason: "Currently priced lower than typical average baseline, offering good performance-to-value status.",
      bulletPoints: [
        "Save ₹10,000 flat compared to original launch indices.",
        "Pricing is highly stable and unlikely to drop further until newer M4 designs scale up production.",
        "Provides amazing thermal and processing battery life right now.",
      ],
    },
    prediction: {
      daysRange: "30-45 days",
      expectedRange: "₹102,900 - ₹104,900",
      confidence: 76,
      reasons: [
        "Apple holds strict baseline wholesale metrics which avoids flash markdowns.",
        "The supply channel remains restricted with stable demand.",
      ],
    },
    fakeDiscount: {
      isPossibleFake: false,
      shownDiscount: "₹114,900 → ₹104,900",
      analysis: "Fair discount state. Has truly seen stable pricing at ₹108,000 for standard retail branches. The flat ₹10,000 discount represents an attractive high-value buy window.",
    },
    alternatives: [
      {
        name: "MacBook Air M2 (13-inch, 8GB, 256GB)",
        similarity: 90,
        price: 89900,
        savings: 15000,
        imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400",
        betterFeature: "Ultimate budget Apple device",
        comparison: {
          "Performance": "M2 chip is roughly 15% slower in intensive video editing (imperceptible daily)",
          "Display": "Identical Liquid Retina display brilliance",
          "Price": "Save ₹15,000",
          "Battery": "Sensation 18 hours run-time",
        },
      },
    ],
  },
};

/**
 * Intelligent generator functions for building real-looking details for arbitrary user products when in emulation mode
 */
function generateDynamicMockProduct(query: string): any {
  // Normalize query
  const term = query.toLowerCase();

  // Try matching predefined first
  if (term.includes("iphone") || term.includes("apple phone") || term.includes("ios")) return fallbacks.iphone;
  if (term.includes("sony") || term.includes("xm5") || term.includes("headphones") || term.includes("earphone")) return fallbacks.sony;
  if (term.includes("laptop") || term.includes("macbook") || term.includes("computer") || term.includes("pc")) return fallbacks.laptop;

  // Otherwise, extract some descriptors
  const brand = term.includes("samsung") ? "Samsung" :
                term.includes("google") ? "Google" :
                term.includes("asus") ? "Asus" :
                term.includes("shoes") || term.includes("nike") || term.includes("adidas") ? "Nike" : "Premium";

  const isFashion = term.includes("shoes") || term.includes("clothes") || term.includes("shirt") || term.includes("bag") || term.includes("apparel") || term.includes("sneakers");

  const title = query.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const currentPrice = isFashion ? 4500 : 34999;
  const originalMSRP = Math.round(currentPrice * 1.25);
  const lowest = Math.round(currentPrice * 0.85);
  const highest = originalMSRP;
  const average = Math.round((lowest + currentPrice + highest) / 3);

  const points = [
    { date: "2025-10-01", price: highest },
    { date: "2025-12-01", price: Math.round(average * 1.05) },
    { date: "2026-01-15", price: lowest },
    { date: "2026-03-01", price: Math.round(average * 0.98) },
    { date: "2026-04-10", price: Math.round(currentPrice * 1.02) },
    { date: "2026-05-24", price: currentPrice },
  ];

  const rating = parseFloat((4.0 + Math.random() * 0.9).toFixed(1));

  // Determine standard deals status
  const rIdx = Math.floor(Math.random() * 4);
  const statuses: string[] = ["BUY_NOW", "GOOD_DEAL", "WAIT", "EXPENSIVE"];
  const status = statuses[rIdx];

  const statusLabel = status === "BUY_NOW" ? "Buy Now" :
                      status === "GOOD_DEAL" ? "Good Deal" :
                      status === "WAIT" ? "Wait" : "Expensive Right Now";

  const isPossibleFake = Math.random() > 0.4;

  const category = isFashion ? "Fashion" : "Electronics";

  const imgMap: Record<string, string> = {
    "Fashion": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400",
    "Electronics": "https://images.unsplash.com/photo-1527443224154-14e856b7724c?auto=format&fit=crop&q=80&w=400",
  };

  return {
    product: {
      id: `dynamic-${Date.now()}`,
      name: title,
      imageUrl: imgMap[category] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400",
      category,
      rating,
      currentPrice,
      originalMSRP,
      currency: "₹",
      specifications: isFashion ? {
        "Material": "Eco-friendly premium synthetics",
        "Wash Care": "Machine washable, cold",
        "Fit": "Ergonomic comfortable fit",
        "Origin": "Designed in London",
      } : {
        "Category": "High fidelity smart gear",
        "Sensors": "Standard accelerometers, heat and humidity control",
        "Power Source": "Rechargeable Lithium-ion battery system",
        "Connectivity": "Wireless Bluetooth 5.2 / High-speed USB type C",
      },
    },
    history: { lowest, highest, average, points },
    recommendation: {
      status,
      statusLabel,
      relativeDiff: status === "WAIT" || status === "EXPENSIVE" ? 11 : -7,
      reason: `This product is currently displaying ${status === "WAIT" || status === "EXPENSIVE" ? "inflated retail prices" : "excellent promotional margins"} relative to its usual behavior.`,
      bulletPoints: [
        "Price fluctuations follow a standard quarterly trading rhythm.",
        "Expected inventory cycles will trigger local dealer pricing adaptations soon.",
        "Keep track of sales events around major seasonal quarters.",
      ],
    },
    prediction: {
      daysRange: "7-14 days",
      expectedRange: `₹${Math.round(lowest * 1.02).toLocaleString()} - ₹${Math.round(lowest * 1.08).toLocaleString()}`,
      confidence: 76,
      reasons: [
        "Historical price fluctuations reveal cyclic resets.",
        "New product models typically push older cycles to secondary distribution discounts.",
      ],
    },
    fakeDiscount: {
      isPossibleFake,
      shownDiscount: `₹${originalMSRP.toLocaleString()} → ₹${currentPrice.toLocaleString()}`,
      analysis: isPossibleFake
        ? `Possible fake discount detected. Retailers list the launch pricing index to state flat savings, while over the last 60 days, average transactions occurred near the current selling mark.`
        : `Genuine pricing reduction! The product is trading below standard historical records, presenting a verified cost-savings opportunity.`,
    },
    alternatives: [
      {
        name: `${brand === "Nike" ? "Adidas" : "Alternative"} Lite Pro`,
        similarity: 88,
        price: Math.round(currentPrice * 0.75),
        savings: Math.round(currentPrice * 0.25),
        imageUrl: category === "Fashion"
          ? "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400"
          : "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400",
        betterFeature: "Maximum Value Saver",
        comparison: {
          "Performance": "Highly functional, delivering 88% feature equivalence",
          "Material": isFashion ? "Durable synthetic knit" : "Solid composite design",
          "Price": `Save ₹${Math.round(currentPrice * 0.25).toLocaleString()} instantly`,
        },
      },
    ],
  };
}

/**
 * API Route: /api/search
 * Triggered when a user inputs a product search term or URL
 */
app.post("/api/search", async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== "string" || query.trim() === "") {
    return res.status(400).json({ error: "Product search query is required." });
  }

  const queryTrim = query.trim();

  // If Gemini is active, let's call Gemini to construct a real beautiful response dynamically!
  if (ai) {
    try {
      console.log(`Querying Gemini with term: "${queryTrim}"`);
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze the user's shopping product search query or URL: "${queryTrim}".
Search your parameters or use grounding to retrieve/synthesize realistic pricing intelligence for this item in Indian Rupees (INR - using currency symbol "₹").
Your output MUST be a valid JSON object matching the TypeScript type PriceWiseResponse precisely.

Follow these strict output requirements:
1. Product title, image (use a matching highly polished standard Unsplash stock product placeholder URL if actual model URL is unavailable), category, general consumer specifications, and realistic current price in INR.
2. Price History: Provide lowest price, highest price, and average price over the last year. Generate an array log detailing exactly 8 representative chronological price trace points ("points" containing "date" in YYYY-MM-DD format and "price" in numbers) capturing actual sale events, stabilizers, and fluctuation ranges.
3. Buy or Wait Recommendation:
   - status: Set to one of: "WAIT", "BUY_NOW", "GOOD_DEAL", "EXPENSIVE".
   - statusLabel: Visual text representing recommendation status (e.g., "Wait" or "Buy Now").
   - relativeDiff: Math calculation of how much percent higher or lower than typical average baseline (can be positive or negative number, e.g. 13 for 13% more expensive).
   - reason: Explain in clear consumer-friendly non-technical, simple language. DO NOT use jargon like "volatility". Use phrases like "highly expensive compared to usual" or "an exceptional discount".
   - bulletPoints: 3 bullet points with logical reasons (e.g. sale season, brand cycle, history drops).
4. Drop Prediction: Predict if/when price will drop further, range of drop, confidence score (0-100), and 2 detailed reasons.
5. Fake Discount Checker: Check if current advertised markdown is inflated. Formulate the original MSRP and explain if has remained close to the current price over the last 60 days.
6. Alternatives: Recommend 2 cheaper alternative models from standard stores with side-by-side spec comparison matrix. Ensure to calculate actual savings.

PriceWiseResponse interface layout:
{
  product: { id, name, imageUrl, category, specifications: { [key: string]: string }, rating, currentPrice, originalMSRP, currency: "₹" },
  history: { lowest, highest, average, points: [{ date: string, price: number }] },
  recommendation: { status, statusLabel, relativeDiff, reason: string, bulletPoints: string[] },
  prediction: { daysRange: string, expectedRange: string, confidence: number, reasons: string[] },
  fakeDiscount: { isPossibleFake: boolean, shownDiscount: string, analysis: string },
  alternatives: [
    { name: string, similarity: number, price: number, savings: number, imageUrl: string, betterFeature: string, comparison: { [key: string]: string } }
  ]
}

Ensure the output is 100% syntactically valid JSON. DO NOT wrap the response in markup other than pure JSON text.`,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text ? response.text.trim() : "";
      if (responseText) {
        // Attempt to parse JSON safely
        const parsedResponse = JSON.parse(responseText);
        return res.json({ result: parsedResponse, source: "gemini" });
      }
    } catch (error) {
      console.error("Gemini query failed, falling back to intelligent emulation:", error);
    }
  }

  // Fallback to local emulation when offline or on error
  const normalizedQuery = queryTrim.toLowerCase();
  let matchedData = null;

  if (normalizedQuery.includes("iphone") || normalizedQuery.includes("apple phone")) {
    matchedData = fallbacks.iphone;
  } else if (normalizedQuery.includes("sony") || normalizedQuery.includes("xm5") || normalizedQuery.includes("headphones")) {
    matchedData = fallbacks.sony;
  } else if (normalizedQuery.includes("laptop") || normalizedQuery.includes("macbook")) {
    matchedData = fallbacks.laptop;
  } else {
    matchedData = generateDynamicMockProduct(queryTrim);
  }

  return res.json({ result: matchedData, source: "simulation" });
});

// Mount Vite middleware or compile assets
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up development mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Setting up production static delivery...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PriceWise Server running on http://0.0.0.0:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Fatal server launch error:", err);
});
