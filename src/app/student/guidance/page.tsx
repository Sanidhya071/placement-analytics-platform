import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./guidance.module.css";

// Interface for career recommendations
interface Recommendation {
  role: string;
  matchScore: number;
  priority: "High" | "Medium" | "Low";
  reason: string;
  actionItems: string[];
}

export default async function GuidancePage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  // Fetch Student Profile
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
  });

  if (!profile) {
    redirect("/student/dashboard");
  }

  // Fetch all companies to map required skills
  const companies = await prisma.company.findMany();

  // ----------------------------------------------------
  // SKILL GAP ANALYZER LOGIC
  // ----------------------------------------------------
  // 1. Gather all demanded skills
  const skillDemandMap: Record<string, { count: number; companies: string[] }> = {};
  
  companies.forEach((company) => {
    company.requiredSkills.forEach((skill) => {
      const normalizedSkill = skill.trim().toLowerCase();
      // Capitalize first letter for display
      const displaySkill = skill.trim();

      if (!skillDemandMap[normalizedSkill]) {
        skillDemandMap[normalizedSkill] = { count: 0, companies: [] };
      }
      skillDemandMap[normalizedSkill].count += 1;
      if (!skillDemandMap[normalizedSkill].companies.includes(company.name)) {
        skillDemandMap[normalizedSkill].companies.push(company.name);
      }
    });
  });

  // 2. Compare with student skills (normalize student skills)
  const studentSkillsNormalized = profile.skills.map((s) => s.trim().toLowerCase());
  
  // 3. Find missing skills (Skill Gaps)
  const skillGaps = Object.entries(skillDemandMap)
    .filter(([skill]) => !studentSkillsNormalized.includes(skill))
    .map(([skill, details]) => {
      // Find the proper casing for display
      const matchingCompanySkill = companies
        .flatMap((c) => c.requiredSkills)
        .find((s) => s.trim().toLowerCase() === skill) || skill;

      return {
        name: matchingCompanySkill.trim(),
        demandCount: details.count,
        demandedBy: details.companies,
      };
    })
    .sort((a, b) => b.demandCount - a.demandCount); // sort by highest demand first

  // ----------------------------------------------------
  // RULE-BASED CAREER GUIDANCE ENGINE LOGIC
  // ----------------------------------------------------
  const studentSkills = studentSkillsNormalized;
  const cgpa = profile.cgpa;
  const dsa = profile.dsaScore;
  const projects = profile.projectsCount;

  const recommendations: Recommendation[] = [];

  // Rule 1: Product SDE (High eligibility needed)
  if (cgpa >= 8.0 && dsa >= 60) {
    const hasLang = studentSkills.some(s => ["java", "cpp", "c++", "python", "javascript"].includes(s));
    recommendations.push({
      role: "Product SDE (Software Development Engineer)",
      matchScore: hasLang ? 85 : 70,
      priority: "High",
      reason: `Matches your strong academic baseline (CGPA ${cgpa}) and qualifying DSA score (${dsa}%).`,
      actionItems: [
        "Learn system design concepts.",
        "Add at least 1 complex full-stack project in your profile.",
        "Target companies: Amazon, Google, Uber, Salesforce."
      ]
    });
  }

  // Rule 2: CSBS Special - Business Analyst / Consultant (Academics + Business/SQL skills)
  const hasBusinessSkills = studentSkills.some(s => ["sql", "excel", "management", "tableau", "powerbi"].includes(s));
  if (cgpa >= 7.0) {
    recommendations.push({
      role: "Business Systems Analyst / Consultant",
      matchScore: hasBusinessSkills ? 90 : 75,
      priority: "High",
      reason: "Aligned with the CSBS curriculum bridging technology and management sciences.",
      actionItems: [
        hasBusinessSkills ? "Excellent! Deepen SQL query building." : "Learn SQL and basic data visualization.",
        "Obtain a certification in Agile/Scrum or Project Management.",
        "Target companies: Deloitte, EY, TCS Digital, PwC."
      ]
    });
  }

  // Rule 3: Frontend / Full-Stack Web Developer (Development skills)
  const hasWebSkills = studentSkills.some(s => ["react", "node", "javascript", "html", "css", "mongodb", "nextjs"].includes(s));
  if (hasWebSkills || projects >= 2) {
    recommendations.push({
      role: "Frontend / Full-stack Developer",
      matchScore: hasWebSkills ? 95 : 75,
      priority: "High",
      reason: "Triggered by your active interest in web development tools or projects.",
      actionItems: [
        "Ensure your GitHub link displays complete project deployment readmes.",
        "Practice API integrations and basic cloud deployments.",
        "Target companies: Razorpay, Flipkart, TCS Innovator."
      ]
    });
  }

  // Rule 4: Data Analyst / Data Scientist (Data science stack)
  const hasDataSkills = studentSkills.some(s => ["python", "r", "machine learning", "pandas", "sql", "tableau"].includes(s));
  const hasDataCert = profile.certifications.some(c => c.toLowerCase().includes("data") || c.toLowerCase().includes("analytics"));
  if (hasDataSkills || hasDataCert) {
    recommendations.push({
      role: "Data Analyst / Associate Scientist",
      matchScore: (hasDataSkills && hasDataCert) ? 95 : 70,
      priority: "Medium",
      reason: "Triggered by data manipulation skills or certifications found in your profile.",
      actionItems: [
        "Create a project executing end-to-end data cleaning, EDA, and model prediction.",
        "Practice advanced SQL queries (Joins, Window functions).",
        "Target companies: Mu Sigma, Fractal Analytics, EY."
      ]
    });
  }

  // Fallback: Associate Systems Engineer (Standard entry-level tech roles)
  if (recommendations.length === 0) {
    recommendations.push({
      role: "Associate Software Engineer / Systems Engineer",
      matchScore: 60,
      priority: "Medium",
      reason: "Default recommendation for computer systems careers.",
      actionItems: [
        "Add core languages like Java or Python to your skills.",
        "Attempt assessments to raise your DSA scores.",
        "Target companies: TCS Ninja, Cognizant, Infosys."
      ]
    });
  }

  // Sort recommendations by matchScore
  recommendations.sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--primary)" }}>Career Guidance & Gap Analysis</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Rule-based expert recommendation system comparing your profile elements against real recruiter demand.
        </p>
      </div>

      <div className={styles.guidanceGrid}>
        
        {/* Left: Skill Gap Analyzer */}
        <div className="card glass">
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", marginBottom: "1.25rem" }}>
            <h3>Skill Gap Analyzer</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              The following skills are required by active campus drives but are missing from your profile.
            </p>
          </div>

          {skillGaps.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--success)" }}>
              🎉 <strong>Zero Gaps Found!</strong> Your profile covers all skills demanded by current drives.
            </div>
          ) : (
            <div className={styles.gapList}>
              {skillGaps.map((gap, i) => (
                <div key={i} className={styles.gapItem}>
                  <div className={styles.gapHeader}>
                    <span className={styles.gapName}>{gap.name}</span>
                    <span className="badge badge-warning" style={{ fontSize: "0.75rem" }}>
                      Demanded by {gap.demandCount} {gap.demandCount === 1 ? "drive" : "drives"}
                    </span>
                  </div>
                  <div className={styles.gapDetails}>
                    <span>Required for: <strong>{gap.demandedBy.join(", ")}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Guidance Recommendations */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div className="card glass" style={{ paddingBottom: "1rem" }}>
            <h3>Guidance Recommendations</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Tailored career paths matching your profile constraints.
            </p>

            <div className={styles.recList}>
              {recommendations.map((rec, i) => (
                <div key={i} className={styles.recItem}>
                  <div className={styles.recHeader}>
                    <h4>{rec.role}</h4>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span className="badge badge-success" style={{ fontSize: "0.75rem" }}>
                        {rec.matchScore}% Match
                      </span>
                      <span className={`badge ${rec.priority === "High" ? "badge-danger" : "badge-info"}`} style={{ fontSize: "0.75rem" }}>
                        {rec.priority} Priority
                      </span>
                    </div>
                  </div>
                  
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                    {rec.reason}
                  </p>

                  <div className={styles.actionItemsBlock}>
                    <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-main)", textTransform: "uppercase" }}>
                      Roadmap Actions:
                    </span>
                    <ul className={styles.actionList}>
                      {rec.actionItems.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
