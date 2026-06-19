import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, name, role, branch, academicYear, cgpa } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required fields." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
        role: role === "ADMIN" ? "ADMIN" : "STUDENT",
      },
    });

    if (user.role === "STUDENT") {
      const cleanCgpa = cgpa ? parseFloat(cgpa) : 0.0;
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          branch: branch || "Computer Science & Business Systems",
          academicYear: academicYear ? parseInt(academicYear) : 3,
          cgpa: cleanCgpa,
          skills: [],
          certifications: [],
          projectsCount: 0,
          internshipsCount: 0,
          hackathonsCount: 0,
          dsaScore: 0,
          readinessScore: Math.round((cleanCgpa / 10) * 25),
        },
      });
    }

    const token = await createSessionToken({
      userId: user.id,
      name: user.name || email.split("@")[0],
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    });

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An internal error occurred during signup." },
      { status: 500 }
    );
  }
}
