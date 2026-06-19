"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./sidebar.module.css";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const studentLinks = [
    { name: "Dashboard", path: "/student/dashboard", icon: "📊" },
    { name: "My Profile", path: "/student/profile", icon: "👤" },
    { name: "Browse Jobs", path: "/student/companies", icon: "💼" },
    { name: "Skill Gap & Guidance", path: "/student/guidance", icon: "🎯" },
    { name: "DSA Assessments", path: "/student/assessments", icon: "💻" },
  ];

  const adminLinks = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📈" },
    { name: "Manage Companies", path: "/admin/companies", icon: "🏢" },
    { name: "Student Directory", path: "/admin/students", icon: "👥" },
    { name: "Applications List", path: "/admin/applications", icon: "📝" },
  ];

  const links = user.role === "ADMIN" ? adminLinks : studentLinks;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>🎓</div>
        <div className={styles.brandName}>
          <span>CAREER</span>
          <span className={styles.brandSub}>PORTAL</span>
        </div>
      </div>

      <div className={styles.userProfile}>
        <div className={styles.avatar}>
          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user.name || "User"}</div>
          <span className={`${styles.roleBadge} ${user.role === "ADMIN" ? styles.adminBadge : styles.studentBadge}`}>
            {user.role}
          </span>
        </div>
      </div>

      <nav className={styles.navigation}>
        {links.map((link) => {
          const isActive = pathname === link.path || pathname.startsWith(link.path + "/");
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`${styles.navLink} ${isActive ? styles.activeLink : ""}`}
            >
              <span className={styles.linkIcon}>{link.icon}</span>
              <span className={styles.linkLabel}>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <span className={styles.linkIcon}>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
