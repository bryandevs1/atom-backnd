import { useEffect, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine } from "../../icons";
import Badge from "../ui/badge/Badge";
import { useAuth } from "../../context/AuthContext";

export default function VendorMetrics() {
  const { token } = useAuth();
  const { user } = useAuth();
  const [vendorStats, setVendorStats] = useState({}); // Initialize as empty object
  const { vendorId } = user;

  const fetchVendorStats = async () => {
    console.log("Fetching vendor stats for vendorId:", vendorId);
    try {
      const response = await fetch(
        `https://nexodus.tech/api/vendor/analytics?vendor_id=${vendorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();
      setVendorStats(data.data);
      console.log("Vendor stats fetched successfully:", data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchVendorStats();
  }, []);

  const calculateChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Helper function to safely parse currency strings
  const parseCurrency = (value) => {
    if (!value) return 0;
    return parseFloat(value.replace(/[^0-9.-]+/g, ""));
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Orders Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Orders
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {vendorStats.all_time?.total_orders ?? "Loading..."}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Last 7 days: {vendorStats.last_7_days?.orders_last_7_days ?? "0"}
            </p>
          </div>
          <Badge
            color={
              calculateChange(
                vendorStats.last_7_days?.orders_last_7_days || 0,
                (vendorStats.all_time?.total_orders || 0) / 4
              ) >= 0
                ? "success"
                : "error"
            }
          >
            {calculateChange(
              vendorStats.last_7_days?.orders_last_7_days || 0,
              (vendorStats.all_time?.total_orders || 0) / 4
            ) >= 0 ? (
              <ArrowUpIcon />
            ) : (
              <ArrowDownIcon />
            )}
            {Math.abs(
              calculateChange(
                vendorStats.last_7_days?.orders_last_7_days || 0,
                (vendorStats.all_time?.total_orders || 0) / 4
              )
            ).toFixed(2)}
            %
          </Badge>
        </div>
      </div>

      {/* Revenue Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Revenue
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {vendorStats.all_time
                ? `$${parseCurrency(vendorStats.all_time.total_revenue).toFixed(
                    2
                  )}`
                : "Loading..."}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Last 7 days: $
              {vendorStats.last_7_days
                ? parseCurrency(
                    vendorStats.last_7_days.revenue_last_7_days
                  ).toFixed(2)
                : "0.00"}
            </p>
          </div>
          <Badge
            color={
              calculateChange(
                parseCurrency(vendorStats.last_7_days?.revenue_last_7_days) ||
                  0,
                parseCurrency(vendorStats.all_time?.total_revenue || "0") / 4
              ) >= 0
                ? "success"
                : "error"
            }
          >
            {calculateChange(
              parseCurrency(vendorStats.last_7_days?.revenue_last_7_days) || 0,
              parseCurrency(vendorStats.all_time?.total_revenue || "0") / 4
            ) >= 0 ? (
              <ArrowUpIcon />
            ) : (
              <ArrowDownIcon />
            )}
            {Math.abs(
              calculateChange(
                parseCurrency(vendorStats.last_7_days?.revenue_last_7_days) ||
                  0,
                parseCurrency(vendorStats.all_time?.total_revenue || "0") / 4
              )
            ).toFixed(2)}
            %
          </Badge>
        </div>
      </div>
    </div>
  );
}
