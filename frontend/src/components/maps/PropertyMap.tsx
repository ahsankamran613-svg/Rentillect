"use client";

import dynamic from "next/dynamic";
import { PropertyMapProps } from "./PropertyMapInner";
import { MapPin } from "lucide-react";

// Dynamically import PropertyMapInner with SSR disabled so Leaflet window references never break Next.js build
const DynamicMap = dynamic(() => import("./PropertyMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] rounded-xl bg-zinc-100 dark:bg-obsidian border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-6 text-center animate-pulse">
      <div className="w-12 h-12 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
        <MapPin className="w-6 h-6 animate-bounce" />
      </div>
      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Loading Map Explorer...</p>
      <p className="text-xs text-zinc-500 mt-1">Connecting to OpenStreetMap Pakistan</p>
    </div>
  ),
});

export default function PropertyMap(props: PropertyMapProps) {
  return <DynamicMap {...props} />;
}
