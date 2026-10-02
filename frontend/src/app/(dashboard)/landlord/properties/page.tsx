"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Property } from "@/types/property";
import { useAuthStore } from "@/stores/authStore";
import {
  Plus,
  Home,
  MapPin,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle,
  Eye,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

export default function LandlordPropertiesPage() {
  const router = useRouter();
  const { user, activeRole } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      const data = await apiClient<Property[]>("/properties/mine", { requireAuth: true });
      setProperties(data);
    } catch (err: any) {
      setError(err.message || "Failed to load properties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const handleDelist = async (id: string) => {
    if (!confirm("Are you sure you want to delist this property listing?")) return;
    try {
      await apiClient(`/properties/${id}`, {
        method: "DELETE",
        requireAuth: true,
      });
      // Refresh list
      fetchMyProperties();
    } catch (err: any) {
      alert("Error delisting property: " + err.message);
    }
  };

  const totalRentPotential = properties
    .filter((p) => p.status === "active" || p.status === "occupied")
    .reduce((acc, p) => acc + p.rent_amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            My Property Listings
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage your rental units, pricing, photos, and tenant inquiries.
          </p>
        </div>

        <Link
          href="/landlord/properties/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pitch hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-md transition-all border border-white/10"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add New Property</span>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-obsidian border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Listings</p>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
            {properties.length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-obsidian border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active on Market</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {properties.filter((p) => p.status === "active").length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-obsidian border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Monthly Potential
          </p>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
            PKR {totalRentPotential.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Listings Table / Grid */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-24 rounded-2xl bg-zinc-200 dark:bg-obsidian animate-pulse border border-zinc-200 dark:border-zinc-800"
            />
          ))}
        </div>
      ) : properties.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-6 bg-white dark:bg-obsidian rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
            <Home className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            No Properties Listed Yet
          </h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mt-1 mb-6">
            You haven't added any rental units yet. Add your first house, apartment, or portion to
            start receiving verified Pakistani tenant inquiries.
          </p>
          <Link
            href="/landlord/properties/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-pitch hover:bg-zinc-800 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            Create Your First Listing
          </Link>
        </div>
      ) : (
        /* Property Rows */
        <div className="space-y-3">
          {properties.map((prop) => {
            const coverUrl =
              prop.images?.find((img) => img.is_cover)?.cloudinary_url ||
              prop.images?.[0]?.cloudinary_url ||
              "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80";

            return (
              <div
                key={prop.id}
                className="bg-white dark:bg-obsidian p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                {/* Left Side: Thumbnail & Details */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 shrink-0 relative">
                    <img src={coverUrl} alt={prop.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-pitch/80 text-[10px] text-white px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                      <ImageIcon className="w-2.5 h-2.5" />
                      {prop.images?.length || 0}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-pitch text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        {prop.property_type}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          prop.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-zinc-100 dark:bg-darkcard text-zinc-500"
                        }`}
                      >
                        {prop.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {prop.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      <span>
                        {prop.area?.name ? `${prop.area.name}, ` : ""}
                        {prop.city?.name || "Pakistan"}
                      </span>
                      <span>•</span>
                      <span>{prop.bedrooms} Bed, {prop.bathrooms} Bath</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Rent & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
                  <div className="text-left md:text-right">
                    <p className="text-[11px] text-zinc-400">Monthly Rent</p>
                    <p className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                      PKR {prop.rent_amount.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/properties/${prop.id}`}
                      target="_blank"
                      className="p-2 rounded-xl bg-zinc-100 dark:bg-darkcard text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                      title="View Public Listing"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDelist(prop.id)}
                      className="p-2 rounded-xl bg-zinc-100 dark:bg-darkcard text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Delist property"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
