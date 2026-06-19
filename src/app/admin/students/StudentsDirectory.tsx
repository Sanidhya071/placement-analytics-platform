"use client";

import { useState } from "react";
import { getReadinessTier } from "@/lib/readiness";

interface Student {
  id: string;
  name: string;
  email: string;
  branch: string;
  academicYear: number;
  cgpa: number;
  readinessScore: number;
  skills: string[];
}

interface StudentsDirectoryProps {
  students: Student[];
}

export default function StudentsDirectory({ students }: StudentsDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL"); // ALL, EXCELLENT, GOOD, CRITICAL

  // Filter Logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBranch = branchFilter === "ALL" || s.branch === branchFilter;

    let matchesTier = true;
    if (tierFilter === "EXCELLENT") matchesTier = s.readinessScore >= 80;
    else if (tierFilter === "GOOD") matchesTier = s.readinessScore >= 60 && s.readinessScore < 80;
    else if (tierFilter === "NEEDS_IMPROVEMENT") matchesTier = s.readinessScore >= 40 && s.readinessScore < 60;
    else if (tierFilter === "CRITICAL") matchesTier = s.readinessScore < 40;

    return matchesSearch && matchesBranch && matchesTier;
  });

  // Unique branches for dropdown
  const branches = Array.from(new Set(students.map((s) => s.branch)));

  return (
    <div>
      {/* Filters Toolbar */}
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
            placeholder="🔍 Search student name, email, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-muted)" }}>Branch:</span>
            <select 
              className="form-select" 
              style={{ width: "160px", padding: "0.5rem 0.75rem" }}
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="ALL">All Branches</option>
              {branches.map((b) => (
                <option key={b} value={b}>{b.replace("Computer Science & Business Systems", "CSBS").replace("Computer Science & Engineering", "CSE")}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-muted)" }}>Readiness Tier:</span>
            <select 
              className="form-select" 
              style={{ width: "180px", padding: "0.5rem 0.75rem" }}
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
            >
              <option value="ALL">All Tiers</option>
              <option value="EXCELLENT">Excellent (≥80%)</option>
              <option value="GOOD">Good (60%-79%)</option>
              <option value="NEEDS_IMPROVEMENT">Needs Work (40%-59%)</option>
              <option value="CRITICAL">Critical (&lt;40%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="card glass">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student Details</th>
                <th>Academic Year</th>
                <th>CGPA</th>
                <th>Skills & Tags</th>
                <th>Readiness Index</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((stud) => {
                const tierInfo = getReadinessTier(stud.readinessScore);
                return (
                  <tr key={stud.id}>
                    <td>
                      <strong>{stud.name}</strong>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{stud.email}</div>
                      <div style={{ fontSize: "0.75rem", fontWeight: "500" }}>{stud.branch}</div>
                    </td>
                    <td>{stud.academicYear}rd Year</td>
                    <td>
                      <strong style={{ fontSize: "1.05rem" }}>{stud.cgpa.toFixed(2)}</strong>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", maxWidth: "250px" }}>
                        {stud.skills.slice(0, 4).map((s) => (
                          <span key={s} className="badge badge-info" style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem" }}>
                            {s}
                          </span>
                        ))}
                        {stud.skills.length > 4 && (
                          <span className="badge badge-success" style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem" }}>
                            +{stud.skills.length - 4} more
                          </span>
                        )}
                        {stud.skills.length === 0 && <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>No skills mapped</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div 
                          style={{ 
                            width: "48px", 
                            height: "48px", 
                            borderRadius: "50%", 
                            border: `3px solid ${tierInfo.color}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700",
                            fontSize: "0.95rem",
                            color: "var(--primary)"
                          }}
                        >
                          {stud.readinessScore}%
                        </div>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "500" }}>
                          {tierInfo.tier.split(" - ")[0]}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                    No student profiles match your search criteria.
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
