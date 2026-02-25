import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Edit,
  Filter,
  LogOut,
  Package,
  PlusCircle,
  Send,
  Truck,
  CheckCheck,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";
import { isAdminSession } from "@/lib/supabase/roles";
import { fetchOrders, updateOrderStatus, deleteOrder } from "@/lib/api/orders";
import { fetchAllProducts, upsertProduct, deleteProduct, toggleProductActive } from "@/lib/api/products";
import { OrderFilters, OrderStatus, OrderGroupType, ProductType } from "@/lib/types";

const ORDER_STATUSES: OrderStatus[] = ["new", "confirmed", "shipped", "delivered", "cancelled"];

const emptyProductForm = {
  id: "",
  name: "",
  type: "full" as ProductType["type"],
  price: "",
  image_url: "",
  stock_quantity: "",
  is_active: true,
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderGroupType[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [filters, setFilters] = useState<OrderFilters>({ status: "all" });
  const [orderActionId, setOrderActionId] = useState<string | null>(null);
  const [productActionId, setProductActionId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({ ...emptyProductForm });
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ensureAdmin = async () => {
      const { data } = await supabaseClient.auth.getSession();
      const isAdmin = await isAdminSession(data.session);
      if (!isAdmin) {
        navigate("/admin-login", { replace: true });
      }
    };

    ensureAdmin();
  }, [navigate]);

  const loadOrders = async (appliedFilters = filters) => {
    setOrdersLoading(true);
    try {
      const { data, error: queryError } = await fetchOrders(appliedFilters);
      if (queryError) {
        setError(queryError.message);
      } else {
        setError(null);
        setOrders(data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      setError(message);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadProducts = async () => {
    setProductsLoading(true);
    const { data, error: queryError } = await fetchAllProducts();
    if (queryError) {
      setError(queryError.message);
    } else {
      setError(null);
      setProducts(data);
    }
    setProductsLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.items.reduce((inner, item) => inner + item.total_price, 0),
      0
    );
    const newOrders = orders.filter((order) => order.status === "new").length;
    const delivered = orders.filter((order) => order.status === "delivered").length;

    return {
      totalOrders: orders.length,
      totalRevenue,
      newOrders,
      delivered,
    };
  }, [orders]);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    navigate("/admin-login");
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setOrderActionId(orderId);
    const { error: updateError } = await updateOrderStatus(orderId, status);
    if (updateError) {
      setError(updateError.message);
    } else {
      setToast("Order updated");
      loadOrders();
    }
    setOrderActionId(null);
  };

  const handleDeleteOrder = async (orderId: string) => {
    const confirmed = window.confirm("Delete this order? This cannot be undone.");
    if (!confirmed) return;
    setOrderActionId(orderId);
    const { error: deleteErr } = await deleteOrder(orderId);
    if (deleteErr) {
      setError(deleteErr.message);
    } else {
      setToast("Order deleted");
      loadOrders();
    }
    setOrderActionId(null);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductActionId("form");
    setError(null);

    const price = Number(productForm.price);
    const stock = Number(productForm.stock_quantity);

    if (Number.isNaN(price) || price < 0) {
      setError("Price must be a valid non-negative number.");
      setProductActionId(null);
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a whole number.");
      setProductActionId(null);
      return;
    }

    const { error: upsertError } = await upsertProduct({
      id: productForm.id || undefined,
      name: productForm.name.trim(),
      type: productForm.type,
      price,
      image_url: productForm.image_url.trim() || null,
      stock_quantity: stock,
      is_active: productForm.is_active,
    });

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setToast(formMode === "create" ? "Product added" : "Product updated");
      setProductForm({ ...emptyProductForm });
      setFormMode("create");
      loadProducts();
    }

    setProductActionId(null);
  };

  const handleEditProduct = (product: ProductType) => {
    setFormMode("edit");
    setProductForm({
      id: product.id,
      name: product.name,
      type: product.type,
      price: String(product.price),
      image_url: product.image_url || "",
      stock_quantity: String(product.stock_quantity),
      is_active: product.is_active,
    });
  };

  const handleDeleteProduct = async (id: string) => {
    const confirmed = window.confirm("Delete this product? Related orders will remain.");
    if (!confirmed) return;
    setProductActionId(id);
    const { error: deleteErr } = await deleteProduct(id);
    if (deleteErr) {
      setError(deleteErr.message);
    } else {
      if (productForm.id === id) {
        setProductForm({ ...emptyProductForm });
        setFormMode("create");
      }
      setToast("Product deleted");
      loadProducts();
    }
    setProductActionId(null);
  };

  const handleToggleActive = async (product: ProductType) => {
    setProductActionId(product.id);
    const { error: updateErr } = await toggleProductActive(product.id, !product.is_active);
    if (updateErr) {
      setError(updateErr.message);
    } else {
      setToast("Product updated");
      loadProducts();
    }
    setProductActionId(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] p-6 lg:p-10 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#0F3D3E]/60">Admin Dashboard</p>
          <h1 className="text-3xl text-[#0F3D3E] font-semibold">Operations Overview</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadOrders()}
            className="px-4 py-2 rounded-xl bg-white border border-[#C6A75E]/20 text-[#0F3D3E] flex items-center gap-2 hover:border-[#C6A75E]"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-[#C6A75E] text-white flex items-center gap-2 hover:bg-[#B89650]"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      {toast && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          {toast}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="p-5 bg-white rounded-2xl border border-[#C6A75E]/15 shadow-sm">
          <p className="text-sm text-[#0F3D3E]/60">Total Orders</p>
          <p className="text-3xl text-[#0F3D3E]">{stats.totalOrders}</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-[#C6A75E]/15 shadow-sm">
          <p className="text-sm text-[#0F3D3E]/60">Total Revenue</p>
          <p className="text-3xl text-[#C6A75E]">PKR {stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-[#C6A75E]/15 shadow-sm">
          <p className="text-sm text-[#0F3D3E]/60">New Orders</p>
          <p className="text-3xl text-[#0F3D3E]">{stats.newOrders}</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-[#C6A75E]/15 shadow-sm">
          <p className="text-sm text-[#0F3D3E]/60">Delivered</p>
          <p className="text-3xl text-[#0F3D3E]">{stats.delivered}</p>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-[#C6A75E]/10 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl text-[#0F3D3E] flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Orders</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#C6A75E]/20 bg-[#FAF8F3]">
              <Filter className="w-4 h-4 text-[#C6A75E]" />
              <select
                value={filters.status || "all"}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as OrderFilters["status"] })}
                className="bg-transparent outline-none text-[#0F3D3E]"
              >
                <option value="all">All statuses</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#C6A75E]/20 bg-[#FAF8F3]">
              <Search className="w-4 h-4 text-[#C6A75E]" />
              <input
                placeholder="Search phone"
                value={filters.phone || ""}
                onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                className="bg-transparent outline-none text-[#0F3D3E]"
              />
            </div>
            <input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-3 py-2 rounded-xl border border-[#C6A75E]/20 bg-[#FAF8F3] text-[#0F3D3E]"
            />
            <input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-3 py-2 rounded-xl border border-[#C6A75E]/20 bg-[#FAF8F3] text-[#0F3D3E]"
            />
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="text-[#0F3D3E]/60">
                <th className="py-3">Customer</th>
                <th className="py-3">Phone</th>
                <th className="py-3">City</th>
                <th className="py-3">Product</th>
                <th className="py-3">Qty</th>
                <th className="py-3">Total</th>
                <th className="py-3">Status</th>
                <th className="py-3">Date</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersLoading && (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-[#0F3D3E]/60">
                    Loading orders...
                  </td>
                </tr>
              )}

              {!ordersLoading && orders.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-[#0F3D3E]/60">
                    No orders found.
                  </td>
                </tr>
              )}

              {!ordersLoading && orders.map((order) => (
                <tr key={order.id} className="border-t border-[#C6A75E]/10">
                  <td className="py-3 text-[#0F3D3E]">{order.customer_name}</td>
                  <td className="py-3 text-[#0F3D3E]">{order.phone}</td>
                  <td className="py-3 text-[#0F3D3E]">{order.city}</td>
                  <td className="py-3 text-[#0F3D3E]">{order.product?.name || "-"}</td>
                  <td className="py-3 text-[#0F3D3E]">{order.quantity}</td>
                  <td className="py-3 text-[#0F3D3E]">PKR {order.total_price.toLocaleString()}</td>
                  <td className="py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      disabled={orderActionId === order.id}
                      className="px-2 py-2 rounded-lg border border-[#C6A75E]/30 bg-white text-[#0F3D3E]"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 text-[#0F3D3E]">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => handleStatusChange(order.id, "confirmed")}
                        disabled={orderActionId === order.id || order.status === "confirmed"}
                        className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-50 flex items-center gap-1"
                        title="Mark as confirmed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, "shipped")}
                        disabled={orderActionId === order.id || order.status === "shipped"}
                        className="px-3 py-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 disabled:opacity-50 flex items-center gap-1"
                        title="Mark as shipped"
                      >
                        <Truck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, "delivered")}
                        disabled={orderActionId === order.id || order.status === "delivered"}
                        className="px-3 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-50 flex items-center gap-1"
                        title="Mark as delivered"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, "cancelled")}
                        disabled={orderActionId === order.id || order.status === "cancelled"}
                        className="px-3 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50 flex items-center gap-1"
                        title="Cancel order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        disabled={orderActionId === order.id}
                        className="px-3 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50"
                        title="Delete order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-[#C6A75E]/10 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl text-[#0F3D3E] flex items-center gap-2">
            <Package className="w-4 h-4" /> Product Management
          </h2>
          <button
            onClick={() => {
              setProductForm({ ...emptyProductForm });
              setFormMode("create");
            }}
            className="px-4 py-2 rounded-xl bg-[#C6A75E]/10 text-[#0F3D3E] flex items-center gap-2 hover:bg-[#C6A75E]/20"
          >
            <PlusCircle className="w-4 h-4" /> New Product
          </button>
        </div>

        <form onSubmit={handleProductSubmit} className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-[#0F3D3E]">Name</label>
            <input
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-[#C6A75E]/20 focus:border-[#C6A75E] bg-[#FAF8F3] text-[#0F3D3E]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[#0F3D3E]">Type</label>
            <select
              value={productForm.type}
              onChange={(e) => setProductForm({ ...productForm, type: e.target.value as ProductType["type"] })}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#C6A75E]/20 focus:border-[#C6A75E] bg-[#FAF8F3] text-[#0F3D3E]"
            >
              <option value="full">Full Quran</option>
              <option value="para">Para</option>
              <option value="surah">Surah</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[#0F3D3E]">Price (PKR)</label>
            <input
              type="number"
              min="0"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-[#C6A75E]/20 focus:border-[#C6A75E] bg-[#FAF8F3] text-[#0F3D3E]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[#0F3D3E]">Stock Quantity</label>
            <input
              type="number"
              min="0"
              value={productForm.stock_quantity}
              onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-[#C6A75E]/20 focus:border-[#C6A75E] bg-[#FAF8F3] text-[#0F3D3E]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[#0F3D3E]">Image URL</label>
            <input
              value={productForm.image_url}
              onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#C6A75E]/20 focus:border-[#C6A75E] bg-[#FAF8F3] text-[#0F3D3E]"
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-2 pt-7">
            <input
              id="is_active"
              type="checkbox"
              checked={productForm.is_active}
              onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
              className="w-4 h-4 accent-[#C6A75E]"
            />
            <label htmlFor="is_active" className="text-[#0F3D3E]">Active</label>
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={productActionId === "form"}
              className="px-5 py-3 rounded-xl bg-[#C6A75E] text-white hover:bg-[#B89650] transition-colors disabled:opacity-60"
            >
              {formMode === "create" ? "Add Product" : "Update Product"}
            </button>
            {formMode === "edit" && (
              <button
                type="button"
                onClick={() => {
                  setProductForm({ ...emptyProductForm });
                  setFormMode("create");
                }}
                className="px-5 py-3 rounded-xl bg-white border border-[#C6A75E]/30 text-[#0F3D3E] hover:border-[#C6A75E]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="overflow-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="text-[#0F3D3E]/60">
                <th className="py-3">Name</th>
                <th className="py-3">Type</th>
                <th className="py-3">Price</th>
                <th className="py-3">Stock</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsLoading && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#0F3D3E]/60">
                    Loading products...
                  </td>
                </tr>
              )}

              {!productsLoading && products.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#0F3D3E]/60">
                    No products yet. Add one above.
                  </td>
                </tr>
              )}

              {!productsLoading && products.map((product) => (
                <tr key={product.id} className="border-t border-[#C6A75E]/10">
                  <td className="py-3 text-[#0F3D3E]">{product.name}</td>
                  <td className="py-3 text-[#0F3D3E]">{product.type}</td>
                  <td className="py-3 text-[#0F3D3E]">PKR {product.price.toLocaleString()}</td>
                  <td className="py-3 text-[#0F3D3E]">{product.stock_quantity}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${product.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      onClick={() => handleToggleActive(product)}
                      disabled={productActionId === product.id}
                      className="px-3 py-2 rounded-lg bg-white border border-[#C6A75E]/30 text-[#0F3D3E] hover:border-[#C6A75E] disabled:opacity-50"
                    >
                      {product.is_active ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="px-3 py-2 rounded-lg bg-[#C6A75E]/10 text-[#0F3D3E] border border-[#C6A75E]/20 hover:border-[#C6A75E]"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={productActionId === product.id}
                      className="px-3 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
