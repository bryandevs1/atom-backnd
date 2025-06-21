import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";
import { useState, useEffect } from "react";
import { MoreDotIcon } from "../../icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useAuth } from "../../context/AuthContext";

export default function StatisticsChart() {
  const [series, setSeries] = useState([
    { name: "Orders", data: Array(12).fill(0) },
    { name: "Revenue", data: Array(12).fill(0) },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<2023 | 2024 | 2025 | 2026>(
    2025
  );
  const { token } = useAuth(); // Assuming useAuth provides the token
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "https://nexodus.tech/api/dashboard/monthly-stats",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          throw new Error("Response is not JSON");
        }

        const data = await response.json();

        // Validate data structure based on your actual format
        if (!data.orders || !Array.isArray(data.orders)) {
          throw new Error("Invalid data format: orders array missing");
        }

        // Process orders and revenue data
        const ordersData = Array(12).fill(0);
        const revenueData = Array(12).fill(0);

        data.orders.forEach((order: any) => {
          try {
            const [year, month] = order.month.split("-").map(Number);
            if (year === selectedYear) {
              const monthIndex = month - 1;
              if (monthIndex >= 0 && monthIndex < 12) {
                ordersData[monthIndex] = order.count || 0;
                revenueData[monthIndex] = parseFloat(order.revenue) || 0;
              }
            }
          } catch (e) {
            console.warn("Error processing order:", order, e);
          }
        });

        setSeries([
          { name: "Orders", data: ordersData },
          { name: "Revenue", data: revenueData },
        ]);
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load statistics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [selectedYear]);

  const handleYearChange = (year: 2023 | 2024 | 2025 | 2026) => {
    setSelectedYear(year);
  };
  const chartOptions: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit, sans-serif",
      markers: {
        radius: 0,
        width: 12,
        height: 12,
      },
    },
    colors: ["#465FFF", "#FF7A45"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: { show: false },
      animations: { enabled: true },
      zoom: { enabled: false },
    },
    stroke: {
      curve: "smooth",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    markers: {
      size: 4,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      x: {
        show: true,
        format: "MMM yyyy",
      },
      y: {
        formatter: (val, { seriesIndex }) =>
          seriesIndex === 0 ? val.toString() : `$${val.toFixed(2)}`,
      },
      style: { fontSize: "12px" },
    },
    xaxis: {
      type: "category",
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    yaxis: [
      {
        title: { text: "Orders" },
        labels: {
          formatter: (val) => val.toFixed(0),
          style: { colors: "#465FFF" },
        },
      },
      {
        opposite: true,
        title: { text: "Revenue ($)" },
        labels: {
          formatter: (val) => `$${val.toFixed(2)}`,
          style: { colors: "#FF7A45" },
        },
      },
    ],
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: { height: 250 },
          markers: { size: 3 },
          legend: { position: "bottom" },
        },
      },
    ],
  };

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
          <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Monthly Statistics
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Loading data...
            </p>
          </div>
        </div>
        <div className="h-[310px] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">
            Loading chart data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
          <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Monthly Statistics
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Error loading data
            </p>
          </div>
        </div>
        <div className="h-[310px] flex flex-col items-center justify-center gap-3">
          <div className="text-red-500 text-sm">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Monthly Statistics ({selectedYear})
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Orders and revenue by month
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
          />{" "}
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart
            options={chartOptions}
            series={series}
            type="area"
            height={310}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
}
