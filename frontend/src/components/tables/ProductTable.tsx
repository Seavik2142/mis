import type { Product } from "../../types";
import { formatMoney } from "../../utils/format";

function getStockStatus(product: Product & { status?: string }) {
  if (product.status) {
    return product.status;
  }

  if (product.stock <= 15) {
    return "Low stock";
  }

  if (product.stock <= 30) {
    return "Watch";
  }

  return "Healthy";
}

function statusClass(status: string) {
  if (status === "Low stock") {
    return "status danger";
  }

  if (status === "Watch") {
    return "status warning";
  }

  return "status success";
}

interface ProductTableProps {
  products?: Product[];
  onEdit?: (product: Product) => void;
  onArchive?: (product: Product) => void;
}

function ProductTable({
  products = [],
  onEdit,
  onArchive
}: ProductTableProps) {
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock Level</th>
              <th>Status</th>
              {(onEdit || onArchive) && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {!products.length && (
              <tr>
                <td colSpan={onEdit || onArchive ? 7 : 6}>
                  <div className="empty-state">No products found</div>
                </td>
              </tr>
            )}

            {products.map((product) => {
              const status = getStockStatus(product);
              const maxStock = 120;
              const stockPercent = Math.min((product.stock / maxStock) * 100, 100);

              return (
                <tr key={product.id}>
                  <td className="numeric">{product.product_code || product.id}</td>
                  <td>
                    <span className="entity">
                      <strong>{product.name}</strong>
                      <span>SKU: {product.sku || "N/A"}</span>
                    </span>
                  </td>
                  <td>{product.category || "General"}</td>
                  <td className="numeric">{formatMoney(product.price, 2)}</td>
                  <td>
                    <span className="entity">
                      <strong>{product.stock} units</strong>
                      <span className="progress">
                        <span style={{ width: `${stockPercent}%` }} />
                      </span>
                    </span>
                  </td>
                  <td>
                    <span className={statusClass(status)}>{status}</span>
                  </td>
                  {(onEdit || onArchive) && (
                    <td>
                      <div className="table-actions">
                        {onEdit && (
                          <button
                            className="button compact"
                            type="button"
                            onClick={() => onEdit(product)}
                          >
                            Edit
                          </button>
                        )}
                        {onArchive && (
                          <button
                            className="button compact danger"
                            type="button"
                            onClick={() => onArchive(product)}
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductTable;
