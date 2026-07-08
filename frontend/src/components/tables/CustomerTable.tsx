import type { Customer } from "../../types";
import { formatMoney } from "../../utils/format";

interface CustomerTableProps {
  customers?: Customer[];
  onEdit?: (customer: Customer) => void;
}

function CustomerTable({ customers = [], onEdit }: CustomerTableProps) {
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Segment</th>
              <th>Orders</th>
              <th>Spend</th>
              {onEdit && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {!customers.length && (
              <tr>
                <td colSpan={onEdit ? 7 : 6}>
                  <div className="empty-state">No customers found</div>
                </td>
              </tr>
            )}

            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="numeric">{customer.customer_code || customer.id}</td>
                <td>
                  <span className="entity">
                    <strong>{customer.name}</strong>
                    <span>{customer.company || "Retail account"}</span>
                  </span>
                </td>
                <td>{customer.email}</td>
                <td>
                  <span className="status info">{customer.segment || "Active"}</span>
                </td>
                <td className="numeric">{customer.orders || 0}</td>
                <td className="numeric">{formatMoney(customer.spend || 0)}</td>
                {onEdit && (
                  <td>
                    <button
                      className="button compact"
                      type="button"
                      onClick={() => onEdit(customer)}
                    >
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerTable;
