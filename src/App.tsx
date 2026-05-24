import React, { useState, useEffect } from "react";
import { 
  Search, 
  TrendingDown, 
  TrendingUp, 
  Bell, 
  Plus, 
  Check, 
  Trash2, 
  Sparkles, 
  Info, 
  Database, 
  Activity, 
  MapPin, 
  HelpCircle, 
  Smartphone, 
  Sliders, 
  RefreshCw, 
  Star, 
  ArrowRight, 
  CheckCircle, 
  X,
  Clock,
  Layers,
  ThumbsUp,
  AlertTriangle,
  User,
  ExternalLink,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { 
  PriceWiseResponse, 
  PriceAlert, 
  ProductAlternative 
} from "./types";
import { 
  DATABASE_SCHEMA_DATA, 
  ARCHITECTURE_DATA, 
  FEATURE_FLOW_STEPS, 
  ROADMAP_ROAD, 
  RECENT_SEARCHES, 
  POPULAR_DEALS 
} from "./data";
import PriceChart from "./components/PriceChart";

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"demo" | "architecture">("demo");
  const [mobileTab, setMobileTab] = useState<"search" | "history" | "alternatives" | "alerts">("search");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // App active response state
  const [data, setData] = useState<PriceWiseResponse | null>(null);
  const [apiSource, setApiSource] = useState<"gemini" | "simulation" | "initial">("initial");

  // Notification / Alert Simulator database
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [alertTargetPrice, setAlertTargetPrice] = useState<number | "">("");
  const [successToast, setSuccessToast] = useState("");

  // Auth/Email context dummy just to demonstrate mobile profile and fulfill firebase specs architecture
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userEmail, setUserEmail] = useState("saireddykolli80@gmail.com");

  // Detail alternative modals for specs comparison
  const [selectedAlt, setSelectedAlt] = useState<ProductAlternative | null>(null);

  // Load initial dataset or triggers search for default 'Sony WH-1000XM5'
  useEffect(() => {
    handleSearch("Sony WH-1000XM5");
    loadAlertsFromStorage();
  }, []);

  // Sync alerts custom storage
  const loadAlertsFromStorage = () => {
    try {
      const stored = localStorage.getItem("pricewise_alerts");
      if (stored) {
        setAlerts(JSON.parse(stored));
      } else {
        // Initial setup alerts
        const initialAlerts: PriceAlert[] = [
          {
            id: "alert-1",
            productId: "iphone-15",
            productName: "iPhone 15 (128GB, Black)",
            productImg: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=300",
            targetPrice: 65000,
            currentPrice: 71999,
            isTriggered: false,
            currency: "₹",
            createdAt: new Date().toISOString()
          }
        ];
        setAlerts(initialAlerts);
        localStorage.setItem("pricewise_alerts", JSON.stringify(initialAlerts));
      }
    } catch (e) {
      console.error("Storage load failed", e);
    }
  };

  const handleSearch = async (term: string) => {
    setIsLoading(true);
    setErrorMsg("");
    setSearchQuery(term);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: term })
      });
      if (!res.ok) {
        throw new Error("Failed to consult pricing gateway database.");
      }
      const json = await res.json();
      if (json.result) {
        setData(json.result);
        setApiSource(json.source || "simulation");
        // Reset custom input price
        setAlertTargetPrice(Math.round(json.result.product.currentPrice * 0.9));
      } else {
        throw new Error("No pricing prediction returned.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong querying pricing databases.");
    } finally {
      setIsLoading(false);
    }
  };

  const createAlert = () => {
    if (!data || !alertTargetPrice) return;
    const priceNum = Number(alertTargetPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Please specify a logical numeric price target.");
      return;
    }

    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      productId: data.product.id,
      productName: data.product.name,
      productImg: data.product.imageUrl,
      targetPrice: priceNum,
      currentPrice: data.product.currentPrice,
      isTriggered: priceNum >= data.product.currentPrice,
      currency: data.product.currency || "₹",
      createdAt: new Date().toISOString()
    };

    const updated = [newAlert, ...alerts];
    setAlerts(updated);
    localStorage.setItem("pricewise_alerts", JSON.stringify(updated));
    showToast(`Price drop alert set for ${currencyFormat(priceNum)}!`);
  };

  const deleteAlert = (id: string) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    localStorage.setItem("pricewise_alerts", JSON.stringify(updated));
    showToast("Alert removed successfully.");
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 4000);
  };

  const currencyFormat = (num: number, sign = "₹") => {
    return `${sign}${num.toLocaleString("en-IN")}`;
  };

  const getRecommendationColor = (status: string) => {
    switch (status) {
      case "BUY_NOW":
        return "bg-emerald-500 hover:bg-emerald-600 text-white";
      case "GOOD_DEAL":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "WAIT":
        return "bg-orange-100 text-orange-850 border-orange-300";
      case "EXPENSIVE":
      case "EXPENSIVE_RIGHT_NOW":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusLabelText = (status: string) => {
    if (status === "BUY_NOW") return "BUY NOW";
    if (status === "GOOD_DEAL") return "GOOD DEAL";
    if (status === "EXPENSIVE") return "EXPENSIVE";
    return status;
  };

  return (
    <div id="pricewise-app" className="min-h-screen bg-[#F7F7F5] text-[#1A1A1A] font-sans overflow-y-auto selection:bg-orange-100 selection:text-orange-950 pb-12">
      
      {/* Toast Notification */}
      {successToast && (
        <div id="toast-notify" className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white py-3.5 px-5 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 animate-fade-in animate-bounce">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{successToast}</span>
        </div>
      )}

      {/* HEADER SECTION IN EDITORIAL STYLE */}
      <header className="border-b border-black/5 bg-white/75 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => handleSearch("Sony WH-1000XM5")}>
              <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center">
                <div className="w-3.5 h-3.5 bg-[#F7F7F5] rotate-45 transform"></div>
              </div>
              <span className="text-2xl font-display font-medium tracking-tight uppercase">PriceWise</span>
              <span className="text-[10px] font-mono tracking-widest bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold">PREVIEW ENGINE</span>
            </div>

            {/* Desktop main selector */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                id="tab-demo-btn"
                onClick={() => setActiveTab("demo")}
                className={`px-4 py-2 text-sm font-medium tracking-tight transition-all rounded-full flex items-center gap-2 ${
                  activeTab === "demo"
                    ? "bg-stone-900 text-[#F7F7F5]"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Live Demo Applet
              </button>
              <button
                id="tab-architecture-btn"
                onClick={() => setActiveTab("architecture")}
                className={`px-4 py-2 text-sm font-medium tracking-tight transition-all rounded-full flex items-center gap-2 ${
                  activeTab === "architecture"
                    ? "bg-stone-900 text-[#F7F7F5]"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Technical & Architecture Blueprints
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#72726E]">Signed in as</span>
              <span className="text-xs font-mono font-medium text-stone-800">{userEmail}</span>
            </div>
            <div className="w-9 h-9 bg-orange-100 border border-orange-200 rounded-full flex items-center justify-center text-orange-800 font-bold text-xs shadow-inner">
              SR
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        {/* TAB 1: LIVE DEMO/EMULATOR & DASHBOARD */}
        {activeTab === "demo" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT COLUMN: CONTROL DECK (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Product Search & Controller Station */}
              <div className="bg-white border border-black/5 rounded-[32px] p-6 shadow-sm">
                <span className="text-[10px] uppercase tracking-widest font-bold text-orange-600 block mb-2">Search Gateway</span>
                <h2 className="text-2xl font-display font-medium tracking-tight text-stone-950 mb-1">Pricing Intelligence Scraper</h2>
                <p className="text-xs text-stone-500 leading-relaxed mb-6">
                  Type a product name or shopping web URL below. PriceWise triggers an advanced Gemini 3.5-flash agent pipeline to reconstruct historical price points, detect fake markdowns, and formulate alternatives.
                </p>

                <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) handleSearch(searchQuery); }} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5 pointer-events-none" />
                    <input
                      id="product-search-input"
                      type="text"
                      placeholder="e.g. iPhone 15, Laptop, Shoes, or paste URL"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-stone-100 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 tracking-tight"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      id="search-button"
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 active:transform active:scale-[0.98] disabled:opacity-50 text-[#F7F7F5] py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Consulting Gemini AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Calculate Analytics
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {errorMsg && (
                  <div className="mt-4 p-3 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200">
                    {errorMsg}
                  </div>
                )}

                {/* Popular Keywords Tag list */}
                <div className="mt-6 pt-5 border-t border-stone-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#72726E] block mb-3.5">Tested Popular Retail Searches</span>
                  <div className="flex flex-col gap-2">
                    {RECENT_SEARCHES.map((search, i) => (
                      <button
                        key={i}
                        type="button"
                        id={`popular-tag-${search.term}`}
                        onClick={() => handleSearch(search.name)}
                        className="flex items-center justify-between text-left p-2.5 rounded-xl hover:bg-stone-50 border border-transparent hover:border-black/5 transition-all text-xs text-stone-700"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span className="font-medium text-stone-900">{search.name}</span>
                          <span className="text-[9px] text-[#72726E] bg-stone-100 px-1.5 py-0.5 rounded">{search.category}</span>
                        </div>
                        <span className="text-[9px] font-mono text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded-full">{search.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model feedback metadata widget */}
                <div className="mt-5 p-3.5 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between text-[11px] text-[#72726E]">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-stone-400" />
                    <span>Engine response strategy:</span>
                  </div>
                  <span className="font-mono font-bold bg-[#EBF3ED] text-[#1E3A20] px-2 py-0.5 rounded capitalize">
                    {apiSource === "gemini" ? "Live Gemini AI Model" : "High-Fidelity Simulation"}
                  </span>
                </div>

              </div>

              {/* Set Price Drop Limit Alert Widget */}
              {data && (
                <div className="bg-[#1C1C1A] text-[#F7F7F5] border border-stone-800 rounded-[32px] p-6 shadow-xl flex flex-col gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400">ALERT CREATOR</span>
                    <h3 className="text-xl font-display font-medium text-slate-100 mt-1">Setup Instant Price-Drop Alert</h3>
                    <p className="text-xs text-stone-400 leading-relaxed mt-1">
                      Pick a target price. PriceWise will trigger a notification script whenever internet retail pricing drops below this boundary.
                    </p>
                  </div>

                  <div className="space-y-3.5 mt-2">
                    <div className="flex items-center justify-between bg-stone-900 p-3.5 rounded-2xl border border-stone-800">
                      <div className="flex items-center gap-3">
                        <img 
                          src={data.product.imageUrl} 
                          alt={data.product.name} 
                          className="w-10 h-10 object-cover rounded-lg border border-stone-700/50" 
                        />
                        <div>
                          <p className="text-xs font-semibold text-stone-200 line-clamp-1">{data.product.name}</p>
                          <p className="text-[11px] text-emerald-400 font-mono">Current: {currencyFormat(data.product.currentPrice)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-stone-900 border border-stone-800 p-3 rounded-2xl">
                        <span className="text-[9px] uppercase font-bold text-stone-400">Current Selling</span>
                        <p className="text-lg font-mono font-light text-slate-200">{currencyFormat(data.product.currentPrice)}</p>
                      </div>
                      <div className="bg-stone-900 border border-stone-800 p-3 rounded-2xl">
                        <span className="text-[9px] uppercase font-bold text-stone-400">Recommended Lowest</span>
                        <p className="text-lg font-mono font-light text-emerald-400">{currencyFormat(data.history.lowest)}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-stone-400 block mb-1.5 pl-1">Threshold price target (₹)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-sm">₹</span>
                        <input
                          id="alert-price-input"
                          type="number"
                          value={alertTargetPrice}
                          onChange={(e) => setAlertTargetPrice(e.target.value === "" ? "" : Number(e.target.value))}
                          placeholder="e.g. 25000"
                          className="w-full bg-stone-900 text-white rounded-2xl py-3.5 pl-8 pr-4 text-sm font-mono border border-stone-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                      {alertTargetPrice !== "" && Number(alertTargetPrice) >= data.product.currentPrice && (
                        <p className="text-[11px] text-amber-400 mt-1 pl-1">
                          Warning: This is higher than or equal to current price. It will trigger instantly.
                        </p>
                      )}
                    </div>

                    <button
                      id="save-alert-btn"
                      onClick={createAlert}
                      className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 rounded-full text-xs font-bold uppercase tracking-widest transition-all text-[#1C1C1A]"
                    >
                      Persist Alert Tracker
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: SMART PHONE MOBILE SHELL EMULATOR (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              
              <div className="relative mx-auto max-w-[420px] w-full bg-stone-900 rounded-[55px] p-4 shadow-2xl border-4 border-stone-800 ring-12 ring-stone-950/20">
                {/* Speaker Grill / Notch */}
                <div className="absolute top-7 left-1/2 -translate-x-1/2 w-32 h-6 bg-stone-950 rounded-full z-20 flex items-center justify-around px-4">
                  <div className="w-1.5 h-1.5 bg-stone-800 rounded-full"></div>
                  <div className="w-12 h-1 bg-stone-800 rounded-full"></div>
                  <div className="w-2.5 h-1 bg-stone-800 rounded-full"></div>
                </div>

                {/* Mobile screen shell body */}
                <div className="relative bg-[#F4F4F1] rounded-[42px] overflow-hidden border border-black/10 min-h-[720px] flex flex-col text-stone-900 select-none">
                  
                  {/* Status Bar */}
                  <div className="h-10 pt-4 px-6 flex items-center justify-between text-[11px] font-medium text-stone-500 z-10 selection:bg-transparent">
                    <span className="font-mono">9:24 AM</span>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">● AI Shield</span>
                    <div className="flex items-center gap-1.5">
                      <span>5G</span>
                      <div className="w-5 h-2.5 border border-stone-400 rounded-sm p-0.5 flex items-center">
                        <div className="w-full h-full bg-stone-600 rounded-2xs"></div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile header (AppName) */}
                  <div className="px-5 py-3 border-b border-stone-200/60 bg-white/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rotate-45"></div>
                      </div>
                      <span className="text-sm font-display font-semibold tracking-tight uppercase">PriceWise Mobile</span>
                    </div>

                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => setMobileTab("alerts")} 
                        className="relative p-1.5 rounded-full hover:bg-stone-100 text-stone-600"
                      >
                        <Bell className="w-4 h-4" />
                        {alerts.length > 0 && (
                          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-rose-500 rounded-full"></span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* INTERACTIVE MOBILE CONTENT CONTAINER */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ maxHeight: "580px" }}>
                    
                    {/* Segment 1: SEARCH STATE LOADING EXECUTOR */}
                    {isLoading ? (
                      <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin"></div>
                          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-orange-500 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-[#72726E]">Consulting Shopping Oracle</p>
                          <p className="text-sm text-stone-600 italic font-serif mt-1 px-4">
                            "Determining baseline prices, analyzing markdown authenticity, and matching equivalent gear..."
                          </p>
                        </div>
                      </div>
                    ) : data ? (
                      <>
                        <div className="p-3 bg-white border border-black/5 rounded-2xl flex items-center gap-3 shadow-2xs">
                          <img 
                            src={data.product.imageUrl} 
                            alt={data.product.imageUrl} 
                            className="w-12 h-12 object-cover rounded-xl border border-stone-200" 
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] uppercase tracking-widest font-bold text-[#72726E]">{data.product.category}</span>
                            <h4 className="text-xs font-bold text-stone-900 truncate">{data.product.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-mono font-semibold text-stone-900">{currencyFormat(data.product.currentPrice)}</span>
                              <div className="flex items-center text-amber-500">
                                <Star className="w-3 h-3 fill-amber-500" />
                                <span className="text-[10px] font-bold ml-0.5 font-mono">{data.product.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* MOBILE TAB CONTROLS */}
                        <div className="grid grid-cols-3 gap-1 bg-stone-200/50 p-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                          <button 
                            onClick={() => setMobileTab("search")} 
                            className={`py-2 text-center rounded-lg transition-all ${mobileTab === "search" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500"}`}
                          >
                            Deal Signal
                          </button>
                          <button 
                            onClick={() => setMobileTab("history")} 
                            className={`py-2 text-center rounded-lg transition-all ${mobileTab === "history" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500"}`}
                          >
                            Predict Drops
                          </button>
                          <button 
                            onClick={() => setMobileTab("alternatives")} 
                            className={`py-2 text-center rounded-lg transition-all ${mobileTab === "alternatives" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500"}`}
                          >
                            Savings & Alts
                          </button>
                        </div>

                        {/* TAB A: MAIN DEAL SIGNAL VIEW */}
                        {mobileTab === "search" && (
                          <div className="space-y-4 animate-fade-in">
                            
                            {/* Buy/Wait Main Card */}
                            <div className="bg-white border border-black/5 p-5 rounded-[28px] shadow-sm flex flex-col gap-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[10px] uppercase tracking-widest text-[#72726E] font-bold">Deal Signal Target</span>
                                  <h3 className="text-3xl font-serif italic font-semibold text-stone-950 mt-1 capitalize">
                                    {data.recommendation.statusLabel}
                                  </h3>
                                </div>
                                <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-full border ${getRecommendationColor(data.recommendation.status)}`}>
                                  {data.recommendation.relativeDiff > 0 
                                    ? `+${data.recommendation.relativeDiff}% High` 
                                    : `${data.recommendation.relativeDiff}% Below Avg`}
                                </span>
                              </div>

                              <div className="p-3.5 bg-stone-50 rounded-2xl italic text-[13px] text-stone-600 border border-stone-100 leading-relaxed font-serif">
                                "{data.recommendation.reason}"
                              </div>

                              <div className="space-y-2 text-xs">
                                <span className="text-[10px] font-bold uppercase text-[#72726E] block tracking-widest mb-1">Key Context Factors</span>
                                {data.recommendation.bulletPoints.map((bp, i) => (
                                  <div key={i} className="flex gap-2.5 items-start text-stone-700">
                                    <div className="mt-1 w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                                    <span className="leading-normal">{bp}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Fake Discount Detector Frame */}
                            <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl flex flex-col gap-2 shadow-2xs">
                              <div className="flex items-center gap-2 text-orange-800">
                                <AlertTriangle className="w-4 h-4 text-orange-650" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Fake Discount Detector Status</span>
                              </div>
                              <p className="text-[11px] font-mono text-stone-500">
                                Advertising MSRP: <strong className="line-through">{currencyFormat(data.product.originalMSRP)}</strong> → <strong className="text-orange-950 font-bold">{currencyFormat(data.product.currentPrice)}</strong>
                              </p>
                              <p className="text-xs text-orange-950 leading-relaxed font-serif italic">
                                {data.fakeDiscount.analysis}
                              </p>
                              {data.fakeDiscount.isPossibleFake ? (
                                <span className="inline-block self-start text-[9px] font-bold uppercase tracking-wider bg-orange-200/50 text-orange-900 py-1 px-3 rounded-full mt-1 border border-orange-300">
                                  🚩 High Inflation Risk Detected
                                </span>
                              ) : (
                                <span className="inline-block self-start text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 py-1 px-3 rounded-full mt-1 border border-emerald-200">
                                  ✓ Verified Clean Markdown Margins
                                </span>
                              )}
                            </div>

                            {/* Brief Price Chart snapshot */}
                            <div className="bg-white border border-black/5 p-4 rounded-2xl shadow-xs">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-[#72726E] block mb-3">Historical Ticker</span>
                              <PriceChart points={data.history.points} currency={data.product.currency || "₹"} />
                            </div>

                          </div>
                        )}

                        {/* TAB B: DROP PREDICTION & STATS */}
                        {mobileTab === "history" && (
                          <div className="space-y-4 animate-fade-in">
                            
                            <div className="grid grid-cols-2 gap-3.5">
                              {/* Prediction Timeline */}
                              <div className="bg-white p-4 rounded-2xl border border-black/5 flex flex-col justify-between shadow-2xs">
                                <span className="text-[9px] uppercase tracking-widest font-bold text-[#72726E]">Likely Drop Target</span>
                                <div className="mt-3">
                                  <p className="text-base font-bold text-stone-900">{data.prediction.daysRange}</p>
                                  <p className="text-xs font-mono text-emerald-600 font-semibold mt-1">{data.prediction.expectedRange}</p>
                                </div>
                                <span className="inline-block self-start text-[8px] bg-stone-100 text-[#72726E] font-bold px-1.5 py-0.5 rounded mt-3">ESTIMATED</span>
                              </div>

                              {/* Confidence score */}
                              <div className="bg-stone-900 text-white p-4 rounded-2xl flex flex-col justify-between shadow-2xs">
                                <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400">AI Confidence Index</span>
                                <div className="mt-3">
                                  <p className="text-3xl font-mono font-bold text-emerald-400">{data.prediction.confidence}%</p>
                                  <div className="w-full bg-stone-800 h-1 rounded-full mt-2 overflow-hidden">
                                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${data.prediction.confidence}%` }}></div>
                                  </div>
                                </div>
                                <span className="text-[8px] tracking-wider text-stone-400 uppercase font-semibold mt-2">Historical Backtest Stable</span>
                              </div>
                            </div>

                            <div className="bg-white p-5 rounded-[24px] border border-black/5 shadow-2xs space-y-3">
                              <span className="text-[10px] font-bold uppercase text-[#72726E] tracking-widest block mb-1">Reasoning Analysis Parameters</span>
                              {data.prediction.reasons.map((reason, i) => (
                                <div key={i} className="flex gap-3 text-xs leading-relaxed text-stone-700">
                                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                  <span>{reason}</span>
                                </div>
                              ))}
                            </div>

                            {/* Full Detailed stats table list */}
                            <div className="bg-white dark:bg-white p-4 rounded-2xl border border-black/5 divide-y divide-stone-100 text-xs">
                              <div className="flex items-center justify-between pb-3.5">
                                <span className="text-stone-500 font-medium">Original Listed MSRP</span>
                                <span className="font-mono font-semibold text-stone-800">{currencyFormat(data.product.originalMSRP)}</span>
                              </div>
                              <div className="flex items-center justify-between py-3.5">
                                <span className="text-stone-500 font-medium">Typical Store Median Average</span>
                                <span className="font-mono font-semibold text-stone-800">{currencyFormat(data.history.average)}</span>
                              </div>
                              <div className="flex items-center justify-between py-3.5">
                                <span className="text-stone-500 font-medium">Absolute Historic Record Low</span>
                                <span className="font-mono text-emerald-600 font-bold">{currencyFormat(data.history.lowest)}</span>
                              </div>
                              <div className="flex items-center justify-between pt-3.5">
                                <span className="text-stone-500 font-medium">Absolute Historic Peak High</span>
                                <span className="font-mono text-rose-500 font-semibold">{currencyFormat(data.history.highest)}</span>
                              </div>
                            </div>

                          </div>
                        )}

                        {/* TAB C: SAVINGS & ALTERNATIVES */}
                        {mobileTab === "alternatives" && (
                          <div className="space-y-4 animate-fade-in">
                            <div className="p-3 bg-stone-950 text-stone-100 rounded-2xl flex items-center gap-2 justify-between">
                              <span className="text-[10px] uppercase text-emerald-400 font-bold pl-1 font-mono">Suggested Substitutes Matrix</span>
                              <span className="text-[9px] uppercase border border-stone-800 px-2 py-0.5 tracking-lighter text-stone-400 font-semibold">Avoid overpaying</span>
                            </div>

                            <p className="text-xs text-stone-500 italic font-serif leading-relaxed px-1">
                              "We mapped pricing arrays alongside hardware features. These alternative offerings deliver equivalent performance indexes at far better margins."
                            </p>

                            <div className="flex flex-col gap-3">
                              {data.alternatives.map((alt, idx) => {
                                const isPositiveSavings = alt.savings > 0;
                                return (
                                  <div 
                                    key={idx}
                                    onClick={() => setSelectedAlt(alt)}
                                    className="p-4 bg-white hover:bg-stone-50 border border-black/5 rounded-2xl shadow-2xs cursor-pointer transition-all hover:translate-x-1 flex justify-between items-start group"
                                  >
                                    <div className="flex-1 min-w-0 pr-2">
                                      <span className="text-[8px] bg-amber-50 text-amber-800 uppercase font-bold px-2 py-0.5 rounded border border-amber-200 tracking-wide font-mono">
                                        {alt.betterFeature}
                                      </span>
                                      <h4 className="text-xs font-bold text-stone-900 mt-2 group-hover:text-orange-600 transition-colors">{alt.name}</h4>
                                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#72726E]">
                                        <span>Similarity: <strong className="text-stone-800 font-bold font-mono">{alt.similarity}%</strong></span>
                                        <span>•</span>
                                        <span className="font-mono text-stone-900 font-semibold">{currencyFormat(alt.price)}</span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      {isPositiveSavings ? (
                                        <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-2 rounded-xl text-center">
                                          <p className="text-[8px] font-bold uppercase tracking-tighter">You Save</p>
                                          <p className="text-xs font-mono font-bold">{currencyFormat(alt.savings)}</p>
                                        </div>
                                      ) : (
                                        <div className="bg-stone-100 text-stone-500 p-2 rounded-xl text-center">
                                          <p className="text-[8px] font-bold uppercase tracking-tighter">Upgrade Diff</p>
                                          <p className="text-xs font-mono font-bold">+{currencyFormat(Math.abs(alt.savings))}</p>
                                        </div>
                                      )}
                                      <p className="text-[9px] text-[#72726E] font-medium mt-2 group-hover:underline">Compare Specs →</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* TAB D: ACTIVE PRICE drop ALERTS SIMULATOR */}
                        {mobileTab === "alerts" && (
                          <div className="space-y-4 animate-fade-in text-xs">
                            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                              <span className="font-bold text-stone-800 uppercase tracking-widest text-[10px]">Your Live Active Thresholds ({alerts.length})</span>
                              <span className="text-[10px] text-orange-600 font-bold font-mono uppercase">Sync OK</span>
                            </div>

                            {alerts.length === 0 ? (
                              <div className="py-12 text-center text-stone-400 font-serif italic">
                                "No active target price thresholds listed. Navigate back or click set alert to persist one!"
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {alerts.map((al) => (
                                  <div key={al.id} className="p-3.5 bg-white border border-black/5 rounded-2xl shadow-3xs flex items-center justify-between gap-4.5">
                                    <div className="flex items-center gap-3">
                                      <img 
                                        src={al.productImg} 
                                        className="w-10 h-10 object-cover rounded-lg border border-stone-200 flex-shrink-0" 
                                        alt={al.productName} 
                                      />
                                      <div>
                                        <p className="font-bold text-stone-900 line-clamp-1">{al.productName}</p>
                                        <p className="text-[10px] text-stone-500 mt-1">
                                          Target Code: <span className="font-mono font-semibold text-stone-800">{currencyFormat(al.targetPrice, al.currency)}</span>
                                        </p>
                                        <p className="text-[10px] text-stone-500 mt-0.5">
                                          Live Selling: <span className="font-mono text-emerald-600 font-medium">{currencyFormat(al.currentPrice, al.currency)}</span>
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2.5">
                                      <button 
                                        onClick={() => deleteAlert(al.id)}
                                        className="p-1.5 hover:bg-rose-50 text-stone-400 hover:text-rose-650 rounded-full transition-colors"
                                        title="Delete threshold alert"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                      {al.isTriggered ? (
                                        <span className="text-[8px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 py-0.5 px-2 rounded">
                                          🎯 Goal Triggered
                                        </span>
                                      ) : (
                                        <span className="text-[8px] font-bold uppercase tracking-wider bg-[#FFFAF0] text-amber-800 border border-amber-200 py-0.5 px-2 rounded">
                                          ⌚ Waiting
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                          </div>
                        )}

                      </>
                    ) : (
                      <div className="py-24 text-center">
                        <Sparkles className="w-10 h-10 text-orange-500 mx-auto animate-pulse mb-3" />
                        <p className="text-sm font-semibold text-stone-800">Ready to scrape intelligence</p>
                        <p className="text-xs text-[#72726E] italic font-serif mt-1">Submit a commodity term to initialize prediction engines.</p>
                      </div>
                    )}

                  </div>

                  {/* Mobile navigation footboard bar */}
                  <div className="h-16 border-t border-stone-200/80 bg-white/95 backdrop-blur-sm grid grid-cols-4 items-center text-center text-stone-500 font-medium text-[10px] selection:bg-transparent">
                    <button 
                      onClick={() => { setMobileTab("search"); if (!data) handleSearch("Sony WH-1000XM5"); }} 
                      className={`flex flex-col items-center gap-1 py-1 ${mobileTab === "search" ? "text-orange-600 font-bold" : "hover:text-stone-900"}`}
                    >
                      <Activity className="w-4 h-4" />
                      Deal Stream
                    </button>
                    <button 
                      onClick={() => { setMobileTab("history"); if (!data) handleSearch("Sony WH-1000XM5"); }} 
                      className={`flex flex-col items-center gap-1 py-1 ${mobileTab === "history" ? "text-orange-600 font-bold" : "hover:text-stone-900"}`}
                    >
                      <Clock className="w-4 h-4" />
                      Prediction
                    </button>
                    <button 
                      onClick={() => { setMobileTab("alternatives"); if (!data) handleSearch("Sony WH-1000XM5"); }} 
                      className={`flex flex-col items-center gap-1 py-1 ${mobileTab === "alternatives" ? "text-orange-600 font-bold" : "hover:text-stone-900"}`}
                    >
                      <Layers className="w-4 h-4" />
                      Alternatives
                    </button>
                    <button 
                      onClick={() => setMobileTab("alerts")} 
                      className={`flex flex-col items-center gap-1 py-1 relative ${mobileTab === "alerts" ? "text-orange-600 font-bold" : "hover:text-stone-900"}`}
                    >
                      <Bell className="w-4 h-4" />
                      Alerts
                      {alerts.length > 0 && (
                        <span className="absolute top-1 right-6 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                      )}
                    </button>
                  </div>

                </div>

                {/* Home Indicator line */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-32 h-1 bg-stone-850 rounded-full"></div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: COMPREHENSIVE ARCHITECTURAL SPECS */}
        {activeTab === "architecture" && (
          <div className="space-y-10 animate-fade-in">
            
            {/* Introductory panel */}
            <div className="bg-white border border-black/5 p-8 rounded-[32px] shadow-sm flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="max-w-2xl">
                <span className="text-xs uppercase tracking-widest font-bold text-orange-600 font-mono">System Blueprint Engineering Specs</span>
                <h1 className="text-4xl font-display font-medium tracking-tight text-stone-950 mt-1">Clean Architecture Specification</h1>
                <p className="text-sm text-stone-605 leading-relaxed mt-3">
                  Under the hood, PriceWise is structured as a full-stack client-server application utilizing high-performance API gateways. Below explore the complete technical topology layout including real-time Firestore database schema, API routing payloads, feature lifecycle mapping, and implementation phases.
                </p>
              </div>
              <div className="p-5 bg-orange-50 border border-orange-100 rounded-3xl shrink-0 text-center font-mono text-xs">
                <span className="text-orange-950 font-bold uppercase tracking-wider block mb-1">Preview Model ID</span>
                <span className="bg-white px-3 py-1.5 rounded-lg border text-stone-800 font-semibold block shadow-2xs">gemini-3.5-flash / server proxy</span>
              </div>
            </div>

            {/* Architecture grid segments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Modules breakdown */}
              <div className="bg-white border border-black/5 p-6 rounded-[28px] shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                  <Layers className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-bold text-stone-900">1. Modular Component Layout</h3>
                </div>
                <div className="space-y-4 text-xs leading-normal">
                  {ARCHITECTURE_DATA.map((arch, idx) => (
                    <div key={idx} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/65 flex flex-col gap-1.5">
                      <p className="font-bold text-stone-950 text-sm font-display">{arch.module}</p>
                      <p className="text-stone-600 italic font-serif leading-relaxed">"{arch.description}"</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {arch.technologies.map((tech, i) => (
                          <span key={i} className="bg-orange-50 text-orange-900 border border-orange-100 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">{tech}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Schema structures */}
              <div className="bg-white border border-black/5 p-6 rounded-[28px] shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                  <Database className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-bold text-stone-900">2. NoSQL Database Schema Blueprint</h3>
                </div>
                <div className="space-y-5 text-xs">
                  {DATABASE_SCHEMA_DATA.map((schema, idx) => (
                    <div key={idx} className="space-y-2 border border-stone-100 rounded-xl p-3.5 bg-stone-50/50">
                      <div className="flex justify-between items-baseline">
                        <span className="font-mono text-sm text-stone-900 font-bold">Collection: <strong className="text-orange-600">/{schema.collectionName}</strong></span>
                      </div>
                      <p className="text-[11px] text-[#72726E] font-serif italic mb-2">"{schema.description}"</p>
                      <div className="divide-y divide-stone-100/60 bg-white border rounded-xl overflow-hidden shadow-3xs">
                        {schema.fields.map((field, fIdx) => (
                          <div key={fIdx} className="p-2 flex justify-between gap-4 text-[11px]">
                            <div className="font-mono">
                              <span className="text-stone-800 font-semibold">{field.name}</span>
                              {field.isPrimary && <span className="text-[8px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded ml-1 font-bold">KEY</span>}
                            </div>
                            <span className="text-stone-400 text-right">{field.type} — <span className="text-stone-600 font-sans italic">{field.description}</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Feature flow & Roadmap */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Feature Flow steps */}
              <div className="bg-stone-950 text-stone-100 p-6 rounded-[28px] shadow-xl space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-800">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-slate-100 font-display">3. Runtime Feature Pipelines</h3>
                </div>
                <div className="space-y-4">
                  {FEATURE_FLOW_STEPS.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold font-mono text-xs shrink-0">{idx + 1}</div>
                      <div>
                        <p className="text-sm font-semibold text-stone-200">{step.title}</p>
                        <p className="text-xs text-stone-400 mt-0.5 leading-relaxed font-serif italic font-light">"{step.desc}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step implementation road map */}
              <div className="bg-white border border-black/5 p-6 rounded-[28px] shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                  <Sliders className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-bold text-stone-900">4. Engineering Deployment Roadmap</h3>
                </div>
                <div className="space-y-4 text-xs font-serif italic">
                  {ROADMAP_ROAD.map((road, idx) => (
                    <div key={idx} className="relative pl-6 pb-2">
                      <div className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full bg-orange-500 border border-white"></div>
                      {idx < ROADMAP_ROAD.length - 1 && (
                        <div className="absolute left-1 top-2.5 w-[2px] h-full bg-stone-100"></div>
                      )}
                      
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-sans font-bold text-stone-900 not-italic">{road.phase}</span>
                        <span className={`font-sans not-italic text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${road.status === "Completed" ? "bg-emerald-100 text-emerald-800" : (road.status === "In Progress" ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-500")}`}>
                          {road.status}
                        </span>
                      </div>
                      <div className="space-y-1 font-sans not-italic text-[#72726E] text-[11px] list-disc mt-1.5 pl-2 leading-relaxed">
                        {road.bullets.map((b, bIdx) => (
                          <div key={bIdx} className="flex gap-2">
                            <span>•</span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Simulated API documentation panel */}
            <div className="bg-slate-900 text-white rounded-[32px] p-6 shadow-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span className="font-monospace text-sm font-bold">API Specifications Listing Diagram</span>
                </div>
                <span className="text-[10px] bg-slate-800 px-3 py-1.5 rounded text-slate-400 font-mono">REST JSON payloads</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                
                {/* Search API */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-emerald-400 font-semibold text-xs">POST /api/search</span>
                    <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold text-[9px]">ACTIVE</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Triggered server-side to coordinate search logic, query Gemini 3.5-flash with rigorous constraints, or return fallback assets securely.</p>
                  <p className="font-mono text-[10px] text-slate-500">// Payload request: {"{ query: string }"}</p>
                </div>

                {/* Notifications setup */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-amber-400 font-semibold text-xs">POST /api/alerts</span>
                    <span className="bg-amber-950 text-amber-450 px-1.5 py-0.5 rounded font-mono font-bold text-[9px]">SIMULATED</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Stores alert configuration in backend documents, connects FCM configurations, and monitors market tickers for threshold boundaries.</p>
                  <p className="font-mono text-[10px] text-slate-500">// Payload request: {"{ userId, productId, targetPrice }"}</p>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>

      {/* COMPACT SPECIFICATIONS MODAL - TRIGGERED WHEN AN ALTERNATIVE IS CLICKED */}
      {selectedAlt && (
        <div id="spec-comparison-modal" className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F7F7F5] text-[#1A1A1A] w-full max-w-lg rounded-[32px] overflow-hidden border border-black/10 shadow-2xl animate-fade-in flex flex-col">
            
            <div className="bg-stone-900 text-[#F7F7F5] p-6 flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">
                  {selectedAlt.similarity}% Spec Equivalence Match
                </span>
                <h3 className="text-xl font-display font-medium mt-2">{selectedAlt.name}</h3>
                <p className="text-xs text-stone-400 mt-1">Side-by-side alternative comparison</p>
              </div>
              <button 
                onClick={() => setSelectedAlt(null)}
                className="p-1 rounded-full bg-stone-800 text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 max-h-[400px]">
              <div className="bg-white border p-3.5 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <p className="text-stone-500 font-medium">Alternative retail price</p>
                  <p className="text-lg font-mono font-bold text-stone-900 mt-0.5">{currencyFormat(selectedAlt.price)}</p>
                </div>
                <div className="bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-xl text-right border border-emerald-100">
                  <p className="text-[9px] font-bold uppercase tracking-wider">Equivalent Savings</p>
                  <p className="text-sm font-mono font-bold">{selectedAlt.savings > 0 ? currencyFormat(selectedAlt.savings) : `+${currencyFormat(Math.abs(selectedAlt.savings))}`}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#72726E] pl-1 block">Specifications Matrix</span>
                <div className="bg-white rounded-2xl border divide-y overflow-hidden text-xs">
                  {Object.entries(selectedAlt.comparison).map(([key, val]) => (
                    <div key={key} className="p-3 flex justify-between gap-4">
                      <span className="font-semibold text-stone-700">{key}</span>
                      <span className="text-stone-600 font-mono text-right font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-stone-100/60 border-t flex gap-2">
              <button
                onClick={() => {
                  if (data) {
                    handleSearch(selectedAlt.name);
                    setSelectedAlt(null);
                  }
                }}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-slate-900 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
              >
                Inspect This Item
              </button>
              <button
                onClick={() => setSelectedAlt(null)}
                className="px-6 py-3 bg-stone-200 hover:bg-stone-300 rounded-full text-xs font-bold uppercase tracking-wider transition-all text-stone-700"
              >
                Dismiss Comparison
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER AREA */}
      <footer className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-stone-200 text-xs text-[#72726E] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-[#F7F7F5] rotate-45"></div>
          </div>
          <span className="font-display font-medium tracking-tight uppercase">PriceWise Engine v1.0</span>
        </div>
        <p className="italic font-serif">"An intelligent shopping assistant that ensures you never overpay."</p>
        <div className="flex gap-4 font-bold uppercase tracking-widest text-[9px]">
          <a href="#" className="hover:text-stone-900">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-stone-900">Terms of Use</a>
          <span>•</span>
          <a href="#" className="hover:text-stone-900">API Gateway Core</a>
        </div>
      </footer>

    </div>
  );
}
