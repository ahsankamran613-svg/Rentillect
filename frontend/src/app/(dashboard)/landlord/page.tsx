"use client";

import { useAuthStore } from "@/stores/authStore";
import { 
  Building, 
  FileText, 
  CreditCard, 
  Users, 
  Plus, 
  ArrowUpRight, 
  ShieldCheck, 
  Sparkles,
  Banknote
} from "lucide-react";
import Link from "next/link";

export default function LandlordDashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Assalam-o-Alaikum, {user?.full_name?.split(" ")[0] || "Landlord"} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Overview of your Pakistani rental properties, digital leases, and monthly PKR revenue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 text-sm transition-all hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Properties</span>
            <Building className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">0</div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span>0 occupied • 0 listed</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Revenue</span>
            <Banknote className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">PKR 0</div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span>Expected rent for current month</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Active Leases</span>
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">0</div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span>Legally verified contracts</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Applicants</span>
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">0</div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span>Awaiting screening & review</span>
          </div>
        </div>
      </div>

      {/* Quick Actions & AI Assistant Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl p-6 bg-gradient-to-r from-emerald-900 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Lease Assistant • Gemini AI</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              Provincial Tenancy Compliance Ready
            </h3>
            <p className="text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
              When you upload or draft a lease in Rentillect, our AI legal scanner automatically cross-checks clauses against the Punjab Rented Premises Act 2009, Sindh Ordinance 1979, and ICT 2001 regulations.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-300">
            <span>Status: Phase 1 Operational</span>
            <span className="font-semibold">Next: Property Listings (Phase 2)</span>
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Identity Verification Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {user?.cnic 
                ? `Pakistani CNIC registered (${user.cnic.slice(0, 5)}...${user.cnic.slice(-1)}).`
                : "Add your 13-digit Pakistani CNIC to receive verified landlord status."}
            </p>
          </div>

          <div className="mt-6">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {user?.city ? `Operating in ${user.city}` : "Pakistan"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
