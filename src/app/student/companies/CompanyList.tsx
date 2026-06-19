"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Company {
  id: string;
  name: string;
  minCgpa: number;
  packageLpa: number;
  location: string;
  requiredSkills: string[];
  deadline: string;
}

interface CompanyListProps {
  companies: Company[];
  appliedCompanyIds: string[];
  studentCgpa: number;
}

export default function CompanyList({ companies, appliedCompanyIds, studentCgpa }: CompanyListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEligibility, setFilterEligibility] = useState("ALL"); // ALL, ELIGIBLE, INELIGIBLE
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleApply = async (companyId: string) => {
    setApplyingId(companyId);
    setError("");

    try {
      const res = await fetch("/api/student/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application.");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
      // Reset error message after 4 seconds
      setTimeout(() => setError(""), 4000);
    } finally {
      setApplyingId(null);
    }
  };

  // Filter logic
  const filteredCompanies = companies.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.requiredSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const isEligible = studentCgpa >= c.minCgpa && new Date() <= new Date(c.deadline);

    if (filterEligibility === "ELIGIBLE") return matchesSearch && isEligible;
    if (filterEligibility === "INELIGIBLE") return matchesSearch && !isEligible;
    return matchesSearch;
  });

  return (
    <div>
      {error && (
        <div 
          className="badge" 
          style={{ 
            display: "block", 
            width: "100%", 
            padding: "0.75rem", 
            textAlign: "center", 
            marginBottom: "1.5rem",
            backgroundColor: "var(--danger-bg)",
            color: "var(--danger)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid rgba(239, 68, 68, 0.2)"
          }}
        >
          {error}
        </div>
      )}

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
            placeholder="🔍 Search company name, location, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-muted)" }}>Eligibility:</span>
          <select 
            className="form-select" 
            style={{ width: "160px", padding: "0.5rem 0.75rem" }}
            value={filterEligibility}
            onChange={(e) => setFilterEligibility(e.target.value)}
          >
            <option value="ALL">All Drives</option>
            <option value="ELIGIBLE">Eligible Only</option>
            <option value="INELIGIBLE">Ineligible Only</option>
          </select>
        </div>
      </div>

      {/* Grid of Companies */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {filteredCompanies.map((company) => {
          const hasApplied = appliedCompanyIds.includes(company.id);
          const isCgpaEligible = studentCgpa >= company.minCgpa;
          const isDateEligible = new Date() <= new Date(company.deadline);
          const isEligible = isCgpaEligible && isDateEligible;

          return (
            <div key={company.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1.25rem" }}>{company.name}</h3>
                  <span className={`badge ${isEligible ? "badge-success" : "badge-danger"}`}>
                    {isEligible ? "Eligible" : "Not Eligible"}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>📍 Location:</span>
                    <strong style={{ color: "var(--text-main)" }}>{company.location}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>💰 Package:</span>
                    <strong style={{ color: "var(--text-main)" }}>{company.packageLpa} LPA</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>🎓 Cutoff CGPA:</span>
                    <strong style={{ color: isCgpaEligible ? "var(--success)" : "var(--danger)" }}>
                      {company.minCgpa.toFixed(2)}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>📅 Deadline:</span>
                    <strong style={{ color: isDateEligible ? "var(--text-main)" : "var(--danger)" }}>
                      {new Date(company.deadline).toLocaleDateString()}
                    </strong>
                  </div>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <span style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    Required Skills:
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                    {company.requiredSkills.map((skill) => (
                      <span key={skill} className="badge badge-info" style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem" }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {hasApplied ? (
                <button className="btn btn-secondary" style={{ width: "100%" }} disabled>
                  ✓ Already Applied
                </button>
              ) : (
                <button
                  onClick={() => handleApply(company.id)}
                  className={`btn ${isEligible ? "btn-primary" : "btn-secondary"}`}
                  style={{ width: "100%" }}
                  disabled={!isEligible || applyingId === company.id}
                >
                  {!isEligible
                    ? "❌ Ineligible to Apply"
                    : applyingId === company.id
                    ? "Applying..."
                    : "📤 Apply for Drive"}
                </button>
              )}
            </div>
          );
        })}

        {filteredCompanies.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
            No recruitment drives match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
