import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export default async function StudentProfilePage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
  });

  if (!profile) {
    redirect("/student/dashboard");
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--primary)" }}>Manage Academic Profile</h1>
        <p style={{ color: "var(--text-muted)" }}>Keep your academics, skills, and projects up-to-date to maintain eligibility and optimize placement readiness.</p>
      </div>

      <ProfileForm initialProfile={profile} />
    </div>
  );
}
