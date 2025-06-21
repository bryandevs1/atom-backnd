import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import Button from "../../ui/button/Button";

// Define the TypeScript interface for orders
interface OrderItem {
  order_item_id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  price: string;
  total_price: string;
  image?: string;
}

interface Order {
  order_id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: "pending" | "completed" | "cancelled" | "refunded";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  total_amount: string;
  created_at: string;
  items: OrderItem[];
}

interface Pagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    pages: 1,
    limit: 5,
  });
  const { token } = useAuth();

  const fetchOrders = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://nexodus.tech/api/vendor/orders",
        {
          params: {
            limit: pagination.limit,
            page: page,
            sortBy: "created_at",
            sortOrder: "desc",
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle different response formats
      if (response.data.data && response.data.pagination) {
        // Case: Standard response with pagination
        setOrders(response.data.data);
        setPagination(response.data.pagination);
      } else if (Array.isArray(response.data.data)) {
        // Case: Direct array of orders (fallback)
        setOrders(response.data.data);
        setPagination({
          ...pagination,
          page: 1,
          total: response.data.data.length,
          pages: Math.ceil(response.data.data.length / pagination.limit),
        });
      } else if (response.data.data?.orders) {
        // Case: Object with orders property (fallback)
        setOrders(response.data.data.orders);
        setPagination({
          ...pagination,
          page: 1,
          total: response.data.data.orders.length,
          pages: Math.ceil(response.data.data.orders.length / pagination.limit),
        });
      } else {
        console.error("Unexpected API response format:", response.data);
        setError("Unexpected data format received from server");
        setOrders([]);
      }
    } catch (err) {
      setError("Failed to fetch orders");
      console.error("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.pages) {
      fetchOrders(page);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getPaymentStatusBadgeColor = (paymentStatus: string) => {
    switch (paymentStatus.toLowerCase()) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (orders.length === 0) {
    return <div>No orders found</div>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Order #
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Customer
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Date
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Items
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Total
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {orders.flatMap((order) =>
              order.items.map((item, itemIndex) => (
                <TableRow key={`${order.order_id}-${itemIndex}`} className="">
                  {/* Order Number (same for all items in this order) */}
                  <TableCell className="py-3">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      #{order.order_number}
                    </p>
                  </TableCell>

                  {/* Customer Info (same for all items) */}
                  <TableCell className="py-3">
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {order.customer_name}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {order.customer_email}
                      </span>
                    </div>
                  </TableCell>

                  {/* Date (same for all items) */}
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>

                  {/* Item Details (unique per item) */}
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.product_name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <span>Qty: {item.quantity}</span>
                        <span>${item.price}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Total for this item */}
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    ${item.total_price}
                  </TableCell>

                  {/* Order Status */}
                  <TableCell className="py-3">
                    <Badge color={getStatusBadgeColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-white/[0.05]">
        <div className="flex items-center justify-between">
          {/* Previous Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.58301 9.99868C2.58272 10.1909 2.65588 10.3833 2.80249 10.53L7.79915 15.5301C8.09194 15.8231 8.56682 15.8233 8.85981 15.5305C9.15281 15.2377 9.15297 14.7629 8.86018 14.4699L5.14009 10.7472L16.6675 10.7472C17.0817 10.7472 17.4175 10.4114 17.4175 10.0001C17.4175 9.58294 17.0817 9.24715 16.6675 9.24715L5.14554 9.24715L8.86017 5.53016C9.15297 5.23717 9.15282 4.7623 8.85983 4.4695C8.56684 4.1767 8.09197 4.17685 7.79917 4.46984L2.84167 9.43049C2.68321 9.568 2.58301 9.77087 2.58301 10.0001C2.58301 9.99766 2.58301 9.99817 2.58301 9.99868Z"
                fill=""
              />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </Button>
          {/* Page Info */}
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 sm:hidden">
            Page {pagination.page} of {pagination.pages}
          </span>
          {/* Page Numbers */}
          <ul className="hidden items-center gap-0.5 sm:flex">
            {Array.from({ length: pagination.pages }).map((_, idx) => (
              <li key={idx}>
                <button
                  onClick={() => goToPage(idx + 1)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-theme-sm font-medium ${
                    pagination.page === idx + 1
                      ? "bg-brand-500 text-white"
                      : "text-gray-700 hover:bg-brand-500/[0.08] dark:hover:bg-brand-500 dark:hover:text-white hover:text-brand-500 dark:text-gray-400 "
                  }`}
                >
                  {idx + 1}
                </button>
              </li>
            ))}
          </ul>
          {/* Next Button */}
          <Button
            onClick={() => goToPage(pagination.page + 1)}
            size="sm"
            variant="outline"
            disabled={pagination.page === pagination.pages}
          >
            <span className="hidden sm:inline">Next</span>
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M17.4175 9.9986C17.4178 10.1909 17.3446 10.3832 17.198 10.53L12.2013 15.5301C11.9085 15.8231 11.4337 15.8233 11.1407 15.5305C10.8477 15.2377 10.8475 14.7629 11.1403 14.4699L14.8604 10.7472L3.33301 10.7472C2.91879 10.7472 2.58301 10.4114 2.58301 9.99715C2.58301 9.58294 2.91879 9.24715 3.33301 9.24715L14.8549 9.24715L11.1403 5.53016C10.8475 5.23717 10.8477 4.7623 11.1407 4.4695C11.4336 4.1767 11.9085 4.17685 12.2013 4.46984L17.1588 9.43049C17.3173 9.568 17.4175 9.77087 17.4175 9.99715C17.4175 9.99763 17.4175 9.99812 17.4175 9.9986Z"
                fill=""
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}