import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const companies = await prisma.company.findMany({
      orderBy: { deadline: "asc" },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { name, minCgpa, packageLpa, location, requiredSkills, deadline } = await request.json();

    if (!name || !minCgpa || !packageLpa || !location || !deadline) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const company = await prisma.company.create({
      data: {
        name,
        minCgpa: parseFloat(minCgpa),
        packageLpa: parseFloat(packageLpa),
        location,
        requiredSkills: requiredSkills || [],
        deadline: new Date(deadline),
      },
    });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error("Company create error:", error);
    return NextResponse.json({ error: "Failed to create company drive" }, { status: 500 });
  }
}
