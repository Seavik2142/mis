import {
  ClipboardCheck,
  PackagePlus,
  RotateCcw,
  TriangleAlert,
  Warehouse
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Modal from "../components/common/Modal";
import Layout from "../components/layout/Layout";
import ProductTable from "../components/tables/ProductTable";
import {
  adjustInventory,
  getInventoryMovements,
  getLowStockProducts
} from "../services/inventoryService";
import { getProducts } from "../services/productService";
import type { Product, InventoryMovement } from "../types";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

interface AdjustmentForm {
  product_id: string;
  quantity: string;
  note: string;
}

const emptyAdjustment: AdjustmentForm = {
  product_id: "",
  quantity: "",
  note: ""
};

function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [adjustment, setAdjustment] = useState<AdjustmentForm>(emptyAdjustment);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function loadInventory() {
    setIsLoading(true);
    setError("");
    try {
      const [productsData, lowStockData, movementsData] = await Promise.all([
        getProducts(),
        getLowStockProducts(),
        getInventoryMovements(10)
      ]);
      setProducts(productsData);
      setLowStock(lowStockData);
      setMovements(movementsData);
    } catch (requestError: any) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const inventoryStats = useMemo(() => {
    return products.reduce((stats, product) => ({
      units: stats.units + Number(product.stock || 0),
      value: stats.value + Number(product.stock || 0) * Number(product.price || 0)
    }), {
      units: 0,
      value: 0
    });
  }, [products]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      await adjustInventory(Number(adjustment.product_id), {
        quantity: Number(adjustment.quantity),
        note: adjustment.note || ""
      });
      setAdjustment(emptyAdjustment);
      setShowForm(false);
      await loadInventory();
    } catch (requestError: any) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Layout>
      <section className="page">
        <div className="page-header">
          <div>
            <p className="eyebrow">Stock Control</p>
            <h1>Inventory</h1>
            <p className="lede">
              Track stock levels, warehouse value, and inventory movement history.
            </p>
          </div>

          <div className="actions">
            <button className="button" type="button" onClick={loadInventory}>
              <ClipboardCheck aria-hidden="true" size={17} strokeWidth={2.2} />
              Stock Count
            </button>
            <button
              className="button primary"
              type="button"
              onClick={() => setShowForm(true)}
            >
              <PackagePlus aria-hidden="true" size={17} strokeWidth={2.2} />
              Receive Items
            </button>
          </div>
        </div>

        {error && <p className="notice danger">{error}</p>}
        {isLoading && <p className="notice">Loading inventory...</p>}

        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title="Stock Adjustment"
          subtitle="Manually increase or decrease stock levels for a specific product."
        >
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field span-2">
              <label htmlFor="adjust-product">Select Product</label>
              <select
                id="adjust-product"
                value={adjustment.product_id}
                onChange={(event) => setAdjustment({
                  ...adjustment,
                  product_id: event.target.value
                })}
                required
              >
                <option value="">Search or select product...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} — Current stock: {product.stock}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="adjust-quantity">Quantity Change</label>
              <input
                id="adjust-quantity"
                type="number"
                placeholder="e.g. 50 or -10"
                value={adjustment.quantity}
                onChange={(event) => setAdjustment({
                  ...adjustment,
                  quantity: event.target.value
                })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="adjust-note">Reason / Note</label>
              <input
                id="adjust-note"
                value={adjustment.note}
                onChange={(event) => setAdjustment({
                  ...adjustment,
                  note: event.target.value
                })}
                placeholder="Shipment received, damage, etc."
              />
            </div>
            <div className="form-actions" style={{ marginTop: "12px" }}>
              <button className="button primary" type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Apply Adjustment"}
              </button>
              <button
                className="button"
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>

        <div className="dashboard-grid">
          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title-row">
                  <span className="panel-icon">
                    <Warehouse aria-hidden="true" size={18} strokeWidth={2.2} />
                  </span>
                  <h2 className="panel-title">Warehouse Pulse</h2>
                </div>
                <p className="panel-subtitle">Live stock totals from the backend</p>
              </div>
            </div>

            <div className="metric-list">
              <div className="metric-row">
                <div>
                  <strong>Units in Stock</strong>
                  <p>Across active catalog items</p>
                </div>
                <span className="metric-value">{inventoryStats.units}</span>
              </div>
              <div className="metric-row">
                <div>
                  <strong>Inventory Value</strong>
                  <p>Stock multiplied by current price</p>
                </div>
                <span className="metric-value">{money.format(inventoryStats.value)}</span>
              </div>
              <div className="metric-row">
                <div>
                  <strong>Low Stock Items</strong>
                  <p>At or below reorder level</p>
                </div>
                <span className="metric-value">{lowStock.length}</span>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title-row">
                  <span className="panel-icon">
                    <RotateCcw aria-hidden="true" size={18} strokeWidth={2.2} />
                  </span>
                  <h2 className="panel-title">Reorder Queue</h2>
                </div>
                <p className="panel-subtitle">Items that need purchasing attention</p>
              </div>
            </div>

            <div className="insight-list">
              {lowStock.map((product) => (
                <div className="insight-item" key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <p>{product.stock} units left against reorder level {product.reorder_level}.</p>
                  </div>
                  <span className="status danger">
                    <TriangleAlert aria-hidden="true" size={14} strokeWidth={2.3} />
                    Low stock
                  </span>
                </div>
              ))}

              {!lowStock.length && (
                <div className="insight-item">
                  <div>
                    <strong>No reorder pressure</strong>
                    <p>All active products are above reorder levels.</p>
                  </div>
                  <span className="status success">Healthy</span>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Recent Movements</h2>
              <p className="panel-subtitle">Sales, receiving, and manual inventory changes</p>
            </div>
          </div>
          <div className="metric-list">
            {movements.map((movement) => (
              <div className="metric-row" key={movement.id}>
                <div>
                  <strong>{movement.product_name}</strong>
                  <p>{movement.movement_type} · {movement.note || "No note"}</p>
                </div>
                <span className={movement.quantity < 0 ? "status danger" : "status success"}>
                  {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                </span>
              </div>
            ))}
          </div>
        </section>

        <ProductTable products={products} />
      </section>
    </Layout>
  );
}

export default Inventory;
