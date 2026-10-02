import Link from "next/link";
import { LucideIcon, ArrowLeft, Sparkles, Clock } from "lucide-react";

interface FeaturePlaceholderProps {
  title: string;
  phase: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  backLink: string;
  backText: string;
}

export function FeaturePlaceholder({
  title,
  phase,
  description,
  icon: Icon,
  features,
  backLink,
  backText,
}: FeaturePlaceholderProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <Link
        href={backLink}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to {backText}</span>
      </Link>

      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-6 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
          <Icon className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4 border border-emerald-500/20">
          <Sparkles className="w-3 h-3" />
          <span>{phase}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto mt-3 leading-relaxed">
          {description}
        </p>

        {/* Feature Highlights */}
        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 max-w-lg mx-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Included in this milestone
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {features.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Link
            href={backLink}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
          >
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
