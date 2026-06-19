import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CompaniesManager from "./CompaniesManager";

export default async function AdminCompaniesPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const companies = await prisma.company.findMany({
    orderBy: { deadline: "asc" },
  });

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
        <h1 style={{ color: "var(--primary)" }}>Manage Recruitment Drives</h1>
        <p style={{ color: "var(--text-muted)" }}>Add, update, or remove campus placement listings and establish academic limits.</p>
      </div>

      <CompaniesManager initialCompanies={formattedCompanies} />
    </div>
  );
}
