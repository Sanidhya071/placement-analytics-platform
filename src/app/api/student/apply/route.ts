import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { companyId } = await request.json();
    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    // Fetch Student Profile
    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    // Fetch Company details
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // 1. Eligibility Check: CGPA
    if (student.cgpa < company.minCgpa) {
      return NextResponse.json(
        { error: `Ineligible: Your CGPA (${student.cgpa}) is below the required ${company.minCgpa}.` },
        { status: 400 }
      );
    }

    // 2. Deadline Check
    if (new Date() > new Date(company.deadline)) {
      return NextResponse.json({ error: "Ineligible: Application deadline has passed." }, { status: 400 });
    }

    // 3. Duplicate Application Check
    const existingApplication = await prisma.application.findFirst({
      where: {
        studentId: student.id,
        companyId: company.id,
      },
    });

    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied for this company." }, { status: 400 });
    }

    // Create Application
    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        companyId: company.id,
        status: "APPLIED",
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    console.error("Application error:", error);
    return NextResponse.json(
      { error: "An error occurred while submitting your application." },
      { status: 500 }
    );
  }
}
