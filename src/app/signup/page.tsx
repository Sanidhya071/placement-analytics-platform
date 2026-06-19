"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../login/login.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Student Specific
  const [branch, setBranch] = useState("Computer Science & Business Systems");
  const [academicYear, setAcademicYear] = useState("3");
  const [cgpa, setCgpa] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        role,
        name,
        email,
        password,
        ...(role === "STUDENT" ? {
          branch,
          academicYear,
          cgpa: cgpa ? parseFloat(cgpa) : 0.0,
        } : {})
      };

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`${styles.authCard} glass`} style={{ maxWidth: "550px" }}>
        <div className={styles.header}>
          <span className={styles.badge}>CSBS Major Project</span>
          <h1 className={styles.title}>Register Account</h1>
          <p className={styles.subtitle}>Create your placement portal profile</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">I am registering as</label>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.95rem" }}>
                <input
                  type="radio"
                  name="role"
                  value="STUDENT"
                  checked={role === "STUDENT"}
                  onChange={() => setRole("STUDENT")}
                />
                Student
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.95rem" }}>
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={role === "ADMIN"}
                  onChange={() => setRole("ADMIN")}
                />
                Administrator
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@university.edu"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••• (Min. 6 characters)"
              required
              minLength={6}
            />
          </div>

          {role === "STUDENT" && (
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem", marginTop: "0.5rem" }}>
              <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--primary)" }}>Academic Credentials</h3>
              
              <div className="form-group">
                <label className="form-label">Department / Branch</label>
                <select
                  className="form-select"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                >
                  <option value="Computer Science & Business Systems">Computer Science & Business Systems (CSBS)</option>
                  <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                  <option value="Information Technology">Information Technology (IT)</option>
                  <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Academic Year</label>
                  <select
                    className="form-select"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className="form-input"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    placeholder="e.g. 8.45"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "1rem" }}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className={styles.footer}>
          Already have an account?{" "}
          <Link href="/login" className={styles.link}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
