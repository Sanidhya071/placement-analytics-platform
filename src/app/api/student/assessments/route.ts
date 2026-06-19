import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { calculateReadinessScore } from "@/lib/readiness";

const DSA_QUESTIONS = [
  { id: 1, correct: "B" }, // What is the time complexity of searching in a Balanced BST? -> O(log n)
  { id: 2, correct: "C" }, // Which data structure uses FIFO? -> Queue
  { id: 3, correct: "A" }, // What is the worst case complexity of QuickSort? -> O(n^2)
  { id: 4, correct: "D" }, // Which algorithm is used for Single Source Shortest Path? -> Dijkstra's
  { id: 5, correct: "B" }, // What is the space complexity of merge sort? -> O(n)
];

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { answers } = await request.json(); // Map of { [questionId]: answerLetter }
    if (!answers) {
      return NextResponse.json({ error: "No answers provided" }, { status: 400 });
    }

    // Calculate score
    let correctCount = 0;
    DSA_QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correct) {
        correctCount++;
      }
    });

    const scorePercentage = (correctCount / DSA_QUESTIONS.length) * 100;

    // Fetch existing student profile
    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    // Save assessment record
    await prisma.dSAAssessment.create({
      data: {
        studentId: student.id,
        score: scorePercentage,
        details: JSON.stringify(answers),
      },
    });

    // Recalculate readiness score using new DSA score
    const scoreBreakdown = calculateReadinessScore({
      cgpa: student.cgpa,
      skillsCount: student.skills.length,
      projectsCount: student.projectsCount,
      certificationsCount: student.certifications.length,
      dsaScore: scorePercentage,
      internshipsCount: student.internshipsCount,
      hackathonsCount: student.hackathonsCount,
    });

    // Update student profile
    await prisma.studentProfile.update({
      where: { id: student.id },
      data: {
        dsaScore: scorePercentage,
        readinessScore: scoreBreakdown.totalScore,
      },
    });

    return NextResponse.json({
      success: true,
      score: scorePercentage,
      correctCount,
      totalCount: DSA_QUESTIONS.length,
      newReadinessScore: scoreBreakdown.totalScore,
    });
  } catch (error) {
    console.error("Assessment submit error:", error);
    return NextResponse.json({ error: "Failed to submit assessment" }, { status: 500 });
  }
}
