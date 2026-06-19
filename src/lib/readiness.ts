interface ScoreInputs {
  cgpa: number;
  skillsCount: number;
  projectsCount: number;
  certificationsCount: number;
  dsaScore: number;
  internshipsCount: number;
  hackathonsCount: number;
}

export interface ScoreBreakdown {
  cgpaContribution: number;
  skillsContribution: number;
  projectsContribution: number;
  certificationsContribution: number;
  dsaContribution: number;
  experientialContribution: number; // Internships + Hackathons
  totalScore: number;
}

export function calculateReadinessScore(inputs: ScoreInputs): ScoreBreakdown {
  // 1. CGPA (25%): Normalized (CGPA/10) * 25
  const cgpaContribution = Math.min((inputs.cgpa / 10) * 25, 25);

  // 2. Skills (25%): 5% per skill, capped at 5 skills (25%)
  const skillsContribution = Math.min(inputs.skillsCount * 5, 25);

  // 3. Projects (20%): 10% per project, capped at 2 projects (20%)
  const projectsContribution = Math.min(inputs.projectsCount * 10, 20);

  // 4. Certifications (10%): 5% per cert, capped at 2 certs (10%)
  const certificationsContribution = Math.min(inputs.certificationsCount * 5, 10);

  // 5. DSA Assessment (10%): DSA score is out of 100, normalized to 10
  const dsaContribution = Math.min((inputs.dsaScore / 100) * 10, 10);

  // 6. Internships/Hackathons (10%): 5% each, capped at 2 total (10%)
  const experientialContribution = Math.min((inputs.internshipsCount + inputs.hackathonsCount) * 5, 10);

  const totalScore = Math.round(
    cgpaContribution +
    skillsContribution +
    projectsContribution +
    certificationsContribution +
    dsaContribution +
    experientialContribution
  );

  return {
    cgpaContribution: Math.round(cgpaContribution * 10) / 10,
    skillsContribution,
    projectsContribution,
    certificationsContribution,
    dsaContribution: Math.round(dsaContribution * 10) / 10,
    experientialContribution,
    totalScore,
  };
}

// Map score to placement readiness tiers
export function getReadinessTier(score: number): { tier: string; color: string } {
  if (score >= 80) return { tier: "Excellent - High Placement Chance", color: "var(--success)" };
  if (score >= 60) return { tier: "Good - Moderately Prepared", color: "var(--info)" };
  if (score >= 40) return { tier: "Needs Improvement - Skill Gaps Found", color: "var(--warning)" };
  return { tier: "Critical - Not Eligible for Most Drives", color: "var(--danger)" };
}
