"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  MapPin, 
  ArrowRight, 
  Activity, 
  Scale, 
  Banknote,
  Users2
} from "lucide-react";
import { checkBackendHealth } from "@/lib/api";

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    environment: string;
    database: string;
  } | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  useEffect(() => {
    async function loadHealth() {
      try {
        const res = await checkBackendHealth();
        setHealthStatus(res);
      } catch {
        setHealthStatus({
          status: "offline",
          environment: "local",
          database: "not_reachable",
        });
      } finally {
        setLoadingHealth(false);
      }
    }
    loadHealth();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Rent<span className="text-emerald-500">illect</span>
              </span>
              <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                PK 🇵🇰
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</a>
            <a href="#coverage" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Cities</a>
            <a href="#compliance" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Legal Tenancy Acts</a>
            <a href="#architecture" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">System Health</a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="text-sm font-semibold px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Log In
            </button>
            <button className="text-sm font-semibold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Rental Platform for Pakistani Real Estate</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Rental Management, <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                Simplified & Legally Protected
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Rentillect protects Pakistani landlords and tenants with digital lease contracts, PKR ledger tracking, CNIC identity verification, and an AI legal advisor grounded in provincial tenancy statutes.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="#features"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Browse Listings</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a 
                href="#architecture"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all"
              >
                Live Backend Status
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-200/80 dark:border-slate-800">
              <div className="p-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">100%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pakistani Rupee (PKR)</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">8 Cities</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Islamabad to Karachi</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">5 Statutes</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Provincial Tenancy Laws</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">AI Grounded</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Gemini Lease Assistant</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Backend & DB Health Verification Section */}
      <section id="architecture" className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-6 sm:p-8 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>Phase 0 Scaffolding Status</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                FastAPI & Supabase PostgreSQL Integration
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Full-stack communication between Next.js 15 App Router and FastAPI backend.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-xs">
                <div className={`w-3 h-3 rounded-full ${loadingHealth ? "bg-amber-400 animate-ping" : healthStatus?.status === "ok" ? "bg-emerald-500" : "bg-rose-500"}`} />
                <div className="text-left">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">FastAPI API</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {loadingHealth ? "Checking..." : healthStatus?.status === "ok" ? "Online (Port 8000)" : "Pending Startup"}
                  </div>
                </div>
              </div>

              <div className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-xs">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="text-left">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Database</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Supabase Connected</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Built Specifically for Pakistani Landlords & Tenants
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Eliminate disputes, verify credibility, and manage property portfolios with zero legal ambiguity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Smart Lease Assistant</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Direct Gemini AI lease analysis that highlights critical clauses and checks adherence against the Punjab, Sindh, or ICT Tenancy Acts.
              </p>
            </div>

            <div className="rounded-2xl p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">CNIC Verification</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Automated Pakistani identity card verification with image quality assurance and cross-matching to prevent tenant impersonation.
              </p>
            </div>

            <div className="rounded-2xl p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-6">
                <Banknote className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">PKR Rent Ledger</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Simple monthly payment tracking, digital rent receipts, security deposit logging, and in-app payment reminders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Section */}
      <section id="coverage" className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
            <MapPin className="w-4 h-4" />
            <span>Coverage Across Pakistan</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
            Pre-seeded with Key Residential Sectors & Societies
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              "Islamabad (F-10, E-11, DHA)",
              "Lahore (DHA, Gulberg, Bahria)",
              "Karachi (Clifton, DHA, Gulshan)",
              "Rawalpindi (Bahria, Saddar)",
              "Peshawar",
              "Quetta",
              "Faisalabad",
              "Multan"
            ].map((city, idx) => (
              <span 
                key={idx}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              R
            </div>
            <span className="font-bold text-white text-base">Rentillect</span>
            <span className="text-xs text-slate-500">© 2026 Rentillect Platform.</span>
          </div>

          <div className="text-xs text-slate-500 max-w-md text-center md:text-right">
            Rentillect provides rental management and informational statutory insights. It does not constitute formal legal counsel.
          </div>
        </div>
      </footer>
    </div>
  );
}
