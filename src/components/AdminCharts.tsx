"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ChartProps {
  branchData: { branch: string; count: number }[];
  statusData: { name: string; value: number }[];
  companyData: { name: string; applications: number }[];
}

const COLORS = ["#10b981", "#06b6d4", "#f59e0b", "#ef4444"];

export default function AdminCharts({ branchData, statusData, companyData }: ChartProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
        
        {/* Status Distribution (Pie Chart) */}
        <div className="card" style={{ height: "350px" }}>
          <h3 style={{ marginBottom: "1rem" }}>Application Status Distribution</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Branch Distribution (Bar Chart) */}
        <div className="card" style={{ height: "350px" }}>
          <h3 style={{ marginBottom: "1rem" }}>Branch-wise Student Distribution</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={branchData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="branch" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--primary-light)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Company Wise Applications (Horizontal Bar Chart) */}
      <div className="card" style={{ height: "350px" }}>
        <h3 style={{ marginBottom: "1rem" }}>Company-wise Application Count</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart
            data={companyData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="applications" fill="var(--secondary)" radius={[0, 4, 4, 0]} name="Applications" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
