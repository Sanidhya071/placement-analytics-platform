import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DsaQuiz from "./DsaQuiz";

export default async function StudentAssessmentsPage() {
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
        <h1 style={{ color: "var(--primary)" }}>Technical Assessment Hub</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Validate your technical prowess. Scores are directly fed into the readiness calculator.
        </p>
      </div>

      <DsaQuiz currentDsaScore={profile.dsaScore} />
    </div>
  );
}
