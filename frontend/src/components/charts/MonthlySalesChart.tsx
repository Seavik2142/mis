import { TrendingUp } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface SalesItem {
  label: string;
  revenue: number;
}

interface MonthlySalesChartProps {
  sales?: SalesItem[];
}

function MonthlySalesChart({ sales = [] }: MonthlySalesChartProps) {
  const labels = sales.length ? sales.map((item) => item.label) : [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun"
  ];
  const revenue = sales.length ? sales.map((item) => item.revenue) : [
    0,
    0,
    0,
    0,
    0,
    0
  ];

  const data: ChartData<"line"> = {
    labels,
    datasets: [
      {
        label: "Sales",
        data: revenue,
        borderColor: "#0f766e",
        backgroundColor: "rgba(15, 118, 110, 0.16)",
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#0f766e",
        pointBorderWidth: 3,
        pointRadius: 4,
        tension: 0.36,
        fill: true
      }
    ]
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${Number(value) / 1000}k`
        }
      }
    }
  };

  return (
    <section className="panel chart-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title-row">
            <span className="panel-icon">
              <TrendingUp aria-hidden="true" size={18} strokeWidth={2.2} />
            </span>
            <h2 className="panel-title">Monthly Sales</h2>
          </div>
          <p className="panel-subtitle">Revenue trend across the last six months</p>
        </div>
        <span className="status success">On track</span>
      </div>

      <div className="chart-wrap">
        <Line data={data} options={options} />
      </div>
    </section>
  );
}

export default MonthlySalesChart;
