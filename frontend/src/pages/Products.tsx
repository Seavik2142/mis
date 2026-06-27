import { PackagePlus, RefreshCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import Layout from "../components/layout/Layout";
import ProductTable from "../components/tables/ProductTable";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct
} from "../services/productService";
import type { Product } from "../types";

const categories = ["Accessories", "Computers", "Mobile", "Electronics", "Software", "General"];

interface ProductForm {
  sku: string;
  name: string;
  category: string;
  price: string;
  stock: string;
  reorder_level: string;
}

const emptyProduct: ProductForm = {
  sku: "",
  name: "",
  category: "General",
  price: "",
  stock: "",
  reorder_level: "15"
};

function productPayload(product: ProductForm, includeStock: boolean) {
  const payload: any = {
    sku: product.sku.trim(),
    name: product.name.trim(),
    category: product.category.trim() || "General",
    price: Number(product.price),
    reorder_level: Number(product.reorder_level)
  };

  if (includeStock) {
    payload.stock = Number(product.stock || 0);
  }

  return payload;
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState<ProductForm>(emptyProduct);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function loadProducts() {
    setIsLoading(true);
    setError("");
    try {
      const data = await getProducts({
        search,
        lowStock: filter === "Low stock",
        category: categories.includes(filter) ? filter : ""
      });
      setProducts(data);
    } catch (requestError: any) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [search, filter]);

  function startCreate() {
    setEditingProduct(null);
    setForm(emptyProduct);
    setShowForm(true);
  }

  function startEdit(product: Product) {
    setEditingProduct(product);
    setForm({
      sku: product.sku,
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      reorder_level: String(product.reorder_level)
    });
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productPayload(form, false));
      } else {
        await createProduct(productPayload(form, true));
      }
      setShowForm(false);
      setEditingProduct(null);
      setForm(emptyProduct);
      await loadProducts();
    } catch (requestError: any) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleArchive(product: Product) {
    if (!window.confirm(`Archive ${product.name}?`)) {
      return;
    }

    setError("");
    try {
      await deleteProduct(product.id);
      await loadProducts();
    } catch (requestError: any) {
      setError(requestError.message);
    }
  }

  return (
    <Layout>
      <section className="page">
        <div className="page-header">
          <div>
            <p className="eyebrow">Catalog Management</p>
            <h1>Products</h1>
            <p className="lede">
              Manage your product catalog, pricing, and stock levels in one place.
            </p>
          </div>

          <div className="actions">
            <button className="button" type="button" onClick={loadProducts}>
              <RefreshCcw aria-hidden="true" size={17} strokeWidth={2.2} />
              Refresh
            </button>
            <button className="button primary" type="button" onClick={startCreate}>
              <PackagePlus aria-hidden="true" size={17} strokeWidth={2.2} />
              Add Product
            </button>
          </div>
        </div>

        {error && <p className="notice danger">{error}</p>}
        {isLoading && <p className="notice">Loading products...</p>}

        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title={editingProduct ? "Edit Product" : "New Product"}
          subtitle={
            editingProduct
              ? "Update product details and pricing."
              : "Register a new product in the catalog."
          }
          variant="small"
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}
          >
            <div className="field">
              <label htmlFor="sku">SKU (Stock Keeping Unit)</label>
              <input
                id="sku"
                placeholder="e.g. LAP-PRO-001"
                value={form.sku}
                onChange={(event) => setForm({ ...form, sku: event.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="name">Product Name</label>
              <input
                id="name"
                placeholder="e.g. MacBook Pro 14"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="price">Unit Price ($)</label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                required
              />
            </div>
            {!editingProduct && (
              <div className="field">
                <label htmlFor="stock">Initial Stock Level</label>
                <input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.stock}
                  onChange={(event) => setForm({ ...form, stock: event.target.value })}
                  required
                />
              </div>
            )}
            <div className="field">
              <label htmlFor="reorder">Reorder Point</label>
              <input
                id="reorder"
                type="number"
                min="0"
                placeholder="10"
                value={form.reorder_level}
                onChange={(event) => setForm({ ...form, reorder_level: event.target.value })}
                required
              />
            </div>
            <div className="form-actions" style={{ marginTop: "8px" }}>
              <button className="button primary" type="submit" disabled={isSaving} style={{ flex: 1 }}>
                {isSaving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
              </button>
              <button
                className="button"
                type="button"
                onClick={() => setShowForm(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>

        <div className="toolbar">
          <div className="search-wrap">
            <Search aria-hidden="true" size={18} strokeWidth={2.2} />
            <input
              className="search-field"
              placeholder="Search by name, SKU or code..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="chip-row">
            {["All", "Low stock", ...categories.slice(0, 3)].map((item) => (
              <button
                className={item === filter ? "chip active" : "chip"}
                key={item}
                type="button"
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <ProductTable
          products={products}
          onEdit={startEdit}
          onArchive={handleArchive}
        />
      </section>
    </Layout>
  );
}

export default Products;
