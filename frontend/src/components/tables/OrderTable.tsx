import type { Order } from "../../types";
import { formatMoney } from "../../utils/format";

function orderStatusClass(status: string) {
  if (status === "Delayed" || status === "Issue") {
    return "status danger";
  }

  if (status === "Pending" || status === "Packed") {
    return "status warning";
  }

  if (status === "Shipped") {
    return "status info";
  }

  return "status success";
}

const statuses = [
  "Pending",
  "Packed",
  "Shipped",
  "Completed",
  "Delayed",
  "Cancelled"
];

function formatDate(value?: string) {
  if (!value) {
    return "Today";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

interface OrderTableProps {
  orders?: Order[];
  onStatusChange?: (order: Order, status: string) => void;
}

function OrderTable({ orders = [], onStatusChange }: OrderTableProps) {
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              {onStatusChange && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {!orders.length && (
              <tr>
                <td colSpan={onStatusChange ? 6 : 5}>
                  <div className="empty-state">No orders found</div>
                </td>
              </tr>
            )}

            {orders.map((order) => {
              const customerName = typeof order.customer === "string"
                ? order.customer
                : order.customer?.name;

              return (
                <tr key={order.id}>
                  <td className="numeric">{order.order_number || order.id}</td>
                  <td>
                    <span className="entity">
                      <strong>{customerName || "Unknown customer"}</strong>
                      <span>{order.channel || "Online"}</span>
                    </span>
                  </td>
                  <td>{formatDate(order.ordered_at)}</td>
                  <td className="numeric">{formatMoney(order.total || 0)}</td>
                  <td>
                    <span className={orderStatusClass(order.status)}>
                      {order.status}
                    </span>
                  </td>
                  {onStatusChange && (
                    <td>
                      <select
                        className="select-field compact"
                        value={order.status}
                        onChange={(event) => onStatusChange(order, event.target.value)}
                        disabled={order.status === "Cancelled"}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
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

export default OrderTable;
