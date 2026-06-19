import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentsDirectory from "./StudentsDirectory";

export default async function AdminStudentsPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "ADMIN") redirect("/login");

  // Fetch all students with profile
  const studentProfiles = await prisma.studentProfile.findMany({
    include: {
      user: true,
    },
    orderBy: {
      readinessScore: "desc",
    },
  });

  const formattedStudents = studentProfiles.map((sp) => ({
    id: sp.id,
    name: sp.user.name || "Student",
    email: sp.user.email,
    branch: sp.branch,
    academicYear: sp.academicYear,
    cgpa: sp.cgpa,
    readinessScore: sp.readinessScore,
    skills: sp.skills,
  }));

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--primary)" }}>Student Placement Readiness Directory</h1>
        <p style={{ color: "var(--text-muted)" }}>Search, analyze skill profiles, and track readiness indices across departments.</p>
      </div>

      <StudentsDirectory students={formattedStudents} />
    </div>
  );
}
