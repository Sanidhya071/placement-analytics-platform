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
    const { status } = await request.json();

    if (!["APPLIED", "SHORTLISTED", "SELECTED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        status,
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json({ error: "Failed to update application status" }, { status: 500 });
  }
}
