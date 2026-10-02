"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/api";
import { UserProfile, UserRole } from "@/types";
import { Building, Key, Plus, RefreshCw } from "lucide-react";

export function RoleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, activeRole, switchRole, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  if (!user) {
    const isLandlord = pathname.startsWith("/landlord");
    return (
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
        <Link
          href="/landlord"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            isLandlord
              ? "bg-emerald-600 text-white shadow-sm font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Landlord</span>
        </Link>
        <Link
          href="/tenant"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            !isLandlord
              ? "bg-emerald-600 text-white shadow-sm font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Tenant</span>
        </Link>
      </div>
    );
  }

  const hasLandlord = user.roles.includes("landlord");
  const hasTenant = user.roles.includes("tenant");
  const isDualRole = hasLandlord && hasTenant;

  const handleSwitch = (newRole: UserRole) => {
    switchRole(newRole);
    if (newRole === "landlord") {
      router.push("/landlord");
    } else if (newRole === "tenant") {
      router.push("/tenant");
    } else if (newRole === "admin") {
      router.push("/admin");
    }
  };

  const handleAddRole = async (roleToAdd: UserRole) => {
    setLoading(true);
    try {
      const updatedProfile = await apiClient<UserProfile>("/profiles/me/roles", {
        method: "POST",
        body: JSON.stringify({ role: roleToAdd }),
      });
      updateUser(updatedProfile);
      switchRole(roleToAdd);
      router.push(`/${roleToAdd}`);
    } catch (err: any) {
      alert(err.message || "Failed to add role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
      {hasLandlord && (
        <button
          onClick={() => handleSwitch("landlord")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeRole === "landlord"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Landlord</span>
        </button>
      )}

      {hasTenant && (
        <button
          onClick={() => handleSwitch("tenant")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeRole === "tenant"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Tenant</span>
        </button>
      )}

      {!isDualRole && (
        <button
          disabled={loading}
          onClick={() => handleAddRole(hasLandlord ? "tenant" : "landlord")}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-dashed border-slate-300 dark:border-slate-600"
          title={hasLandlord ? "Unlock Tenant Mode" : "Unlock Landlord Mode"}
        >
          {loading ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Plus className="w-3 h-3" />
          )}
          <span>{hasLandlord ? "+ Tenant Mode" : "+ Landlord Mode"}</span>
        </button>
      )}
    </div>
  );
}
