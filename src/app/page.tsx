import Link from "next/link";
import styles from "./landing.module.css";

export default function LandingPage() {
  return (
    <div className={styles.container}>
      {/* Navbar */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <span className={styles.logoIcon}>🎓</span>
          <span className={styles.logoText}>CareerAnalytics</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/login" className="btn btn-secondary">Sign In</Link>
          <Link href="/signup" className="btn btn-primary">Get Started</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className={styles.main}>
        <section className={styles.hero}>
  <span className={styles.tag}>JSPM RSCOE • CSBS Major Project</span>

  <h1 className={styles.heroTitle}>
    PlacementPro {" "}
    <span className={styles.highlight}>Accelerate Your Placement Journey</span>
  </h1>

  <p className={styles.heroDescription}>
    Track readiness, analyze skill gaps, assess eligibility,
    and receive intelligent career recommendations through a unified placement analytics platform.
  </p>

  <div className={styles.ctaGroup}>
    <Link
      href="/signup"
      className="btn btn-primary"
      style={{ padding: "1rem 2rem" }}
    >
      Student Registration
    </Link>

    <Link
      href="/login"
      className="btn btn-secondary"
      style={{ padding: "1rem 2rem" }}
    >
      Access Portal
    </Link>
  </div>
</section>

        {/* Feature Grid */}
        <section className={styles.features}>
          <div className="card glass">
            <span className={styles.featureIcon}>⚡</span>
            <h3>Readiness Score</h3>
            <p>Get a dynamic readiness index mapped weighted against CGPA, skills, projects, certifications, and assessments.</p>
          </div>

          <div className="card glass">
            <span className={styles.featureIcon}>🎯</span>
            <h3>Skill Gap Analyzer</h3>
            <p>Automatically match profile skills with company requirements to find critical topics missing.</p>
          </div>

          <div className="card glass">
            <span className={styles.featureIcon}>💻</span>
            <h3>DSA Assessment</h3>
            <p>Take integrated data structures & algorithms assessments to boost your profile readiness.</p>
          </div>

          <div className="card glass">
            <span className={styles.featureIcon}>🏢</span>
            <h3>Eligibility Checker</h3>
            <p>Verify live recruitment eligibility based on academic limits and required technical criteria.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 CSBS Major Project. Built with Next.js, MongoDB & Prisma.</p>
      </footer>
    </div>
  );
}
