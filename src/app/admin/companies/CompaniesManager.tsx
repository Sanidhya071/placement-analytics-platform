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

interface CompaniesManagerProps {
  initialCompanies: Company[];
}

export default function CompaniesManager({ initialCompanies }: CompaniesManagerProps) {
  const router = useRouter();
  const [companies, setCompanies] = useState(initialCompanies);
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [minCgpa, setMinCgpa] = useState("");
  const [packageLpa, setPackageLpa] = useState("");
  const [location, setLocation] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [deadline, setDeadline] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setMinCgpa("");
    setPackageLpa("");
    setLocation("");
    setSkillsInput("");
    setDeadline("");
    setEditingId(null);
    setIsEditing(false);
    setError("");
  };

  const handleEditClick = (company: Company) => {
    setEditingId(company.id);
    setName(company.name);
    setMinCgpa(company.minCgpa.toString());
    setPackageLpa(company.packageLpa.toString());
    setLocation(company.location);
    setSkillsInput(company.requiredSkills.join(", "));
    // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
    const d = new Date(company.deadline);
    const dateStr = d.toISOString().slice(0, 16);
    setDeadline(dateStr);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const skillsArray = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      name,
      minCgpa: parseFloat(minCgpa),
      packageLpa: parseFloat(packageLpa),
      location,
      requiredSkills: skillsArray,
      deadline: new Date(deadline).toISOString(),
    };

    try {
      const url = editingId ? `/api/admin/companies/${editingId}` : "/api/admin/companies";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save company");
      }

      router.refresh();
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company drive? All associated student applications will be permanently deleted.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/companies/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete company");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: isEditing ? "3fr 2fr" : "1fr", gap: "2rem" }}>
      {/* Table view */}
      <div className="card glass">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3>Recruitment Drives Listing</h3>
          {!isEditing && (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              ➕ Create New Drive
            </button>
          )}
        </div>

        {error && !isEditing && <div style={{ color: "var(--danger)", marginBottom: "1rem" }}>{error}</div>}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Min CGPA</th>
                <th>Package</th>
                <th>Location</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialCompanies.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.minCgpa.toFixed(2)}</td>
                  <td>{c.packageLpa} LPA</td>
                  <td>{c.location}</td>
                  <td>{new Date(c.deadline).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem" }} onClick={() => handleEditClick(c)}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-danger" style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem" }} onClick={() => handleDelete(c.id)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {initialCompanies.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                    No recruitment drives found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor sidebar panel */}
      {isEditing && (
        <div className="card glass">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3>{editingId ? "Edit Placement Drive" : "Create Placement Drive"}</h3>
            <button className="btn btn-secondary" onClick={resetForm} style={{ padding: "0.4rem 0.75rem" }}>✕ Close</button>
          </div>

          {error && <div style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input type="text" className="form-input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Google, TCS" />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Package (LPA)</label>
                <input type="number" step="0.1" className="form-input" required value={packageLpa} onChange={(e) => setPackageLpa(e.target.value)} placeholder="e.g. 12.5" />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Cutoff CGPA</label>
                <input type="number" step="0.01" max="10" className="form-input" required value={minCgpa} onChange={(e) => setMinCgpa(e.target.value)} placeholder="e.g. 8.00" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Job Location</label>
              <input type="text" className="form-input" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bangalore, Pune, Remote" />
            </div>

            <div className="form-group">
              <label className="form-label">Required Skills (Comma separated)</label>
              <input type="text" className="form-input" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="e.g. Java, SQL, Python" />
            </div>

            <div className="form-group">
              <label className="form-label">Application Deadline</label>
              <input type="datetime-local" className="form-input" required value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Drive" : "Launch Drive"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
