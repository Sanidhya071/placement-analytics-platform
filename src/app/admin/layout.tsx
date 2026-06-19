import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();
  
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="dashboard-layout">
      <Sidebar user={session} />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
