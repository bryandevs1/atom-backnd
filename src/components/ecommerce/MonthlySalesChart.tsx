// components/VendorMonthlySalesChart.tsx
import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useAuth } from '../../context/AuthContext';
import { MoreDotIcon } from "../../icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

interface MonthlyTrend {
  month: string;
  revenue: number;
}

interface ApiResponse {
  data: {
    monthly_trends: MonthlyTrend[];
    year: number;
  };
}

const VendorMonthlySalesChart: React.FC = () => {
  const [series, setSeries] = useState([{ name: "Sales", data: Array(12).fill(0) }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { token } = useAuth();

  const fetchVendorMonthlySales = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://nexodus.tech/api/vendor/analytics?year=${selectedYear}`,
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

      const data: ApiResponse = await response.json();

      if (!data.data?.monthly_trends) {
        throw new Error("Invalid data format: monthly_trends missing");
      }

      // Process monthly trends data
      const monthlySales = Array(12).fill(0);
      data.data.monthly_trends.forEach(trend => {
        const [year, month] = trend.month.split('-').map(Number);
        if (year === selectedYear) {
          const monthIndex = month - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlySales[monthIndex] = trend.revenue;
          }
        }
      });

      setSeries([{ name: "Sales", data: monthlySales }]);
    } catch (err) {
      console.error("Error fetching vendor monthly sales:", err);
      setError(err instanceof Error ? err.message : "Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorMonthlySales();
  }, [selectedYear, token]);

  const chartOptions: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: { show: false },
      animations: { enabled: true },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => `$${val.toFixed(2)}`,
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
    },
    fill: { opacity: 1 },
    tooltip: {
      enabled: true,
      x: { show: false },
      y: {
        formatter: (val) => `$${val.toFixed(2)}`,
        title: { formatter: () => "Sales" },
      },
      style: { fontSize: "12px" },
    },
    responsive: [{
      breakpoint: 640,
      options: {
        plotOptions: { bar: { columnWidth: "45%" } },
        xaxis: { labels: { rotate: -45 } },
      },
    }],
  };

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            My Monthly Sales
          </h3>
          <MoreDotIcon className="text-gray-400 size-6" />
        </div>
        <div className="h-[180px] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">
            Loading sales data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            My Monthly Sales
          </h3>
          <MoreDotIcon className="text-gray-400 size-6" />
        </div>
        <div className="h-[180px] flex flex-col items-center justify-center gap-2">
          <div className="text-red-500 text-sm">{error}</div>
          <button
            onClick={fetchVendorMonthlySales}
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          My Monthly Sales ({selectedYear})
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white dark:bg-gray-800 dark:border-gray-700"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="relative inline-block">
            <button
              onClick={toggleDropdown}
              aria-label="More options"
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2">
              <DropdownItem
                onClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Export Data
              </DropdownItem>
              <DropdownItem
                onClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View Details
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart
            options={chartOptions}
            series={series}
            type="bar"
            height={180}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default VendorMonthlySalesChart;