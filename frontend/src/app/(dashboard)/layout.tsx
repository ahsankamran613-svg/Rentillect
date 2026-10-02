"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Building2, 
  Home, 
  Building, 
  FileText, 
  CreditCard, 
  Users, 
  MessageSquare, 
  Search, 
  LogOut, 
  ShieldAlert, 
  Bell, 
  Menu, 
  X,
  Compass,
  Key
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, activeRole, logout, checkSession, loading, switchRole } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Landlord Nav Items
  const landlordNav = [
    { label: "Overview", href: "/landlord", icon: Home },
    { label: "Properties", href: "/landlord/properties", icon: Building },
    { label: "Leases", href: "/landlord/leases", icon: FileText },
    { label: "Rent Payments", href: "/landlord/payments", icon: CreditCard },
    { label: "Applications", href: "/landlord/applications", icon: Users },
    { label: "Messages", href: "/landlord/chat", icon: MessageSquare },
  ];

  // Tenant Nav Items
  const tenantNav = [
    { label: "Overview", href: "/tenant", icon: Home },
    { label: "Browse Homes", href: "/properties", icon: Compass },
    { label: "My Lease", href: "/tenant/lease", icon: FileText },
    { label: "Payments & Ledger", href: "/tenant/payments", icon: CreditCard },
    { label: "Applications", href: "/tenant/applications", icon: Users },
    { label: "Landlord Chat", href: "/tenant/chat", icon: MessageSquare },
  ];

  // Admin Nav Items
  const adminNav = [
    { label: "Overview", href: "/admin", icon: Home },
    { label: "User Moderation", href: "/admin/users", icon: Users },
    { label: "Orphaned Properties", href: "/admin/orphaned", icon: ShieldAlert },
  ];

  // Determine current active section:
  // 1. Current URL pathname takes precedence (/landlord vs /tenant vs /admin)
  // 2. Fallback to activeRole in store
  // 3. Fallback to "landlord"
  const activeSection = pathname.startsWith("/landlord")
    ? "landlord"
    : pathname.startsWith("/tenant")
    ? "tenant"
    : pathname.startsWith("/admin")
    ? "admin"
    : activeRole || "landlord";

  const currentNav =
    activeSection === "admin"
      ? adminNav
      : activeSection === "tenant"
      ? tenantNav
      : landlordNav;

  // Auto-sync activeRole in store if user has permission
  useEffect(() => {
    if (user && user.roles.includes(activeSection as any) && activeRole !== activeSection) {
      switchRole(activeSection as any);
    }
  }, [pathname, user, activeRole, activeSection, switchRole]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isItemActive = (href: string) => {
    if (href === "/landlord" || href === "/tenant" || href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 h-screen">
        {/* Brand */}
        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              Rent<span className="text-emerald-500">illect</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {`${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Portal`}
          </div>
          {currentNav.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                {user?.full_name ? user.full_name[0].toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.full_name || "Guest"}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {user?.email || ""}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-64 h-full bg-white dark:bg-slate-900 flex flex-col p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <span className="font-extrabold text-base text-slate-900 dark:text-white">
                Rent<span className="text-emerald-500">illect</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 py-4 space-y-1">
              <div className="px-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {`${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Portal`}
              </div>
              {currentNav.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:block text-xs text-slate-500 font-medium">
              Rentillect Pakistan • {user?.city || "National"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Dual Role Switcher */}
            <RoleSwitcher />

            {/* Notification Bell */}
            <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-slate-900" />
            </button>
          </div>
        </header>

        {/* Main View */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
