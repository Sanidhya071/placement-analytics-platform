import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { calculateReadinessScore, getReadinessTier } from "@/lib/readiness";
import Link from "next/link";
import styles from "./dashboard.module.css";

export default async function StudentDashboard() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  // Fetch student profile along with applications
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
    include: {
      applications: {
        include: {
          company: true,
        },
        orderBy: {
          appliedAt: "desc",
        },
      },
    },
  });

  if (!profile) {
    return (
      <div className="card glass" style={{ textAlign: "center", padding: "3rem" }}>
        <h2>Profile Not Initialized</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
          Please contact administration or try re-logging to initialize your academic profile.
        </p>
      </div>
    );
  }

  // Calculate score breakdown
  const breakdown = calculateReadinessScore({
    cgpa: profile.cgpa,
    skillsCount: profile.skills.length,
    projectsCount: profile.projectsCount,
    certificationsCount: profile.certifications.length,
    dsaScore: profile.dsaScore,
    internshipsCount: profile.internshipsCount,
    hackathonsCount: profile.hackathonsCount,
  });

  // Update score in database if it has changed
  if (profile.readinessScore !== breakdown.totalScore) {
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: { readinessScore: breakdown.totalScore },
    });
  }

  const readinessTier = getReadinessTier(breakdown.totalScore);

  // Stats for cards
const stats = [
  {
    label: "Current CGPA",
    value: profile.cgpa.toFixed(2),
    icon: "🎓",
    color: "rgba(59,130,246,0.15)",
    text: "#60a5fa",
  },
  {
    label: "Skills Added",
    value: profile.skills.length,
    icon: "🛠️",
    color: "rgba(34,197,94,0.15)",
    text: "#22c55e",
  },
  {
    label: "DSA Score",
    value: `${profile.dsaScore}%`,
    icon: "💻",
    color: "rgba(6,182,212,0.15)",
    text: "#06b6d4",
  },
  {
    label: "Applications",
    value: profile.applications.length,
    icon: "📤",
    color: "rgba(245,158,11,0.15)",
    text: "#f59e0b",
  },
];

  return (
    <div>
      <div className={styles.welcomeSection}>
  <div>
    <h1 className={styles.welcomeTitle}>
      Welcome back, {session.name || "Student"} 👋
    </h1>

    <p className={styles.welcomeSubtitle}>
      {profile.branch} • {profile.academicYear}rd Year
    </p>

    <div style={{ marginTop: "1rem" }}>
      <span className="badge badge-success">
        Placement Readiness: {breakdown.totalScore}%
      </span>
    </div>
  </div>

  <Link href="/student/profile" className="btn btn-primary">
    ✏️ Edit Profile
  </Link>
</div>

      {/* Stats Cards */}
<div className="dashboard-grid">
  {stats.map((stat, i) => (
    <div
      key={i}
      className="card stat-card"
      style={{
  background:
    "linear-gradient(135deg, rgba(17,25,40,0.95), rgba(30,41,59,0.95))",
}}
    >
      <div
        className="stat-icon"
        style={{
          backgroundColor: stat.color,
          color: stat.text,
        }}
      >
        {stat.icon}
      </div>

      <div className="stat-info">
        <span className="stat-label">{stat.label}</span>
        <span className="stat-value">{stat.value}</span>
      </div>
    </div>
  ))}
</div>

{/* Quick Insights */}
<div
  className="dashboard-grid"
  style={{ marginBottom: "2rem" }}
>
  <div className="card">
    <h3>🎯 Target Package</h3>
    <p style={{ marginTop: "0.5rem" }}>
      8 - 12 LPA
    </p>
  </div>

  <div className="card">
    <h3>🏆 Readiness Tier</h3>
    <p style={{ marginTop: "0.5rem" }}>
      {readinessTier.tier}
    </p>
  </div>

  <div className="card">
    <h3>📈 Improvement Required</h3>
    <p style={{ marginTop: "0.5rem" }}>
      {100 - breakdown.totalScore}%
    </p>
  </div>
</div>

<div className={styles.dashboardLayoutGrid}>
        {/* Placement Readiness Card */}
        <div
  className="card glass"
  style={{
  gridColumn:"span 2",
}}
>
  <div className={styles.cardHeader}>
    <h3>🎯 Placement Readiness Score</h3>
    <span className="badge badge-success">
      Live Analytics
    </span>
  </div>
          
          <div className={styles.readinessContainer}>
  <div className={styles.radialProgressContainer}>
    <div
      className={styles.radialProgress}
      style={{
        background: `conic-gradient(
          #2563eb ${breakdown.totalScore * 3.6}deg,
          #7c3aed ${breakdown.totalScore * 2}deg,
          var(--border) 0deg
        )`,
        boxShadow:
          "0 0 30px rgba(37,99,235,0.15), 0 0 60px rgba(124,58,237,0.10)",
      }}
    >
      <div className={styles.radialProgressInner}>
        <span className={styles.scoreNumber}>
          {breakdown.totalScore}
        </span>

        <span className={styles.scoreText}>
          out of 100
        </span>
      </div>
    </div>

    <div
      style={{
        marginTop: "1rem",
        textAlign: "center",
        padding: "0.75rem",
        borderRadius: "12px",
        background: "rgba(37,99,235,0.05)",
      }}
    >
      <span
        className={styles.tierText}
        style={{
          color: readinessTier.color,
          fontWeight: 700,
        }}
      >
        🏆 {readinessTier.tier}
      </span>
    </div>
  </div>

            <div className={styles.breakdownList}>
  <h4
    style={{
      marginBottom: "1rem",
      fontSize: "0.95rem",
      color: "var(--text-muted)",
      fontWeight: 700,
    }}
  >
    📊 READINESS ANALYTICS BREAKDOWN
  </h4>

  <div className={styles.breakdownItem}>
    <div className={styles.breakdownHeader}>
      <span>🎓 CGPA (25% Weight)</span>
      <strong>{breakdown.cgpaContribution} / 25</strong>
    </div>

    <div className={styles.progressBar}>
      <div
        className={styles.progressFill}
        style={{
          width: `${(breakdown.cgpaContribution / 25) * 100}%`,
        }}
      ></div>
    </div>
  </div>

  <div className={styles.breakdownItem}>
    <div className={styles.breakdownHeader}>
      <span>💻 Technical Skills (25% Weight)</span>
      <strong>{breakdown.skillsContribution} / 25</strong>
    </div>

    <div className={styles.progressBar}>
      <div
        className={styles.progressFill}
        style={{
          width: `${(breakdown.skillsContribution / 25) * 100}%`,
          backgroundColor: "var(--success)",
        }}
      ></div>
    </div>
  </div>

              <div className={styles.breakdownItem}>
  <div className={styles.breakdownHeader}>
    <span>🚀 Projects (20% Weight)</span>
    <strong>{breakdown.projectsContribution} / 20</strong>
  </div>

  <div className={styles.progressBar}>
    <div
      className={styles.progressFill}
      style={{
        width: `${(breakdown.projectsContribution / 20) * 100}%`,
        backgroundColor: "var(--info)",
      }}
    ></div>
  </div>
</div>

<div className={styles.breakdownItem}>
  <div className={styles.breakdownHeader}>
    <span>📜 Certifications (10% Weight)</span>
    <strong>{breakdown.certificationsContribution} / 10</strong>
  </div>

  <div className={styles.progressBar}>
    <div
      className={styles.progressFill}
      style={{
        width: `${(breakdown.certificationsContribution / 10) * 100}%`,
        backgroundColor: "var(--warning)",
      }}
    ></div>
  </div>
</div>

<div className={styles.breakdownItem}>
  <div className={styles.breakdownHeader}>
    <span>🧠 DSA Assessment (10% Weight)</span>
    <strong>{breakdown.dsaContribution} / 10</strong>
  </div>

  <div className={styles.progressBar}>
    <div
      className={styles.progressFill}
      style={{
        width: `${(breakdown.dsaContribution / 10) * 100}%`,
        backgroundColor: "#8b5cf6",
      }}
    ></div>
  </div>
</div>

<div className={styles.breakdownItem}>
  <div className={styles.breakdownHeader}>
    <span>🏆 Internships & Hackathons (10% Weight)</span>
    <strong>{breakdown.experientialContribution} / 10</strong>
  </div>

  <div className={styles.progressBar}>
    <div
      className={styles.progressFill}
      style={{
        width: `${(breakdown.experientialContribution / 10) * 100}%`,
        backgroundColor: "var(--secondary)",
      }}
    ></div>
  </div>
</div>

<div
  className="card"
  style={{
    marginTop: "2rem",
    background:
  "linear-gradient(135deg, rgba(17,25,40,0.95), rgba(30,41,59,0.95))",
    border: "1px solid rgba(37,99,235,0.08)",
  }}
>
  <h4>🚀 Career Recommendation</h4>

  <p style={{ marginTop: "0.75rem" }}>
    Recommended Path:
    <strong> Software Engineer</strong>
  </p>

  <p>
    Current Tier:
    <strong> {readinessTier.tier}</strong>
  </p>

  <p>
    Suggested Focus:
    React, Node.js, System Design
  </p>

  <p>
    Target Package:
    8-12 LPA
  </p>
</div>

</div>
</div>
</div>



        {/* Career Readiness & Recommendations */}
<div
  className="card glass"
  style={{
  display:"flex",
  flexDirection:"column",
  gap:"1.5rem",
}}
>
  <div className={styles.cardHeader}>
    <h3>🚀 Career Readiness Actions</h3>

    <span className="badge badge-success">
      Personalized
    </span>
  </div>

  <div className={styles.guidanceCard}>
    <div className={styles.guidanceStep}>
      <div className={styles.stepNum}>1</div>

      <div>
        <h4>🧠 Boost Your DSA Score</h4>

        <p>
          Complete the DSA Assessment module to improve
          interview performance and increase your readiness score.
        </p>

        <Link
          href="/student/assessments"
          className={styles.actionLink}
        >
          Start Assessment →
        </Link>
      </div>
    </div>

    <div className={styles.guidanceStep}>
      <div className={styles.stepNum}>2</div>

      <div>
        <h4>🎯 Analyze Skill Gaps</h4>

        <p>
          Compare your skills with company requirements and
          identify missing technologies.
        </p>

        <Link
          href="/student/guidance"
          className={styles.actionLink}
        >
          Analyze Skill Gaps →
        </Link>
      </div>
    </div>

    <div className={styles.guidanceStep}>
      <div className={styles.stepNum}>3</div>

      <div>
        <h4>🏢 Explore Placement Drives</h4>

        <p>
          Discover active opportunities and check
          eligibility before applying.
        </p>

        <Link
          href="/student/companies"
          className={styles.actionLink}
        >
          Browse Companies →
        </Link>
      </div>
    </div>

    <div
      className="card"
      style={{
        marginTop: "1rem",
        background:
  "linear-gradient(135deg, rgba(17,25,40,0.95), rgba(30,41,59,0.95))",
      }}
    >
      <h4>📈 Placement Forecast</h4>

      <p style={{ marginTop: "0.5rem" }}>
        Current Tier:
        <strong> {readinessTier.tier}</strong>
      </p>

      <p>
        Readiness Score:
        <strong> {breakdown.totalScore}%</strong>
      </p>

      <p>
        Recommended Package:
        <strong> 8-12 LPA</strong>
      </p>

      <p>
        Next Milestone:
        <strong> Reach 85% Readiness</strong>
      </p>
    </div>
  </div>
</div>

</div>


{/* Applications & Company Tracking */}
<div
  className="card"
  style={{
  marginTop:"2rem",
}}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.25rem",
    }}
  >
    <h3>🏢 My Applied Companies</h3>

    <span className="badge badge-info">
      {profile.applications.length} Applications
    </span>
  </div>

  {profile.applications.length === 0 ? (
    <div
      style={{
        textAlign: "center",
        padding: "3rem",
        color: "var(--text-muted)",
      }}
    >
      <h4>🚀 No Applications Yet</h4>

      <p style={{ marginTop: "0.5rem" }}>
        Start applying to placement drives to track
        your progress here.
      </p>

      <div style={{ marginTop: "1rem" }}>
        <Link
          href="/student/companies"
          className="btn btn-primary"
        >
          Browse Companies
        </Link>
      </div>
    </div>
  ) : (
    <>
      <div
        className="dashboard-grid"
        style={{ marginBottom: "1.5rem" }}
      >
        <div className="card">
          <h4>📤 Applied</h4>
          <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            {
              profile.applications.filter(
                (a) => a.status === "APPLIED"
              ).length
            }
          </p>
        </div>

        <div className="card">
          <h4>📋 Shortlisted</h4>
          <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            {
              profile.applications.filter(
                (a) => a.status === "SHORTLISTED"
              ).length
            }
          </p>
        </div>

        <div className="card">
          <h4>🎉 Selected</h4>
          <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            {
              profile.applications.filter(
                (a) => a.status === "SELECTED"
              ).length
            }
          </p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Package</th>
              <th>Location</th>
              <th>Applied On</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {profile.applications.map((app) => (
              <tr key={app.id}>
                <td>
                  <strong>{app.company.name}</strong>
                </td>

                <td>
                  ₹ {app.company.packageLpa} LPA
                </td>

                <td>{app.company.location}</td>

                <td>
                  {new Date(
                    app.appliedAt
                  ).toLocaleDateString()}
                </td>

                <td>
                  <span
                    className={`badge ${
                      app.status === "SELECTED"
                        ? "badge-success"
                        : app.status === "SHORTLISTED"
                        ? "badge-info"
                        : app.status === "REJECTED"
                        ? "badge-danger"
                        : "badge-warning"
                    }`}
                  >
                    {app.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )}
</div>

</div>
);
}
