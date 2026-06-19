import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ApplicationsManager from "./ApplicationsManager";

export default async function AdminApplicationsPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "ADMIN") redirect("/login");

  // Fetch all applications
  const applications = await prisma.application.findMany({
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
  });

  const formattedApps = applications.map((app) => ({
    id: app.id,
    studentName: app.student.user.name || "Student",
    studentEmail: app.student.user.email,
    branch: app.student.branch,
    cgpa: app.student.cgpa,
    readinessScore: app.student.readinessScore,
    companyName: app.company.name,
    appliedAt: app.appliedAt.toISOString(),
    status: app.status,
  }));

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--primary)" }}>Manage Applications</h1>
        <p style={{ color: "var(--text-muted)" }}>Monitor student applications and update selection statuses (Shortlist, Select, Reject).</p>
      </div>

      <ApplicationsManager initialApplications={formattedApps} />
    </div>
  );
}
