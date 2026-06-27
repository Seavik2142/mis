import {
  CalendarClock,
  Download,
  FileBarChart,
  HeartPulse
} from "lucide-react";
import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import MonthlySalesChart from "../components/charts/MonthlySalesChart";
import TopProductsChart from "../components/charts/TopProductsChart";
import { getSalesReport } from "../services/reportService";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

interface SalesSummary {
  period_days: number;
  revenue: number;
  orders: number;
  average_order_value: number;
  generated_at?: string;
}

interface SalesReportData {
  summary: SalesSummary;
  monthly_sales: any[];
  top_products: any[];
}

function Reports() {
  const [report, setReport] = useState<SalesReportData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function loadReport() {
    setIsLoading(true);
    setError("");
    try {
      const data = await getSalesReport(30);
      setReport(data);
    } catch (requestError: any) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  function downloadReport() {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sales-mis-report.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      <section className="page">
        <div className="page-header">
          <div>
            <p className="eyebrow">Reporting</p>
            <h1>Reports</h1>
            <p className="lede">
              Review performance summaries and keep recurring reports close to the dashboard.
            </p>
          </div>

          <div className="actions">
            <button className="button" type="button" onClick={loadReport}>
              <CalendarClock aria-hidden="true" size={17} strokeWidth={2.2} />
              Refresh
            </button>
            <button
              className="button primary"
              type="button"
              onClick={downloadReport}
              disabled={!report}
            >
              <Download aria-hidden="true" size={17} strokeWidth={2.2} />
              Download Report
            </button>
          </div>
        </div>

        {error && <p className="notice danger">{error}</p>}
        {isLoading && <p className="notice">Loading report...</p>}

        <div className="chart-grid">
          <MonthlySalesChart sales={report?.monthly_sales || []} />
          <TopProductsChart products={report?.top_products || []} />
        </div>

        <div className="reports-grid">
          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title-row">
                  <span className="panel-icon">
                    <FileBarChart aria-hidden="true" size={18} strokeWidth={2.2} />
                  </span>
                  <h2 className="panel-title">Sales Summary</h2>
                </div>
                <p className="panel-subtitle">Last {report?.summary?.period_days || 30} days</p>
              </div>
            </div>

            <div className="insight-list">
              <div className="insight-item">
                <div>
                  <strong>Revenue</strong>
                  <p>Total sales excluding cancelled orders.</p>
                </div>
                <span className="status success">
                  {money.format(report?.summary?.revenue || 0)}
                </span>
              </div>
              <div className="insight-item">
                <div>
                  <strong>Orders</strong>
                  <p>Completed, shipped, packed, delayed, and pending orders.</p>
                </div>
                <span className="status info">{report?.summary?.orders || 0}</span>
              </div>
              <div className="insight-item">
                <div>
                  <strong>Average Order Value</strong>
                  <p>Revenue divided by orders in the reporting window.</p>
                </div>
                <span className="status warning">
                  {money.format(report?.summary?.average_order_value || 0)}
                </span>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title-row">
                  <span className="panel-icon">
                    <HeartPulse aria-hidden="true" size={18} strokeWidth={2.2} />
                  </span>
                  <h2 className="panel-title">Report Health</h2>
                </div>
                <p className="panel-subtitle">Current freshness and delivery state</p>
              </div>
            </div>

            <div className="metric-list">
              <div className="metric-row">
                <div>
                  <strong>Data Freshness</strong>
                  <p>Generated by the backend</p>
                </div>
                <span className="metric-value">
                  {report?.summary?.generated_at
                    ? new Date(report.summary.generated_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                    : "--"}
                </span>
              </div>
              <div className="metric-row">
                <div>
                  <strong>Top Products</strong>
                  <p>Products ranked by units sold</p>
                </div>
                <span className="metric-value">{report?.top_products?.length || 0}</span>
              </div>
            </div>
          </section>
        </div>
      </section>
    </Layout>
  );
}

export default Reports;
