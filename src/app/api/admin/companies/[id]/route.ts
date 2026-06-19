import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const { name, minCgpa, packageLpa, location, requiredSkills, deadline } = await request.json();

    const company = await prisma.company.update({
      where: { id },
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
    console.error("Company update error:", error);
    return NextResponse.json({ error: "Failed to update company drive" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;

    // Delete company applications first (cascade)
    await prisma.application.deleteMany({
      where: { companyId: id },
    });

    await prisma.company.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Company delete error:", error);
    return NextResponse.json({ error: "Failed to delete company drive" }, { status: 500 });
  }
}
