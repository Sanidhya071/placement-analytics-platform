import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { calculateReadinessScore } from "@/lib/readiness";

export async function PUT(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const {
      branch,
      academicYear,
      cgpa,
      skills,
      certifications,
      projectsCount,
      internshipsCount,
      hackathonsCount,
    } = await request.json();

    // Parse and sanitize
    const cleanCgpa = parseFloat(cgpa);
    const cleanProjectsCount = parseInt(projectsCount) || 0;
    const cleanInternshipsCount = parseInt(internshipsCount) || 0;
    const cleanHackathonsCount = parseInt(hackathonsCount) || 0;
    const cleanAcademicYear = parseInt(academicYear) || 3;

    // Fetch existing profile to preserve DSA score
    const existingProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Recalculate readiness score
    const scoreBreakdown = calculateReadinessScore({
      cgpa: cleanCgpa,
      skillsCount: skills ? skills.length : 0,
      projectsCount: cleanProjectsCount,
      certificationsCount: certifications ? certifications.length : 0,
      dsaScore: existingProfile.dsaScore,
      internshipsCount: cleanInternshipsCount,
      hackathonsCount: cleanHackathonsCount,
    });

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: session.userId },
      data: {
        branch,
        academicYear: cleanAcademicYear,
        cgpa: cleanCgpa,
        skills: skills || [],
        certifications: certifications || [],
        projectsCount: cleanProjectsCount,
        internshipsCount: cleanInternshipsCount,
        hackathonsCount: cleanHackathonsCount,
        readinessScore: scoreBreakdown.totalScore,
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile details." },
      { status: 500 }
    );
  }
}
