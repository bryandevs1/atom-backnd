"use client";
import { useState, useEffect } from "react";
import Badge from "../../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Button from "../../ui/button/Button";
import DropdownMenu from "./DropDownMenu.jsx";
import { useAuth } from "../../../context/AuthContext.js";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Alert from "../../ui/alert/Alert.js";
import axios from "axios";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  thumbnail_url: string;
  created_at: string;
  categories: string;
  vendor_name: string;
  is_published: boolean;
  is_active: boolean;
  average_rating: number | null;
  reviews_count: number;
}

export default function VendorProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorAdding, setErrorrAdding] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'published', 'draft'
  const itemsPerPage = 5;
  const { token } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();
  const { isDeleteOpen, openDeleteModal, closeDeleteModal } = useModal();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [sku, setSku] = useState("");
  const [category_id, setCategoryId] = useState("");
  const [vendor_id, setVendorId] = useState("");

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  // Add these to your existing state
  const [compare_at_price, setCompareAtPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [preview_url, setPreviewUrl] = useState("");
  // Thumbnail state
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [thumbnailProgress, setThumbnailProgress] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  interface Category {
    id: string;
    name: string;
  }

  // Add this to your component
  const [categories, setCategories] = useState<any[]>([]); // or useState<CategoryType[]>([]) if typed

  // Add this useEffect to fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://nexodus.tech/api/category", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        setCategories(data); // Adjust based on your API response structure
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, [token]);
  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const validateImage = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      throw new Error("Only JPG, PNG, and WebP images are allowed");
    }

    if (file.size > maxSize) {
      throw new Error("Image must be smaller than 2MB");
    }

    return true;
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        validateImage(file);
        setThumbnail(file);
        setThumbnailPreview(URL.createObjectURL(file));
        setThumbnailProgress(0);
        setThumbnailUrl("");
        setErrorrAdding("");
      } catch (err) {
        setErrorrAdding(
          err instanceof Error ? err.message : "Validation failed"
        );
        if (e.target) {
          e.target.value = ""; // Clear the file input
        }
      }
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files[0];
    const maxSize = 2000 * 1024 * 1024; // 100MB
    console.log("Selected file type:", selectedFile.type);

    const allowedTypes = [
      "application/pdf",
      "audio/mp3",
      "video/mp4",
      "application/zip",
      "application/x-zip-compressed", // <- ADD THIS
    ];

    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();

    if (!allowedTypes.includes(selectedFile.type) && fileExtension !== "zip") {
      setErrorrAdding("Unsupported file type");
      return;
    }

    if (selectedFile.size > maxSize) {
      setErrorrAdding("File size exceeds 2GB limit");
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorrAdding("Unsupported file type");
      return;
    }

    setFile(selectedFile);
    setFileUrl("");
    setUploadProgress(0);
    setErrorrAdding("");
  };

  const uploadFile = async (file, type = "product") => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("originalFileName", file.name);

      // Use fetch API instead of XMLHttpRequest for cleaner code
      const response = await fetch("https://nexodus.tech/api/product/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let the browser set it with boundary
        },
        body: formData,
        // Add signal for potential abort controller if needed
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      return await response.json();
    } catch (err) {
      console.error("Upload error:", err);
      throw err;
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorrAdding("");

    // Validate required fields
    if (!name || !price || !category_id || !file) {
      setErrorrAdding("Please fill all required fields");
      return;
    }

    // Validate price is a positive number
    if (isNaN(price) || parseFloat(price) <= 0) {
      setErrorrAdding("Price must be a positive number");
      return;
    }

    // Validate compare price if provided
    if (
      compare_at_price &&
      (isNaN(compare_at_price) ||
        parseFloat(compare_at_price) <= parseFloat(price))
    ) {
      setErrorrAdding("Compare price must be greater than regular price");
      return;
    }

    // File size validation (100MB limit)
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setErrorrAdding("File size exceeds 100MB limit");
      return;
    }

    try {
      setIsUploading(true);

      // Upload files in parallel
      const uploadPromises = [uploadFile(file, "product")];

      if (thumbnail) {
        uploadPromises.push(uploadFile(thumbnail, "thumbnail"));
      }

      const [fileUpload, thumbnailUpload] = await Promise.all(uploadPromises);

      // Prepare product data
      const productData = {
        name,
        description,
        price: parseFloat(price),
        compare_at_price: compare_at_price
          ? parseFloat(compare_at_price)
          : null,
        sku: sku || null,
        category_id,
        vendor_id: vendor_id || undefined,
        file_key: fileUpload.key,
        original_file_name: file.name,
        file_size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        file_type: file.type || file.name.split(".").pop(),
        duration: duration || null,
        preview_url: preview_url || null,
        thumbnail_url: thumbnailUpload?.url || null,
      };

      // Submit product data
      setLoading(true);
      const response = await fetch("https://nexodus.tech/api/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add product");
      }

      const data = await response.json();
      closeModal();
      resetForm();
      Alert("Product added successfully!");
    } catch (err) {
      console.error("Error:", err);
      setErrorrAdding(err.message || "Failed to add product");

      // Log detailed error if available
      if (err.response) {
        console.error("Server response:", await err.response.json());
      }
    } finally {
      setIsUploading(false);
      setLoading(false);
    }
  };

  // Helper function to reset form
  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCompareAtPrice("");
    setSku("");
    setCategoryId("");
    setDuration("");
    setPreviewUrl("");
    setFile(null);
    setThumbnail(null);
    setThumbnailPreview("");
    setThumbnailUrl("");
    setFileUrl("");
  };

  const handleClose = () => {
    resetForm();
    closeModal();
  };
  const handleDeleteClose = () => {
    resetForm();
    closeDeleteModal();
    setErrorrAdding("");
  };
  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://nexodus.tech/api/vendor/products?limit=${itemsPerPage}&offset=${
          (currentPage - 1) * itemsPerPage
        }${searchTerm ? `&search=${searchTerm}` : ""}${
          statusFilter !== "all" ? `&status=${statusFilter}` : ""
        }`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data.data.products);
      setTotalItems(data.data.pagination.total);
      console.log("Fetched products:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, statusFilter]);

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [status, setStatus] = useState("pending");
  const [reviewNotes, setReviewNotes] = useState("");

  const openModalForProduct = (id, currentStatus) => {
    setSelectedProductId(id);
    setStatus(currentStatus ? "published" : "draft");
    openModal();
  };
  const openModalForDeletion = (id) => {
    setSelectedProductId(id);
    openDeleteModal(); // Call the OPEN function, not the state check
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getStatusColor = (isPublished: boolean) => {
    return isPublished ? "success" : "warning";
  };

  const getStatusText = (isPublished: boolean, isActive: boolean) => {
    if (isPublished && isActive) return "Published";
    if (!isPublished && isActive) return "Draft";
    return "Inactive";
  };

  if (loading) {
    return <div className="p-6 text-center">Loading products...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  const handleDelete = async () => {
    try {
      console.log("Attempting to delete product:", selectedProductId); // Debug log

      const response = await axios.delete(
        `https://nexodus.tech/api/product/${selectedProductId}`, // Note plural 'products'
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Delete response:", response); // Debug log

      if (response.data.success) {
        fetchProducts();
        // Add success feedback
        setErrorrAdding(""); // Clear any previous errors
      }
    } catch (error) {
      console.error("Delete error:", error); // More detailed error logging

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to delete product";

      setErrorrAdding(errorMessage);
      console.error("Error details:", error.response?.data); // Log full error response
    }
  };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white pt-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex flex-col gap-2 px-5 mb-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            My Products
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your products, update status, and view details.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={() => openModalForProduct(null, false)}
            className="w-full sm:w-auto"
          >
            Add New Product
          </Button>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="dark:bg-dark-900 h-[42px] rounded-lg border border-gray-300 bg-transparent py-2.5 px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="all">All Products</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setCurrentPage(1);
            }}
          >
            <div className="relative">
              <button
                type="submit"
                className="absolute -translate-y-1/2 left-4 top-1/2"
              >
                <svg
                  className="fill-gray-500 dark:fill-gray-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z"
                    fill=""
                  />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Search products..."
                className="dark:bg-dark-900 h-[42px] w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-[42px] pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="max-w-full px-5 overflow-x-auto sm:px-6">
          <Table>
            <TableHeader className="border-gray-100 border-y dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Product
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Created
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Price
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Categories
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Rating
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {products.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No products found
                  </TableCell>
                </TableRow>
              )}
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8">
                        {product.thumbnail_url ? (
                          <img
                            width={32}
                            height={32}
                            src={product.thumbnail_url}
                            className="size-8 rounded object-cover"
                            alt={product.name}
                          />
                        ) : (
                          <div className="size-8 rounded bg-gray-200 flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                          {product.name}
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          {product.description?.substring(0, 30) +
                            (product.description?.length > 30 ? "..." : "") ||
                            "No description"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400">
                    {formatDate(product.created_at)}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                    {formatPrice(product.price)}
                    {product.compare_at_price && (
                      <span className="ml-2 text-xs line-through text-gray-400">
                        {formatPrice(product.compare_at_price)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                    {product.categories || "Uncategorized"}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={getStatusColor(
                        product.is_published && product.is_active
                      )}
                    >
                      {getStatusText(product.is_published, product.is_active)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                    {product.average_rating
                      ? `${product.average_rating.toFixed(1)} (${
                          product.reviews_count
                        })`
                      : "No ratings"}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                    <Button onClick={() => openModalForDeletion(product.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls - same as before */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-white/[0.05]">
        <div className="flex items-center justify-between">
          {/* Previous Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
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
            Page {currentPage} of {totalPages}
          </span>
          {/* Page Numbers */}
          <ul className="hidden items-center gap-0.5 sm:flex">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <li key={idx}>
                <button
                  onClick={() => goToPage(idx + 1)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-theme-sm font-medium ${
                    currentPage === idx + 1
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
            onClick={() => goToPage(currentPage + 1)}
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
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

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        className="max-w-[884px] ml-2.5 mt-[600px] pb-[100px] p-5 lg:p-10"
      >
        <form onSubmit={handleSave} className="">
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            Add New Digital Product
          </h4>

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            {/* Basic Information */}
            <div className="col-span-1 sm:col-span-2">
              <Label>Product Name *</Label>
              <Input
                type="text"
                placeholder="Enter product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <Label>Description</Label>
              <textarea
                className="w-full border rounded p-2 min-h-[100px] dark:bg-gray-800 dark:border-gray-700"
                placeholder="Product description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="col-span-1">
              <Label>Price *</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="col-span-1">
              <Label>Compare At Price</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={compare_at_price}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="col-span-1">
              <Label>SKU</Label>
              <Input
                type="text"
                placeholder="Product SKU"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>

            <div className="col-span-1">
              <Label>Duration (optional)</Label>
              <Input
                type="text"
                placeholder="e.g., 30min, 1h"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="col-span-1 sm:col-span-2">
              <Label>Category *</Label>
              <select
                value={category_id}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-700"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Thumbnail Upload */}
            <div className="col-span-1 sm:col-span-2">
              <Label>Product Thumbnail</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className={`focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400`}
              />
              {thumbnailPreview && (
                <div className="mt-2">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="h-20 object-cover rounded"
                  />
                </div>
              )}
              {thumbnailProgress > 0 && thumbnailProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${thumbnailProgress}%` }}
                  ></div>
                </div>
              )}
            </div>

            {/* Preview URL */}
            <div className="col-span-1 sm:col-span-2">
              <Label>Preview URL</Label>
              <Input
                type="url"
                placeholder="https://example.com/preview"
                value={preview_url}
                onChange={(e) => setPreviewUrl(e.target.value)}
              />
            </div>

            {/* Digital File Upload */}
            <div className="col-span-1 sm:col-span-2">
              <Label>Digital File *</Label>
              <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                Supported formats: PDF, MP3, MP4, ZIP (Max 100MB)
              </div>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-700"
                required
                accept=".pdf,.mp3,.mp4,.zip"
              />
              {file && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <p>Selected: {file.name}</p>
                  <p>Type: {file.type || "Unknown"}</p>
                  <p>Size: {(file.size / (1024 * 1024)).toFixed(2)}MB</p>
                </div>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {errorAdding && (
            <p className="mt-2 text-red-500 dark:text-red-400">{errorAdding}</p>
          )}

          <div className="flex items-center justify-end w-full gap-3 mt-6">
            <Button size="sm" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={loading || isUploading}>
              {loading
                ? "Saving..."
                : isUploading
                ? "Uploading..."
                : "Add Product"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        className="max-w-[884px] ml-2.5 mt-[6px] pb-[100px] p-5 lg:p-10"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDelete();
          }}
          className=""
        >
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            Are you sure you want to delete this product?
          </h4>

          {errorAdding && (
            <p className="mt-2 text-red-500 dark:text-red-400">{errorAdding}</p>
          )}

          <div className="flex items-center justify-end w-full gap-3 mt-6">
            <Button size="sm" variant="outline" onClick={handleDeleteClose}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={loading}>
              {loading ? "Deleting..." : "Delete Product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
