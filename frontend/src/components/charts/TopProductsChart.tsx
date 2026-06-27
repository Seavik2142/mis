import { Trophy } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

interface TopProductItem {
  name: string;
  units_sold: number;
}

interface TopProductsChartProps {
  products?: TopProductItem[];
}

function TopProductsChart({ products = [] }: TopProductsChartProps) {
  const labels = products.length ? products.map((product) => product.name) : [
    "No products"
  ];
  const unitsSold = products.length ? products.map((product) => product.units_sold) : [
    0
  ];

  const data: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: "Units Sold",
        data: unitsSold,
        backgroundColor: [
          "#0f766e",
          "#2563eb",
          "#b45309",
          "#64748b"
        ],
        borderRadius: 8
      }
    ]
  };

  const options: ChartOptions<"bar"> = {
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
        beginAtZero: true
      }
    }
  };

  return (
    <section className="panel chart-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title-row">
            <span className="panel-icon">
              <Trophy aria-hidden="true" size={18} strokeWidth={2.2} />
            </span>
            <h2 className="panel-title">Top Products</h2>
          </div>
          <p className="panel-subtitle">Best sellers by units sold</p>
        </div>
        <span className="status info">Live mix</span>
      </div>

      <div className="chart-wrap">
        <Bar data={data} options={options} />
      </div>
    </section>
  );
}

export default TopProductsChart;
