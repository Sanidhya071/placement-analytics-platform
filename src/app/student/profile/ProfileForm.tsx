"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileProps {
  initialProfile: {
    id: string;
    branch: string;
    academicYear: number;
    cgpa: number;
    skills: string[];
    certifications: string[];
    projectsCount: number;
    internshipsCount: number;
    hackathonsCount: number;
  };
}

export default function ProfileForm({ initialProfile }: ProfileProps) {
  const router = useRouter();
  const [branch, setBranch] = useState(initialProfile.branch);
  const [academicYear, setAcademicYear] = useState(initialProfile.academicYear.toString());
  const [cgpa, setCgpa] = useState(initialProfile.cgpa.toString());
  const [projectsCount, setProjectsCount] = useState(initialProfile.projectsCount.toString());
  const [internshipsCount, setInternshipsCount] = useState(initialProfile.internshipsCount.toString());
  const [hackathonsCount, setHackathonsCount] = useState(initialProfile.hackathonsCount.toString());

  // Tag inputs
  const [skills, setSkills] = useState<string[]>(initialProfile.skills);
  const [skillInput, setSkillInput] = useState("");
  
  const [certifications, setCertifications] = useState<string[]>(initialProfile.certifications);
  const [certInput, setCertInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (certInput.trim() && !certifications.includes(certInput.trim())) {
      setCertifications([...certifications, certInput.trim()]);
      setCertInput("");
    }
  };

  const handleRemoveCert = (cert: string) => {
    setCertifications(certifications.filter((c) => c !== cert));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch,
          academicYear,
          cgpa,
          skills,
          certifications,
          projectsCount,
          internshipsCount,
          hackathonsCount,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      setMessage({ type: "success", text: "Profile updated successfully! Readiness score recalculated." });
      router.refresh();
      // Clear success message after 3 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card glass" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
        Edit Academic & Skill Profile
      </h2>

      {message.text && (
        <div 
          className="badge" 
          style={{ 
            display: "block", 
            width: "100%", 
            padding: "0.75rem", 
            textAlign: "center", 
            marginBottom: "1.5rem",
            backgroundColor: message.type === "success" ? "var(--success-bg)" : "var(--danger-bg)",
            color: message.type === "success" ? "var(--success)" : "var(--danger)",
            borderRadius: "var(--radius-sm)",
            border: `1px solid ${message.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Academics Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Department / Branch</label>
            <select className="form-select" value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option value="Computer Science & Business Systems">Computer Science & Business Systems (CSBS)</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
              <option value="Information Technology">Information Technology (IT)</option>
              <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Academic Year</label>
            <select className="form-select" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Current CGPA (out of 10.0)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              className="form-input"
              value={cgpa}
              onChange={(e) => setCgpa(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Quantities Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Academic Projects</label>
            <input
              type="number"
              min="0"
              className="form-input"
              value={projectsCount}
              onChange={(e) => setProjectsCount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Internships Completed</label>
            <input
              type="number"
              min="0"
              className="form-input"
              value={internshipsCount}
              onChange={(e) => setInternshipsCount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hackathons Participated</label>
            <input
              type="number"
              min="0"
              className="form-input"
              value={hackathonsCount}
              onChange={(e) => setHackathonsCount(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Skills Tag Section */}
        <div className="form-group">
          <label className="form-label">Technical Skills (Languages, Frameworks, databases)</label>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Java, Python, React, MongoDB"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(e); } }}
            />
            <button type="button" onClick={handleAddSkill} className="btn btn-secondary">Add</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {skills.map((skill) => (
              <span 
                key={skill} 
                className="badge badge-info" 
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.75rem" }}
              >
                {skill}
                <button 
                  type="button" 
                  onClick={() => handleRemoveSkill(skill)}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}
                >
                  ✕
                </button>
              </span>
            ))}
            {skills.length === 0 && <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No skills added yet.</span>}
          </div>
        </div>

        {/* Certifications Tag Section */}
        <div className="form-group">
          <label className="form-label">Certifications (AWS, Java, Coursera, etc.)</label>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. AWS Cloud Practitioner, Google Data Analytics"
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCert(e); } }}
            />
            <button type="button" onClick={handleAddCert} className="btn btn-secondary">Add</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {certifications.map((cert) => (
              <span 
                key={cert} 
                className="badge badge-success" 
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.75rem" }}
              >
                {cert}
                <button 
                  type="button" 
                  onClick={() => handleRemoveCert(cert)}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}
                >
                  ✕
                </button>
              </span>
            ))}
            {certifications.length === 0 && <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No certifications added yet.</span>}
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: "fit-content", alignSelf: "flex-end", marginTop: "1rem", padding: "0.75rem 2.5rem" }}
          disabled={loading}
        >
          {loading ? "Saving changes..." : "Save Profile Details"}
        </button>
      </form>
    </div>
  );
}
