import {
  Download,
  MessageSquareWarning,
  ReceiptText,
  Repeat2,
  Search,
  UserPlus,
  UsersRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Modal from "../components/common/Modal";
import StatsCard from "../components/cards/StatsCard";
import Layout from "../components/layout/Layout";
import CustomerTable from "../components/tables/CustomerTable";
import {
  createCustomer,
  getCustomers,
  updateCustomer
} from "../services/customerService";
import type { Customer } from "../types";
import { formatMoney } from "../utils/format";

const segments = ["Active", "VIP", "Wholesale", "Prospect", "Inactive"];

interface CustomerForm {
  name: string;
  company: string;
  email: string;
  phone: string;
  segment: string;
}

const emptyCustomer: CustomerForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  segment: "Active"
};

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<CustomerForm>(emptyCustomer);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function loadCustomers() {
    setIsLoading(true);
    setError("");
    try {
      const data = await getCustomers(search);
      setCustomers(data);
    } catch (requestError: any) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const stats = useMemo(() => {
    const totalSpend = customers.reduce((sum, customer) => (
      sum + Number(customer.spend || 0)
    ), 0);
    const orderCount = customers.reduce((sum, customer) => (
      sum + Number(customer.orders || 0)
    ), 0);
    const repeatCustomers = customers.filter((customer) => (
      Number(customer.orders || 0) > 1
    )).length;
    const needsFollowUp = customers.filter((customer) => (
      Number(customer.orders || 0) === 0
    )).length;

    return {
      totalSpend,
      orderCount,
      repeatRate: customers.length
        ? Math.round((repeatCustomers / customers.length) * 100)
        : 0,
      averageOrder: orderCount ? totalSpend / orderCount : 0,
      needsFollowUp
    };
  }, [customers]);

  function startCreate() {
    setEditingCustomer(null);
    setForm(emptyCustomer);
    setShowForm(true);
  }

  function startEdit(customer: Customer) {
    setEditingCustomer(customer);
    setForm({
      name: customer.name || "",
      company: customer.company || "",
      email: customer.email || "",
      phone: customer.phone || "",
      segment: customer.segment || "Active"
    });
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        company: form.company || null,
        phone: form.phone || null
      };

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, payload);
      } else {
        await createCustomer(payload);
      }
      setShowForm(false);
      setEditingCustomer(null);
      setForm(emptyCustomer);
      await loadCustomers();
    } catch (requestError: any) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  function exportCustomers() {
    const blob = new Blob([JSON.stringify(customers, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sales-mis-customers.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingCustomer ? "Edit Customer" : "New Customer"}
        subtitle={
          editingCustomer
            ? "Update contact info and segment."
            : "Register a new client in your database."
        }
        variant="small"
      >
        <form className="form-compact" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="customer-name">Full Name</label>
            <input
              id="customer-name"
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="customer-company">Company (Optional)</label>
            <input
              id="customer-company"
              placeholder="e.g. Acme Corp"
              value={form.company}
              onChange={(event) => setForm({ ...form, company: event.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="customer-email">Email Address</label>
            <input
              id="customer-email"
              type="email"
              placeholder="e.g. john@example.com"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="customer-phone">Phone Number</label>
            <input
              id="customer-phone"
              placeholder="e.g. +1 234 567 890"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="customer-segment">Customer Segment</label>
            <select
              id="customer-segment"
              value={form.segment}
              onChange={(event) => setForm({ ...form, segment: event.target.value })}
            >
              {segments.map((seg) => (
                <option key={seg} value={seg}>
                  {seg}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions" style={{ marginTop: "12px", justifyContent: "center" }}>
            <button className="button primary" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : editingCustomer ? "Update Customer" : "Create Customer"}
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

      <section className="page">
        <div className="page-header">
          <div>
            <p className="eyebrow">Relationship Management</p>
            <h1>Customers</h1>
            <p className="lede">
              Track customer purchase history, segments, and value metrics.
            </p>
          </div>

          <div className="actions">
            <button className="button" type="button" onClick={exportCustomers}>
              <Download aria-hidden="true" size={17} strokeWidth={2.2} />
              Export
            </button>
            <button className="button primary" type="button" onClick={startCreate}>
              <UserPlus aria-hidden="true" size={17} strokeWidth={2.2} />
              Add Customer
            </button>
          </div>
        </div>

        {error && <p className="notice danger">{error}</p>}
        {isLoading && <p className="notice">Loading customers...</p>}

        <div className="kpi-grid">
          <StatsCard
            title="Active Accounts"
            value={customers.length}
            detail={`${stats.orderCount} total orders`}
            tone="#2563eb"
            Icon={UsersRound}
          />
          <StatsCard
            title="Repeat Rate"
            value={`${stats.repeatRate}%`}
            detail="repeat buyers"
            tone="#0f766e"
            Icon={Repeat2}
          />
          <StatsCard
            title="Avg. Order"
            value={formatMoney(stats.averageOrder)}
            detail="all time"
            tone="#b45309"
            Icon={ReceiptText}
          />
          <StatsCard
            title="Needs Follow-up"
            value={stats.needsFollowUp}
            detail="no orders"
            tone="#dc2626"
            trend={stats.needsFollowUp ? "risk" : "stable"}
            Icon={MessageSquareWarning}
          />
        </div>

        <div className="toolbar">
          <div className="search-wrap">
            <Search aria-hidden="true" size={18} strokeWidth={2.2} />
            <input
              className="search-field"
              placeholder="Search by name, email or company..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <CustomerTable customers={customers} onEdit={startEdit} />
      </section>
    </Layout>
  );
}

export default Customers;
