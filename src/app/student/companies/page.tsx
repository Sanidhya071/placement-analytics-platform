import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CompanyList from "./CompanyList";

export default async function StudentCompaniesPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  // Fetch student profile (need CGPA for eligibility comparison)
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
  });

  if (!profile) {
    redirect("/student/dashboard");
  }

  // Fetch active company drives
  const companies = await prisma.company.findMany({
    orderBy: {
      deadline: "asc",
    },
  });

  // Fetch student's submitted applications to disable buttons
  const studentApplications = await prisma.application.findMany({
    where: { studentId: profile.id },
    select: { companyId: true },
  });

  const appliedCompanyIds = studentApplications.map((app) => app.companyId);

  // Formatted company array for client component compatibility
  const formattedCompanies = companies.map((c) => ({
    id: c.id,
    name: c.name,
    minCgpa: c.minCgpa,
    packageLpa: c.packageLpa,
    location: c.location,
    requiredSkills: c.requiredSkills,
    deadline: c.deadline.toISOString(),
  }));

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--primary)" }}>Browse Placement Drives</h1>
        <p style={{ color: "var(--text-muted)" }}>
          View active campus recruitment drives, check your academic eligibility limits, and apply.
        </p>
      </div>

      <CompanyList
        companies={formattedCompanies}
        appliedCompanyIds={appliedCompanyIds}
        studentCgpa={profile.cgpa}
      />
    </div>
  );
}
