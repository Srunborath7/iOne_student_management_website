"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/auth.store";

const teacherRoutes = new Set(["/dashboard", "/course-reports", "/class-monitor", "/teachers"]);

export default function RoleGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setAuthorized(false);
    let active = true;
    const { token, checkAuth } = useAuthStore.getState();
    if (!token) {
      router.replace("/login");
      return;
    }
    void checkAuth().then(() => {
      if (!active) return;
      const user = useAuthStore.getState().user;
      if (!user) {
        router.replace("/login");
        return;
      }
      const role = user.role.toLowerCase();
      const route = `/${pathname.split("/")[1] ?? ""}`;
      if (role === "teacher" && !teacherRoutes.has(route)) {
        router.replace("/dashboard");
        return;
      }
      if (role !== "teacher" && role !== "admin" && role !== "manager") {
        router.replace("/login");
        return;
      }
      setAuthorized(true);
    });
    return () => { active = false; };
  }, [hydrated, pathname, router]);

  if (!authorized) {
    return <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">Checking access...</div>;
  }
  return children;
}
