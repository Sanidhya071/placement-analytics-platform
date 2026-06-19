"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  studentName: string;
  studentEmail: string;
  branch: string;
  cgpa: number;
  readinessScore: number;
  companyName: string;
  appliedAt: string;
  status: "APPLIED" | "SHORTLISTED" | "SELECTED" | "REJECTED";
}

interface ApplicationsManagerProps {
  initialApplications: Application[];
}

export default function ApplicationsManager({ initialApplications }: ApplicationsManagerProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);

    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApps = initialApplications.filter((app) => {
    const matchesSearch = 
      app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.branch.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Filter Toolbar */}
      <div 
        className="card glass" 
        style={{ 
          display: "flex", 
          gap: "1.5rem", 
          alignItems: "center", 
          marginBottom: "2rem",
          padding: "1.25rem 1.75rem",
          flexWrap: "wrap"
        }}
      >
        <div style={{ flex: 1, minWidth: "250px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Search student name, branch, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-muted)" }}>Status:</span>
          <select 
            className="form-select" 
            style={{ width: "160px", padding: "0.5rem 0.75rem" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Applications</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="card glass">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Academic Stats</th>
                <th>Company</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id}>
                  <td>
                    <strong>{app.studentName}</strong>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{app.studentEmail}</div>
                  </td>
                  <td>
                    <div>CGPA: {app.cgpa.toFixed(2)}</div>
                    <div style={{ fontSize: "0.80rem", color: "var(--primary-light)", fontWeight: "600" }}>
                      Readiness: {app.readinessScore}%
                    </div>
                  </td>
                  <td>
                    <strong>{app.companyName}</strong>
                  </td>
                  <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${
                      app.status === "SELECTED" ? "badge-success" :
                      app.status === "SHORTLISTED" ? "badge-info" :
                      app.status === "REJECTED" ? "badge-danger" : "badge-warning"
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{ width: "140px", padding: "0.35rem 0.5rem", fontSize: "0.85rem" }}
                      value={app.status}
                      disabled={updatingId === app.id}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    >
                      <option value="APPLIED">Applied</option>
                      <option value="SHORTLISTED">Shortlist</option>
                      <option value="SELECTED">Select</option>
                      <option value="REJECTED">Reject</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                    No placement applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
