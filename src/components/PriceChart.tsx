import React from "react";
import { PricePoint } from "../types";

interface PriceChartProps {
  points: PricePoint[];
  currency: string;
}

export default function PriceChart({ points, currency = "₹" }: PriceChartProps) {
  if (!points || points.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-slate-800/40 rounded-xl border border-slate-700/50">
        <p className="text-sm text-slate-400">No chart details recorded</p>
      </div>
    );
  }

  const prices = points.map((p) => p.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // Render variables
  const paddingX = 40;
  const paddingY = 25;
  const width = 500;
  const height = 200;

  // Generate coordinates
  const svgPoints = points.map((pt, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / (points.length - 1);
    // Inverse Y so higher values coordinates on top
    const relativeY = (pt.price - minPrice) / priceRange;
    const y = height - paddingY - relativeY * (height - paddingY * 2);
    return { x, y, price: pt.price, date: pt.date };
  });

  // Polyline coordinates string
  const pointsStr = svgPoints.map((pt) => `${pt.x},${pt.y}`).join(" ");

  // Closed path for fill area under the line
  const areaPointsStr = `${svgPoints[0].x},${height - paddingY} ${pointsStr} ${
    svgPoints[svgPoints.length - 1].x
  },${height - paddingY}`;

  // Formatter for axis dates (just Month-Day or short display)
  const formatAxisDate = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const monthIndex = parseInt(parts[1], 10) - 1;
        return `${monthNames[monthIndex]} ${parts[2]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Pricing Chart Trace</span>
          <h4 className="text-sm font-semibold text-slate-200">Historical Ticker Fluctuations</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-xs text-slate-400">Retail Index</span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[320px] h-auto overflow-visible select-none"
        >
          <defs>
            {/* Soft backdrop gradient fill */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
            </linearGradient>
            {/* Custom line gradient */}
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#1e293b"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={(height - paddingY + paddingY) / 2}
            x2={width - paddingX}
            y2={(height - paddingY + paddingY) / 2}
            stroke="#1e293b"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Area fill path */}
          <polygon points={areaPointsStr} fill="url(#areaGradient)" />

          {/* Trend line */}
          <polyline
            points={pointsStr}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points markers */}
          {svgPoints.map((pt, i) => (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                fill="#0f172a"
                stroke="#10b981"
                strokeWidth="2.5"
                className="transition-transform duration-200 hover:scale-150"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r="10"
                fill="transparent"
                className="hover:fill-emerald-500/10 transition-colors"
              />
              {/* Tooltip on individual values */}
              <text
                x={pt.x}
                y={pt.y - 10}
                textAnchor="middle"
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 duration-200 font-mono text-[9px] fill-emerald-300 font-semibold"
              >
                {currency}
                {pt.price.toLocaleString()}
              </text>
            </g>
          ))}

          {/* Edge values indicators */}
          {/* Highest Tag */}
          <text
            x={paddingX - 5}
            y={paddingY + 4}
            textAnchor="end"
            className="font-mono text-[10px] fill-slate-500"
          >
            {currency}
            {maxPrice.toLocaleString()}
          </text>

          {/* Lowest Tag */}
          <text
            x={paddingX - 5}
            y={height - paddingY + 4}
            textAnchor="end"
            className="font-mono text-[10px] fill-slate-500"
          >
            {currency}
            {minPrice.toLocaleString()}
          </text>

          {/* First Date */}
          <text
            x={paddingX}
            y={height - paddingY + 16}
            textAnchor="middle"
            className="font-sans text-[9px] fill-slate-500 font-medium"
          >
            {formatAxisDate(points[0].date)}
          </text>

          {/* Mid Date */}
          <text
            x={width / 2}
            y={height - paddingY + 16}
            textAnchor="middle"
            className="font-sans text-[9px] fill-slate-500 font-medium"
          >
            {formatAxisDate(points[Math.floor(points.length / 2)].date)}
          </text>

          {/* End Date */}
          <text
            x={width - paddingX}
            y={height - paddingY + 16}
            textAnchor="middle"
            className="font-sans text-[9px] fill-slate-500 font-medium"
          >
            {formatAxisDate(points[points.length - 1].date)}
          </text>
        </svg>
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
        <span>Low: <strong className="text-emerald-400 font-mono">{currency}{minPrice.toLocaleString()}</strong></span>
        <span>Avg: <strong className="text-slate-300 font-mono">{currency}{Math.round(points.reduce((a, b) => a + b.price, 0) / points.length).toLocaleString()}</strong></span>
        <span>High: <strong className="text-rose-400 font-mono">{currency}{maxPrice.toLocaleString()}</strong></span>
      </div>
    </div>
  );
}
