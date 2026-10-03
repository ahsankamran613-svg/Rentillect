"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/api";
import { UserProfile, UserRole } from "@/types";
import {
  Building2,
  Key,
  Compass,
  Plus,
  LogOut,
  ChevronDown,
  ArrowLeftRight,
  Shield,
  Sparkles,
  Loader2,
  FileText,
  User,
} from "lucide-react";

interface UserMenuProps {
  activeSection: "landlord" | "tenant" | "admin";
}

export function UserMenu({ activeSection }: UserMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, switchRole, updateUser, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (!user) {
    return (
      <Link
        href="/login"
        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs"
      >
        Sign In
      </Link>
    );
  }

  const hasLandlord = user.roles?.includes("landlord");
  const hasTenant = user.roles?.includes("tenant");
  const hasAdmin = user.roles?.includes("admin");
  const isDualRole = hasLandlord && hasTenant;

  const handleSwitchToRole = (targetRole: UserRole) => {
    switchRole(targetRole);
    setIsOpen(false);
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
      setIsOpen(false);
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

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push("/login");
  };

  const initials = user.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar / Profile Pill Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 sm:pl-2.5 sm:pr-3 rounded-full sm:rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-xs focus:outline-none"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-xs shadow-xs flex-shrink-0">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[120px]">
            {user.full_name}
          </span>
          <span className="text-[10px] text-slate-500 font-medium capitalize">
            {activeSection} Mode
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/10 z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Profile Summary */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-850/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {user.full_name}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {user.email || "Verified User"}
                </div>
              </div>
            </div>

            {/* Active Portal Badge */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">Current View:</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                  activeSection === "landlord"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                    : activeSection === "tenant"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60"
                    : "bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    activeSection === "landlord"
                      ? "bg-emerald-500"
                      : activeSection === "tenant"
                      ? "bg-blue-500"
                      : "bg-purple-500"
                  }`}
                />
                {activeSection} Portal
              </span>
            </div>
          </div>

          {/* Airbnb / Upwork Style Role Switcher Section */}
          <div className="p-2 space-y-1">
            {/* If user is currently in Landlord Mode and has Tenant role */}
            {activeSection === "landlord" && hasTenant && (
              <button
                onClick={() => handleSwitchToRole("tenant")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      Switch to Tenant Portal
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Browse homes, leases & pay rent
                    </div>
                  </div>
                </div>
                <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            {/* If user is currently in Tenant Mode and has Landlord role */}
            {activeSection === "tenant" && hasLandlord && (
              <button
                onClick={() => handleSwitchToRole("landlord")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      Switch to Landlord Portal
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Manage listings, leases & collect rent
                    </div>
                  </div>
                </div>
                <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            {/* Single Role Tenant: "Become a Landlord" action */}
            {!hasLandlord && (
              <button
                disabled={loadingRole}
                onClick={() => handleUnlockRole("landlord")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-800/40 hover:from-emerald-100 hover:to-teal-100 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    {loadingRole ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                      Become a Landlord
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      List properties & legal digital leases
                    </div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </button>
            )}

            {/* Single Role Landlord: "Activate Tenant Mode" */}
            {!hasTenant && (
              <button
                disabled={loadingRole}
                onClick={() => handleUnlockRole("tenant")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    {loadingRole ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Activate Tenant Mode
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Apply for rentals & track payments
                    </div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>
            )}

            {/* Admin link if user has admin role */}
            {hasAdmin && activeSection !== "admin" && (
              <button
                onClick={() => handleSwitchToRole("admin")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Admin Moderation
                    </div>
                    <div className="text-[10px] text-slate-500">Platform control panel</div>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Quick Platform Links */}
          <div className="p-2 space-y-0.5">
            <Link
              href="/properties"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Compass className="w-4 h-4 text-slate-400" />
              <span>Browse Marketplace</span>
            </Link>

            {activeSection === "landlord" && (
              <Link
                href="/landlord/properties/new"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ List New Property</span>
              </Link>
            )}

            {activeSection === "tenant" && (
              <Link
                href="/tenant/lease"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>My Active Lease</span>
              </Link>
            )}
          </div>

          {/* Log Out */}
          <div className="p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
