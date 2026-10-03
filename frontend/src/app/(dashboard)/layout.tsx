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
  LogOut, 
  ShieldAlert, 
  Bell, 
  Menu, 
  X,
  Compass,
  ArrowLeftRight,
  Plus,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { UserMenu } from "@/components/shared/UserMenu";
import { apiClient } from "@/lib/api";
import { UserProfile, UserRole } from "@/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, activeRole, logout, checkSession, switchRole, updateUser } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);

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
  const activeSection = (
    pathname.startsWith("/landlord")
      ? "landlord"
      : pathname.startsWith("/tenant")
      ? "tenant"
      : pathname.startsWith("/admin")
      ? "admin"
      : activeRole || "landlord"
  ) as "landlord" | "tenant" | "admin";

  const currentNav =
    activeSection === "admin"
      ? adminNav
      : activeSection === "tenant"
      ? tenantNav
      : landlordNav;

  const hasLandlord = user?.roles?.includes("landlord");
  const hasTenant = user?.roles?.includes("tenant");
  const isDualRole = hasLandlord && hasTenant;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleSwitchPortal = (targetRole: UserRole) => {
    switchRole(targetRole);
    if (targetRole === "landlord") {
      router.push("/landlord");
    } else if (targetRole === "tenant") {
      router.push("/tenant");
    } else if (targetRole === "admin") {
      router.push("/admin");
    }
  };

  const handleUnlockRole = async (roleToUnlock: UserRole) => {
    setLoadingRole(true);
    try {
      const updatedProfile = await apiClient<UserProfile>("/profiles/me/roles", {
        method: "POST",
        body: JSON.stringify({ role: roleToUnlock }),
      });
      updateUser(updatedProfile);
      switchRole(roleToUnlock);
      if (roleToUnlock === "landlord") {
        router.push("/landlord");
      } else {
        router.push("/tenant");
      }
    } catch (err: any) {
      alert(err.message || `Failed to activate ${roleToUnlock} mode`);
    } finally {
      setLoadingRole(false);
    }
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
          {/* Active Portal Header Badge */}
          <div className="px-3 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              <span
                className={`w-2 h-2 rounded-full ${
                  activeSection === "landlord"
                    ? "bg-emerald-500"
                    : activeSection === "tenant"
                    ? "bg-blue-500"
                    : "bg-purple-500"
                }`}
              />
              {`${activeSection} Portal`}
            </span>
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

        {/* User Card & Quick Role Switch (Desktop) */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
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

          {/* Quick Inline Switch for Dual-Role Users */}
          {isDualRole && (
            <button
              onClick={() => handleSwitchPortal(activeSection === "landlord" ? "tenant" : "landlord")}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors"
            >
              <ArrowLeftRight className="w-3 h-3 text-slate-400" />
              <span>Switch to {activeSection === "landlord" ? "Tenant" : "Landlord"} View</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 h-full bg-white dark:bg-slate-900 flex flex-col p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <span className="font-extrabold text-base text-slate-900 dark:text-white">
                Rent<span className="text-emerald-500">illect</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Portal Badge */}
            <div className="pt-3 pb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {`${activeSection} Portal`}
              </span>
              {isDualRole && (
                <button
                  onClick={() => {
                    handleSwitchPortal(activeSection === "landlord" ? "tenant" : "landlord");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>Switch</span>
                </button>
              )}
            </div>

            <div className="flex-1 py-2 space-y-1 overflow-y-auto">
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
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              {!hasLandlord && (
                <button
                  disabled={loadingRole}
                  onClick={() => {
                    handleUnlockRole("landlord");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Become a Landlord</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
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
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:block text-xs text-slate-500 font-medium">
              Rentillect Pakistan • {user?.city || "National"}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Airbnb-Style Quick Switch / CTA Button */}
            {activeSection === "landlord" && (
              <>
                {hasTenant && (
                  <button
                    onClick={() => handleSwitchPortal("tenant")}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
                    title="Switch to Tenant View"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Switch to Tenant</span>
                  </button>
                )}
                <Link
                  href="/landlord/properties/new"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs shadow-emerald-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add Property</span>
                  <span className="sm:hidden">Add</span>
                </Link>
              </>
            )}

            {activeSection === "tenant" && (
              <>
                {hasLandlord ? (
                  <button
                    onClick={() => handleSwitchPortal("landlord")}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
                    title="Switch to Landlord View"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Switch to Landlord</span>
                  </button>
                ) : (
                  <button
                    disabled={loadingRole}
                    onClick={() => handleUnlockRole("landlord")}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 transition-all shadow-xs"
                    title="Start listing properties on Rentillect"
                  >
                    {loadingRole ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <span>Become a Landlord</span>
                  </button>
                )}
              </>
            )}

            {/* Notification Bell */}
            <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-slate-900" />
            </button>

            {/* Airbnb/Upwork User Profile Dropdown Menu */}
            <UserMenu activeSection={activeSection} />
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

