import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An internal error occurred during login." },
      { status: 500 }
    );
  }
}
