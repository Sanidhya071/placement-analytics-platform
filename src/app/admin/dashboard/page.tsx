import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminCharts from "@/components/AdminCharts";
import Link from "next/link";
import styles from "./admin.module.css";

export default async function AdminDashboard() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  // Fetch basic counts
  const totalStudents = await prisma.studentProfile.count();
  const totalCompanies = await prisma.company.count();
  const totalApplications = await prisma.application.count();

  // Calculate Average CGPA & Readiness
  const studentStats = await prisma.studentProfile.aggregate({
    _avg: {
      cgpa: true,
      readinessScore: true,
    },
  });

  const avgCgpa = studentStats._avg.cgpa || 0;
  const avgReadiness = studentStats._avg.readinessScore || 0;

  // Application status counts for pie chart
  const applications = await prisma.application.findMany({
    select: { status: true },
  });

  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    { SELECTED: 0, SHORTLISTED: 0, APPLIED: 0, REJECTED: 0 } as Record<string, number>
  );

  const statusData = [
    { name: "Selected", value: statusCounts.SELECTED },
    { name: "Shortlisted", value: statusCounts.SHORTLISTED },
    { name: "Applied", value: statusCounts.APPLIED },
    { name: "Rejected", value: statusCounts.REJECTED },
  ];

  // Branch distribution for bar chart
  const students = await prisma.studentProfile.findMany({
    select: { branch: true },
  });

  const branchCounts = students.reduce((acc, stud) => {
    acc[stud.branch] = (acc[stud.branch] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const branchData = Object.entries(branchCounts).map(([branch, count]) => ({
    branch: branch.replace("Computer Science & Business Systems", "CSBS").replace("Computer Science & Engineering", "CSE"),
    count,
  }));

  // Company applications counts for horizontal bar chart
  const companies = await prisma.company.findMany({
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  const companyData = companies.map((c) => ({
    name: c.name,
    applications: c._count.applications,
  })).slice(0, 5); // top 5 for visual layout

  // Recent applications list
  const recentApplications = await prisma.application.findMany({
    include: {
      student: {
        include: {
          user: true,
        },
      },
      company: true,
    },
    orderBy: {
      appliedAt: "desc",
    },
    take: 5,
  });

  // Placement percentage: (Selected / Total Students) * 100
  const totalSelected = statusCounts.SELECTED;
  const placementRate = totalStudents > 0 ? Math.round((totalSelected / totalStudents) * 100) : 0;

  const stats = [
    { label: "Total Students", value: totalStudents, icon: "👥", color: "#eff6ff", text: "var(--primary-light)" },
    { label: "Active Companies", value: totalCompanies, icon: "🏢", color: "#f0fdf4", text: "var(--success)" },
    { label: "Total Applications", value: totalApplications, icon: "📤", color: "#ecfeff", text: "var(--info)" },
    { label: "Placement Rate", value: `${placementRate}%`, icon: "🎯", color: "#fffbeb", text: "var(--warning)" },
  ];

  return (
    <div>
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>Placement Director Dashboard</h1>
          <p className={styles.subtitle}>Campus Recruitment Analytics & Management System</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href="/admin/companies" className="btn btn-primary">
            ➕ Add Company
          </Link>
          <Link href="/admin/applications" className="btn btn-secondary">
            📋 View Applications
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid">
        {stats.map((stat, i) => (
          <div key={i} className="card stat-card">
            <div className="stat-icon" style={{ backgroundColor: stat.color, color: stat.text }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Academic Highlights */}
      <div className={styles.highlightsGrid}>
        <div className="card glass stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#f3e8ff", color: "#a855f7" }}>🎓</div>
          <div className="stat-info">
            <span className="stat-label">Average Batch CGPA</span>
            <span className="stat-value">{avgCgpa.toFixed(2)} / 10.0</span>
          </div>
        </div>
        <div className="card glass stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#fef2f2", color: "#f43f5e" }}>⚡</div>
          <div className="stat-info">
            <span className="stat-label">Average Preparation Index</span>
            <span className="stat-value">{avgReadiness.toFixed(1)} %</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ marginTop: "2rem" }}>
        <AdminCharts
          branchData={branchData}
          statusData={statusData}
          companyData={companyData}
        />
      </div>

      {/* Recent Applications */}
      <div className="card" style={{ marginTop: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3>Recent Applications</h3>
          <Link href="/admin/applications" className={styles.moreLink}>
            See all applications →
          </Link>
        </div>
        {recentApplications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            No applications registered in the database yet.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Branch</th>
                  <th>Company</th>
                  <th>Applied On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <strong>{app.student.user.name || "Student"}</strong>
                    </td>
                    <td>{app.student.branch}</td>
                    <td>{app.company.name}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
