"use client";

import { useAuthStore } from "@/stores/authStore";
import { 
  Compass, 
  FileText, 
  CreditCard, 
  Users, 
  ShieldCheck, 
  ArrowRight,
  Clock,
  Sparkles,
  Banknote
} from "lucide-react";
import Link from "next/link";

export default function TenantDashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Assalam-o-Alaikum, {user?.full_name?.split(" ")[0] || "Tenant"} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your rental lease, track monthly rent receipts in PKR, and find verified homes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 text-sm transition-all hover:scale-105 active:scale-95"
          >
            <Compass className="w-4 h-4" />
            <span>Find a Home</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Current Lease</span>
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">None Active</div>
          <div className="text-xs text-slate-500 mt-2">
            No active lease registered yet
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Next Rent Payment</span>
            <Banknote className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">PKR 0</div>
          <div className="text-xs text-slate-500 mt-2">
            All dues clear
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">My Applications</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">0</div>
          <div className="text-xs text-slate-500 mt-2">
            Submitted rental applications
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Identity Status</span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {user?.cnic ? "CNIC Linked" : "Unverified"}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {user?.cnic ? "Ready to apply" : "Link CNIC to apply quickly"}
          </div>
        </div>
      </div>

      {/* Tenant Explore Banner */}
      <div className="rounded-2xl p-8 bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Rental Experience</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Looking for an apartment or portion in {user?.city || "Pakistan"}?
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Every property listed on Rentillect includes verified landlord credentials, transparent security deposit tracking, and standardized digital contracts compliant with local provincial statutes.
          </p>
        </div>

        <Link
          href="/properties"
          className="px-6 py-3 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-md text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2 flex-shrink-0"
        >
          <span>Explore Properties</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
