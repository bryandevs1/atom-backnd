import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { ArrowUpIcon, ArrowDownIcon } from "../../icons";
import { useAuth } from "../../context/AuthContext";

export default function MonthlyTarget() {
  const [customerData, setCustomerData] = useState({
    total: 0,
    growthPercentage: 0,
    monthlyData: Array(12).fill(0),
  });
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { token } = useAuth(); // Assuming useAuth provides the token

  useEffect(() => {
    // Simulate API fetch with your actual data structure
    const fetchData = async () => {
      try {
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
        const data = await response.json();

        // Process customer data
        const customers = data.customers || [];
        const monthlyData = Array(12).fill(0);
        let totalCustomers = 0;

        customers.forEach((customer: any) => {
          const [year, month] = customer.month.split("-").map(Number);
          if (year === new Date().getFullYear()) {
            monthlyData[month - 1] += customer.count;
            totalCustomers += customer.count;
          }
        });

        // Calculate growth (example: current month vs previous month)
        const currentMonth = new Date().getMonth();
        const prevMonth = currentMonth > 0 ? currentMonth - 1 : 11;
        const growth =
          monthlyData[currentMonth] && monthlyData[prevMonth]
            ? ((monthlyData[currentMonth] - monthlyData[prevMonth]) /
                monthlyData[prevMonth]) *
              100
            : 0;

        setCustomerData({
          total: totalCustomers,
          growthPercentage: Math.round(growth),
          monthlyData,
        });
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "line",
      height: 330,
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    markers: {
      size: 5,
      strokeWidth: 0,
      hover: { size: 7 },
    },
    xaxis: {
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
    },
    yaxis: {
      min: 0,
      labels: {
        formatter: (val) => Math.round(val).toString(),
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val) => `${val} new customers`,
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
    },
  };

  const series = [
    {
      name: "New Customers",
      data: customerData.monthlyData,
    },
  ];

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="h-[330px] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">
            Loading customer data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="px-5 pt-5 pb-6 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Customer Growth
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              New customer acquisition trend
            </p>
          </div>
          <div className="relative inline-block">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View Details
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Export Data
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-semibold text-gray-800 dark:text-white">
              {customerData.total}
              <span
                className={`ml-2 text-sm font-normal flex items-center ${
                  customerData.growthPercentage >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {customerData.growthPercentage >= 0 ? (
                  <ArrowUpIcon className="size-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="size-4 mr-1" />
                )}
                {Math.abs(customerData.growthPercentage)}%
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              vs last month
            </p>
          </div>

          <div className="h-[250px]">
            <Chart
              options={options}
              series={series}
              type="line"
              height="100%"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 border-t border-gray-200 dark:border-gray-800 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Monthly Avg
          </p>
          <p className="text-center text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {Math.round(
              customerData.monthlyData.reduce((a, b) => a + b, 0) / 12
            )}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            This Month
          </p>
          <p className="text-center text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {customerData.monthlyData[new Date().getMonth()]}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Peak Month
          </p>
          <p className="text-center text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {Math.max(...customerData.monthlyData)}
          </p>
        </div>
      </div>
    </div>
  );
}
