import {
  ClipboardCheck,
  PackagePlus,
  RotateCcw,
  TriangleAlert,
  Warehouse
} from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
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
import { formatMoney } from "../utils/format";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (adjustment.product_id && !adjustment.quantity) {
      setAdjustment((prev) => ({ ...prev, quantity: "1" }));
    }
  }, [adjustment.product_id]);

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

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.product_code && p.product_code.toLowerCase().includes(query))
    );
  }, [products, searchQuery]);

  const selectedProduct = useMemo(() => {
    return products.find((p) => String(p.id) === adjustment.product_id);
  }, [products, adjustment.product_id]);

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
      setSearchQuery("");
      await loadInventory();
    } catch (requestError: any) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Layout>
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setAdjustment(emptyAdjustment);
          setSearchQuery("");
        }}
        title="Receive & Adjust Items"
        subtitle="Increase or decrease stock levels with live calculations and quick presets."
        variant="small"
      >
        <form className="form-compact" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="adjust-product">Select Product</label>
            
            {!selectedProduct ? (
              <div className="autocomplete-container" ref={dropdownRef}>
                <input
                  id="adjust-product"
                  type="text"
                  placeholder="Search by product name, SKU, or code..."
                  value={searchQuery}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required={!adjustment.product_id}
                  autoComplete="off"
                />
                {showDropdown && (
                  <div className="autocomplete-dropdown">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="autocomplete-item"
                          onClick={() => {
                            setAdjustment({
                              ...adjustment,
                              product_id: String(product.id)
                            });
                            setShowDropdown(false);
                            setSearchQuery("");
                          }}
                        >
                          <div>
                            <div className="autocomplete-item-name">{product.name}</div>
                            <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                              SKU: {product.sku || "N/A"} · {product.category || "General"}
                            </div>
                          </div>
                          <span className="autocomplete-item-stock">
                            Stock: {product.stock}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "12px", textAlign: "center", color: "var(--muted)" }}>
                        No matching products found
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="product-preview-card">
                <div className="preview-info">
                  <span className="preview-title">{selectedProduct.name}</span>
                  <div className="preview-meta">
                    <span>SKU: {selectedProduct.sku || "N/A"}</span>
                    <span>·</span>
                    <span>Category: {selectedProduct.category || "General"}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className={`preview-stock-badge ${Number(selectedProduct.stock) <= Number(selectedProduct.reorder_level) ? "low" : "good"}`}>
                    Qty: {selectedProduct.stock}
                  </span>
                  <button
                    type="button"
                    className="preset-pill"
                    style={{ margin: 0, padding: "4px 8px" }}
                    onClick={() => {
                      setAdjustment({
                        ...adjustment,
                        product_id: ""
                      });
                    }}
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="field">
            <label htmlFor="adjust-quantity">Quantity Change</label>
            <div className="qty-control-wrapper">
              <button
                type="button"
                className="qty-step-btn"
                onClick={() => {
                  const currentVal = Number(adjustment.quantity) || 0;
                  setAdjustment({
                    ...adjustment,
                    quantity: String(currentVal - 1)
                  });
                }}
                disabled={!selectedProduct}
              >
                -1
              </button>
              <input
                id="adjust-quantity"
                type="number"
                placeholder="e.g. 50 or -10"
                value={adjustment.quantity}
                onChange={(event) => setAdjustment({
                  ...adjustment,
                  quantity: event.target.value
                })}
                disabled={!selectedProduct}
                required
                style={{ textAlign: "center" }}
              />
              <button
                type="button"
                className="qty-step-btn"
                onClick={() => {
                  const currentVal = Number(adjustment.quantity) || 0;
                  setAdjustment({
                    ...adjustment,
                    quantity: String(currentVal + 1)
                  });
                }}
                disabled={!selectedProduct}
              >
                +1
              </button>
            </div>
            {selectedProduct && (
              <div className="preset-container" style={{ justifyContent: "center" }}>
                <button
                  type="button"
                  className="preset-pill"
                  onClick={() => {
                    const currentVal = Number(adjustment.quantity) || 0;
                    setAdjustment({ ...adjustment, quantity: String(currentVal + 10) });
                  }}
                >
                  +10
                </button>
                <button
                  type="button"
                  className="preset-pill"
                  onClick={() => {
                    const currentVal = Number(adjustment.quantity) || 0;
                    setAdjustment({ ...adjustment, quantity: String(currentVal + 50) });
                  }}
                >
                  +50
                </button>
                <button
                  type="button"
                  className="preset-pill"
                  onClick={() => {
                    const currentVal = Number(adjustment.quantity) || 0;
                    setAdjustment({ ...adjustment, quantity: String(currentVal - 10) });
                  }}
                >
                  -10
                </button>
              </div>
            )}
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
              placeholder="Select preset or write custom note..."
              disabled={!selectedProduct}
            />
            {selectedProduct && (
              <div className="preset-container">
                <button
                  type="button"
                  className="preset-pill"
                  onClick={() => setAdjustment({
                    ...adjustment,
                    note: "Restock Shipment Received",
                    quantity: adjustment.quantity || "10"
                  })}
                >
                  Restock
                </button>
                <button
                  type="button"
                  className="preset-pill"
                  onClick={() => setAdjustment({
                    ...adjustment,
                    note: "Customer Return to Stock",
                    quantity: adjustment.quantity || "1"
                  })}
                >
                  Return
                </button>
                <button
                  type="button"
                  className="preset-pill"
                  onClick={() => setAdjustment({
                    ...adjustment,
                    note: "Damaged / Disposed Item",
                    quantity: "-1"
                  })}
                >
                  Damaged
                </button>
                <button
                  type="button"
                  className="preset-pill"
                  onClick={() => setAdjustment({
                    ...adjustment,
                    note: "Audit Stock Count Adjustment"
                  })}
                >
                  Audit
                </button>
              </div>
            )}
          </div>

          {selectedProduct && adjustment.quantity && Number(adjustment.quantity) !== 0 && (
            <div className="stock-calculator-preview">
              <span>Calculated Stock:</span>
              <div className="calc-step">
                <span className="calc-val">{selectedProduct.stock}</span>
                <span className="calc-arrow">→</span>
                <span className="calc-val primary">
                  {Number(selectedProduct.stock) + Number(adjustment.quantity)}
                </span>
              </div>
            </div>
          )}

          <div className="form-actions" style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border)", justifyContent: "center" }}>
            <button className="button primary" type="submit" disabled={isSaving || !selectedProduct || !adjustment.quantity}>
              {isSaving ? "Saving..." : "Apply Adjustment"}
            </button>
            <button
              className="button"
              type="button"
              onClick={() => {
                setShowForm(false);
                setAdjustment(emptyAdjustment);
                setSearchQuery("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

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
                <span className="metric-value">{formatMoney(inventoryStats.value)}</span>
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
