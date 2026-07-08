import {
  PackageCheck,
  Plus,
  Printer,
  ShoppingCart,
  Trash2,
  TriangleAlert,
  Truck
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Modal from "../components/common/Modal";
import StatsCard from "../components/cards/StatsCard";
import Layout from "../components/layout/Layout";
import OrderTable from "../components/tables/OrderTable";
import { getCustomers } from "../services/customerService";
import {
  createOrder,
  getOrders,
  updateOrderStatus
} from "../services/orderService";
import { getProducts } from "../services/productService";
import type { Customer, Order, Product } from "../types";

interface OrderLineItemForm {
  product_id: string;
  quantity: number | string;
}

interface OrderForm {
  customer_id: string;
  channel: string;
  items: OrderLineItemForm[];
}

const emptyOrder: OrderForm = {
  customer_id: "",
  channel: "Online Store",
  items: [
    {
      product_id: "",
      quantity: 1
    }
  ]
};

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<OrderForm>(emptyOrder);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function loadOrders() {
    setIsLoading(true);
    setError("");
    try {
      const [ordersData, customersData, productsData] = await Promise.all([
        getOrders(),
        getCustomers(),
        getProducts()
      ]);
      setOrders(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (requestError: any) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const stats = useMemo(() => {
    return {
      open: orders.filter((order) => !["Completed", "Cancelled"].includes(order.status)).length,
      shipped: orders.filter((order) => order.status === "Shipped").length,
      packed: orders.filter((order) => order.status === "Packed").length,
      delayed: orders.filter((order) => order.status === "Delayed").length
    };
  }, [orders]);

  function updateItem(index: number, field: string, value: any) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      ))
    }));
  }

  function addItem() {
    setForm((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          product_id: "",
          quantity: 1
        }
      ]
    }));
  }

  function removeItem(index: number) {
    setForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      await createOrder({
        customer_id: Number(form.customer_id),
        channel: form.channel,
        items: form.items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity)
        }))
      });
      setForm(emptyOrder);
      setShowForm(false);
      await loadOrders();
    } catch (requestError: any) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusChange(order: Order, status: string) {
    if (status === order.status) {
      return;
    }

    setError("");
    try {
      await updateOrderStatus(order.id, status);
      await loadOrders();
    } catch (requestError: any) {
      setError(requestError.message);
      await loadOrders();
    }
  }

  return (
    <Layout>
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Create New Order"
        subtitle="Orders reserve stock immediately and update inventory movements."
        variant="large"
      >
        <form className="order-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="order-customer">Customer Account</label>
              <select
                id="order-customer"
                value={form.customer_id}
                onChange={(event) => setForm({ ...form, customer_id: event.target.value })}
                required
              >
                <option value="">Select a customer...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.company ? `(${customer.company})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="order-channel">Sales Channel</label>
              <select
                id="order-channel"
                value={form.channel}
                onChange={(event) => setForm({ ...form, channel: event.target.value })}
              >
                <option>Online Store</option>
                <option>Retail Desk</option>
                <option>Wholesale</option>
                <option>Direct Sales</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: "24px" }}>
            <h3 style={{ marginBottom: "12px", fontSize: "14px" }}>Order Line Items</h3>
            <div className="line-items">
              {form.items.map((item, index) => (
                <div className="line-item" key={`${index}-${item.product_id}`}>
                  <div className="field">
                    <label htmlFor={`product-${index}`}>Product</label>
                    <select
                      id={`product-${index}`}
                      value={item.product_id}
                      onChange={(event) => updateItem(index, "product_id", event.target.value)}
                      required
                    >
                      <option value="">Choose product...</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} — {product.stock} in stock
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor={`quantity-${index}`}>Qty</label>
                    <input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) => updateItem(index, "quantity", event.target.value)}
                      required
                    />
                  </div>
                  <button
                    className="icon-button danger"
                    type="button"
                    aria-label="Remove item"
                    onClick={() => removeItem(index)}
                    disabled={form.items.length === 1}
                  >
                    <Trash2 aria-hidden="true" size={17} strokeWidth={2.2} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions split" style={{ marginTop: "24px" }}>
            <button className="button" type="button" onClick={addItem}>
              <Plus aria-hidden="true" size={17} strokeWidth={2.2} />
              Add Another Item
            </button>
            <div className="actions">
              <button className="button primary" type="submit" disabled={isSaving}>
                {isSaving ? "Creating..." : "Place Order"}
              </button>
              <button
                className="button"
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <section className="page">
        <div className="page-header">
          <div>
            <p className="eyebrow">Fulfillment Center</p>
            <h1>Orders</h1>
            <p className="lede">
              Manage incoming orders, track fulfillment status, and process shipments.
            </p>
          </div>

          <div className="actions">
            <button className="button" type="button" onClick={() => window.print()}>
              <Printer aria-hidden="true" size={17} strokeWidth={2.2} />
              Print Pick List
            </button>
            <button
              className="button primary"
              type="button"
              onClick={() => setShowForm(true)}
            >
              <Plus aria-hidden="true" size={17} strokeWidth={2.2} />
              Create Order
            </button>
          </div>
        </div>

        {error && <p className="notice danger">{error}</p>}
        {isLoading && <p className="notice">Loading orders...</p>}

        <div className="kpi-grid">
          <StatsCard
            title="Open Orders"
            value={stats.open}
            detail={`${orders.length} total`}
            tone="#2563eb"
            Icon={ShoppingCart}
          />
          <StatsCard
            title="Shipped"
            value={stats.shipped}
            detail="in transit"
            tone="#0f766e"
            Icon={Truck}
          />
          <StatsCard
            title="Packed"
            value={stats.packed}
            detail="ready"
            tone="#b45309"
            trend={stats.packed ? "risk" : "stable"}
            Icon={PackageCheck}
          />
          <StatsCard
            title="Delayed"
            value={stats.delayed}
            detail="review"
            tone="#dc2626"
            trend={stats.delayed ? "risk" : "stable"}
            Icon={TriangleAlert}
          />
        </div>

        <OrderTable orders={orders} onStatusChange={handleStatusChange} />
      </section>
    </Layout>
  );
}

export default Orders;
