import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../lib/supabase/client";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Activity,
  ArrowUpRight,
  Loader2,
  Package,
  RefreshCw,
} from "lucide-react";
import type { OrderFull } from "../../cashier/types";
import { Link } from "react-router";

type TopProduct = {
  name: string;
  qty: number;
  revenue: number;
};

type ChartData = {
  dayName: string;
  dateStr: string;
  revenue: number;
};

const DashboardPage = () => {
  const [orders, setOrders] = useState<OrderFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [dateFilter, setDateFilter] = useState<"today" | "yesterday" | "7days" | "month" | "all">("7days");

  // Stats
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select(`*, order_items (*)`)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setOrders((data as OrderFull[]) ?? []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Recalculate stats when orders or dateFilter changes
  useEffect(() => {
    if (orders.length === 0) {
      setTotalRevenue(0);
      setCompletedOrdersCount(0);
      setActiveOrdersCount(0);
      setAverageOrderValue(0);
      setTopProducts([]);
      setChartData([]);
      return;
    }

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter orders based on dateFilter
    const filtered = orders.filter((order) => {
      const orderDate = new Date(order.created_at);
      const orderDateStr = order.created_at.split("T")[0];

      if (dateFilter === "today") {
        return orderDateStr === todayStr;
      }
      if (dateFilter === "yesterday") {
        return orderDateStr === yesterdayStr;
      }
      if (dateFilter === "7days") {
        return orderDate >= sevenDaysAgo;
      }
      if (dateFilter === "month") {
        return orderDate >= startOfMonth;
      }
      return true; // all
    });

    // 1. Calculate general stats
    let revenueSum = 0;
    let completedCount = 0;
    let activeCount = 0;

    filtered.forEach((order) => {
      if (order.status === "done") {
        revenueSum += order.total_price;
        completedCount += 1;
      } else if (order.status === "pending" || order.status === "processing") {
        activeCount += 1;
      }
    });

    setTotalRevenue(revenueSum);
    setCompletedOrdersCount(completedCount);
    setActiveOrdersCount(activeCount);
    setAverageOrderValue(completedCount > 0 ? revenueSum / completedCount : 0);

    // 2. Calculate Top Selling Products
    const productMap: { [key: string]: { qty: number; revenue: number } } = {};
    filtered.forEach((order) => {
      if (order.status === "done" && order.order_items) {
        order.order_items.forEach((item) => {
          if (!productMap[item.product_name]) {
            productMap[item.product_name] = { qty: 0, revenue: 0 };
          }
          productMap[item.product_name].qty += item.qty;
          productMap[item.product_name].revenue += item.subtotal;
        });
      }
    });

    const sortedProducts: TopProduct[] = Object.keys(productMap)
      .map((name) => ({
        name,
        qty: productMap[name].qty,
        revenue: productMap[name].revenue,
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    setTopProducts(sortedProducts);

    // 3. Build Dynamic Chart Data based on current filter
    let calculatedChartData: ChartData[] = [];

    if (dateFilter === "today" || dateFilter === "yesterday") {
      // Hourly trend (4 intervals)
      const targetDateStr = dateFilter === "today" ? todayStr : yesterdayStr;
      const hours = [
        { label: "Subuh (00-06)", start: 0, end: 5 },
        { label: "Pagi (06-12)", start: 6, end: 11 },
        { label: "Siang (12-18)", start: 12, end: 17 },
        { label: "Malam (18-24)", start: 18, end: 23 },
      ];

      calculatedChartData = hours.map((h) => ({
        dayName: h.label.split(" ")[0],
        dateStr: `${targetDateStr} ${h.start}:00`,
        revenue: 0,
      }));

      filtered.forEach((order) => {
        if (order.status === "done" && order.created_at.split("T")[0] === targetDateStr) {
          const hour = new Date(order.created_at).getHours();
          hours.forEach((h, index) => {
            if (hour >= h.start && hour <= h.end) {
              calculatedChartData[index].revenue += order.total_price;
            }
          });
        }
      });
    } else if (dateFilter === "7days") {
      // 7 Daily bars
      const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        calculatedChartData.push({
          dayName: days[d.getDay()],
          dateStr: d.toISOString().split("T")[0],
          revenue: 0,
        });
      }

      filtered.forEach((order) => {
        if (order.status === "done") {
          const orderDateStr = order.created_at.split("T")[0];
          const matchedDay = calculatedChartData.find((day) => day.dateStr === orderDateStr);
          if (matchedDay) {
            matchedDay.revenue += order.total_price;
          }
        }
      });
    } else if (dateFilter === "month") {
      // 4 Weekly bars of this month
      const weeks = ["Mng 1", "Mng 2", "Mng 3", "Mng 4+"];
      calculatedChartData = weeks.map((w) => ({
        dayName: w,
        dateStr: w,
        revenue: 0,
      }));

      filtered.forEach((order) => {
        if (order.status === "done") {
          const dateNum = new Date(order.created_at).getDate();
          let weekIdx = 0;
          if (dateNum > 7 && dateNum <= 14) weekIdx = 1;
          else if (dateNum > 14 && dateNum <= 21) weekIdx = 2;
          else if (dateNum > 21) weekIdx = 3;

          calculatedChartData[weekIdx].revenue += order.total_price;
        }
      });
    } else {
      // 'all' - Monthly trend of the last 6 months
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const monthLabel = months[d.getMonth()];
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        calculatedChartData.push({
          dayName: monthLabel,
          dateStr: key,
          revenue: 0,
        });
      }

      filtered.forEach((order) => {
        if (order.status === "done") {
          const oDate = new Date(order.created_at);
          const key = `${oDate.getFullYear()}-${String(oDate.getMonth() + 1).padStart(2, "0")}`;
          const matchedMonth = calculatedChartData.find((m) => m.dateStr === key);
          if (matchedMonth) {
            matchedMonth.revenue += order.total_price;
          }
        }
      });
    }

    setChartData(calculatedChartData);
  }, [orders, dateFilter]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Menunggu";
      case "processing":
        return "Diproses";
      case "done":
        return "Selesai";
      default:
        return "Dibatalkan";
    }
  };

  // Find max revenue for chart scaling
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  const getChartSublabel = () => {
    switch (dateFilter) {
      case "today":
        return "Total penjualan hari ini";
      case "yesterday":
        return "Total penjualan kemarin";
      case "7days":
        return "Total penjualan 7 hari terakhir";
      case "month":
        return "Total penjualan bulan ini";
      default:
        return "Total penjualan keseluruhan";
    }
  };

  const getChartPillLabel = () => {
    switch (dateFilter) {
      case "today":
      case "yesterday":
        return "Per Jam";
      case "7days":
        return "Harian";
      case "month":
        return "Mingguan";
      default:
        return "Bulanan";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-zinc-400">
        <Loader2 size={36} className="animate-spin mb-4 text-indigo-600" />
        <span className="text-sm font-medium">Memuat statistik dashboard...</span>
      </div>
    );
  }

  // SVG Area Chart Calculations
  const paddingLeft = 65;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  const svgWidth = 600;
  const svgHeight = 240;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = chartData.map((d, i) => {
    const x = paddingLeft + (chartData.length > 1 ? (i / (chartData.length - 1)) * chartWidth : chartWidth / 2);
    const y = (svgHeight - paddingBottom) - (d.revenue / maxRevenue) * chartHeight;
    return { x, y, data: d };
  });

  const linePath = points.length > 0
    ? `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`
    : "";

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`
    : "";

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((tick) => {
    const value = tick * maxRevenue;
    const y = (svgHeight - paddingBottom) - tick * chartHeight;
    return { value, y };
  });

  const formatYAxisLabel = (value: number) => {
    if (value >= 1_000_000) {
      return `Rp ${(value / 1_000_000).toFixed(1).replace(".0", "")}jt`;
    }
    if (value >= 1_000) {
      return `Rp ${(value / 1_000).toFixed(0)}rb`;
    }
    return `Rp ${value}`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 font-light">
            Pantau performa penjualan, pesanan aktif, dan ringkasan transaksi bisnis Anda.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Date Filter Buttons */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {(["today", "yesterday", "7days", "month", "all"] as const).map((opt) => {
              const labels = {
                today: "Hari Ini",
                yesterday: "Kemarin",
                "7days": "7 Hari",
                month: "Bulan Ini",
                all: "Semua",
              };
              const active = dateFilter === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setDateFilter(opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    active
                      ? "bg-white dark:bg-zinc-805 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-xs"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  {labels[opt]}
                </button>
              );
            })}
          </div>

          <button
            onClick={loadDashboardData}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer active:scale-95 bg-white dark:bg-zinc-900/50"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-650 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Revenue */}
        <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-5 shadow-xs">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div className="space-y-1 min-w-0">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Pendapatan</span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 block truncate font-mono tracking-tight">{formatPrice(totalRevenue)}</span>
          </div>
        </div>

        {/* Metric 2: Active Orders */}
        <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-5 shadow-xs">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Activity className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Pesanan Aktif</span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 block font-mono">{activeOrdersCount}</span>
          </div>
        </div>

        {/* Metric 3: Total Orders */}
        <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-5 shadow-xs">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Total Selesai</span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 block font-mono">{completedOrdersCount}</span>
          </div>
        </div>

        {/* Metric 4: Average Order Value */}
        <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-5 shadow-xs">
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 text-orange-650 dark:text-orange-400 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="space-y-1 min-w-0">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Rata-rata Order</span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 block truncate font-mono tracking-tight">{formatPrice(averageOrderValue)}</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Section */}
        <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 lg:col-span-2 space-y-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Tren Pendapatan</h3>
              <p className="text-xs text-zinc-450 dark:text-zinc-400 font-light">{getChartSublabel()}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 rounded-lg border border-zinc-200 dark:border-zinc-800">
              {getChartPillLabel()}
            </span>
          </div>

          {/* SVG Line / Area Chart */}
          <div className="relative w-full h-64 select-none mt-2">
            <svg
              className="w-full h-full"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              <g className="opacity-80">
                {/* Grid Lines */}
                {yTicks.map((tick, i) => (
                  <g key={i}>
                    <line
                      x1={paddingLeft}
                      y1={tick.y}
                      x2={svgWidth - paddingRight}
                      y2={tick.y}
                      className="stroke-zinc-100 dark:stroke-zinc-800/80"
                      strokeWidth={1}
                      strokeDasharray={tick.value === 0 ? "" : "4 4"}
                    />
                    <text
                      x={paddingLeft - 8}
                      y={tick.y + 4}
                      textAnchor="end"
                      className="text-[10px] fill-zinc-400 dark:fill-zinc-500 font-mono font-medium"
                    >
                      {formatYAxisLabel(tick.value)}
                    </text>
                  </g>
                ))}
              </g>

              <defs>
                {/* Area Gradient */}
                <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                </linearGradient>
                {/* Line Gradient */}
                <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>

              {/* Area path */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill="url(#area-gradient)"
                />
              )}

              {/* Line path */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="url(#line-gradient)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Dots & Guide-lines */}
              {points.map((p, idx) => (
                <g key={idx}>
                  {activeIdx === idx && (
                    <>
                      {/* Vertical gridline */}
                      <line
                        x1={p.x}
                        y1={paddingTop}
                        x2={p.x}
                        y2={svgHeight - paddingBottom}
                        className="stroke-zinc-200 dark:stroke-zinc-700/60"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                      />
                      {/* Outer pulse */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={7.5}
                        fill="#34d399"
                        opacity={0.3}
                      />
                    </>
                  )}
                  {/* Point circle */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={activeIdx === idx ? 5 : 3.5}
                    fill={activeIdx === idx ? "#10b981" : "#ffffff"}
                    className="dark:fill-zinc-950"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </g>
              ))}

              {/* X Axis Labels */}
              {points.map((p, idx) => (
                <text
                  key={idx}
                  x={p.x}
                  y={svgHeight - paddingBottom + 18}
                  textAnchor="middle"
                  className="text-[10px] fill-zinc-400 dark:fill-zinc-500 font-semibold"
                >
                  {p.data.dayName}
                </text>
              ))}

              {/* Invisible interactive overlay columns for touch/hover trigger */}
              {points.map((p, idx) => {
                const stepWidth = chartWidth / (chartData.length - 1 || 1);
                return (
                  <rect
                    key={idx}
                    x={p.x - stepWidth / 2}
                    y={paddingTop}
                    width={stepWidth}
                    height={chartHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveIdx(idx)}
                    onMouseLeave={() => setActiveIdx(null)}
                  />
                );
              })}
            </svg>

            {/* Floating Custom Tooltip */}
            {activeIdx !== null && points[activeIdx] && (
              <div
                className="absolute bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl p-3 shadow-xl text-xs z-25 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 flex flex-col font-mono"
                style={{
                  left: `${(points[activeIdx].x / svgWidth) * 100}%`,
                  top: `${(points[activeIdx].y / svgHeight) * 100}%`,
                }}
              >
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-medium">
                  {points[activeIdx].data.dayName} • {points[activeIdx].data.dateStr}
                </span>
                <span className="font-bold text-sm mt-0.5 text-emerald-600 dark:text-emerald-400">
                  {formatPrice(points[activeIdx].data.revenue)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Top Products Section */}
        <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-0.5">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Produk Terlaris</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-light">Berdasarkan volume penjualan (Selesai)</p>
          </div>

          <div className="space-y-4 flex-1 mt-4">
            {topProducts.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 dark:text-zinc-600 text-sm font-light">
                <Package className="h-10 w-10 mx-auto mb-2 text-zinc-200 dark:text-zinc-800" />
                Belum ada data penjualan produk.
              </div>
            ) : (
              topProducts.map((p, idx) => {
                const maxQty = topProducts[0]?.qty || 1;
                const progressWidth = (p.qty / maxQty) * 100;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[170px]">{p.name}</span>
                      <span className="text-zinc-500 dark:text-zinc-400 font-semibold shrink-0 font-mono">{p.qty}x</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${progressWidth}%` }}
                        className="bg-emerald-500 dark:bg-emerald-600 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-xs">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Transaksi Terbaru</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-light">5 transaksi terakhir yang tercatat</p>
          </div>
          <Link
            to="/cashier"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
          >
            <span>Kelola Pesanan</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle px-6">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="text-zinc-900 dark:text-zinc-100 text-left text-xs font-semibold uppercase tracking-wider bg-zinc-50/60 dark:bg-zinc-900/40">
                <tr>
                  <th scope="col" className="py-3.5 px-4 rounded-l-xl">ID Pesanan</th>
                  <th scope="col" className="py-3.5 px-4">Tanggal & Waktu</th>
                  <th scope="col" className="py-3.5 px-4">Status</th>
                  <th scope="col" className="py-3.5 px-4 text-right rounded-r-xl">Total Bayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-zinc-400 dark:text-zinc-600 font-light">
                      Belum ada transaksi tercatat.
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((order) => {
                    const formattedDate = new Date(order.created_at).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });
                    return (
                      <tr key={order.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/30 transition">
                        <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-[120px] font-mono text-xs">
                          #{order.id.slice(0, 8)}...
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400">{formattedDate}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            order.status === "done"
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30"
                              : order.status === "pending"
                                ? "bg-yellow-50 text-yellow-750 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/30"
                                : order.status === "processing"
                                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30"
                                  : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
                          }`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                          {formatPrice(order.total_price)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
