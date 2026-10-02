"use client";

import Link from "next/link";
import { Property } from "@/types/property";
import { Bed, Bath, Square, MapPin, Sparkles, CheckCircle2, Heart } from "lucide-react";
import { useFavoritesStore } from "@/stores/favoritesStore";

interface PropertyCardProps {
  property: Property;
  isSelected?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function PropertyCard({
  property,
  isSelected = false,
  onMouseEnter,
  onMouseLeave,
}: PropertyCardProps) {
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const favorited = isFavorite(property.id);

  const coverImage =
    property.images?.find((img) => img.is_cover)?.cloudinary_url ||
    property.images?.[0]?.cloudinary_url ||
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80";

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(property.id);
  };

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group relative bg-white dark:bg-obsidian rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isSelected
          ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg"
          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
      }`}
    >
      <Link href={`/properties/${property.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900">
          <img
            src={coverImage}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-pitch/80 via-pitch/10 to-transparent" />

          {/* Badges on Top */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5">
              <span className="bg-black/90 backdrop-blur-md text-white text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md border border-white/10 shadow-sm">
                {property.property_type}
              </span>

              {property.is_furnished && (
                <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-400/20 shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  Furnished
                </span>
              )}
            </div>

            {/* Favorite Heart Button */}
            <button
              type="button"
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-125 border ${
                favorited
                  ? "bg-white/95 dark:bg-black/95 text-rose-500 border-rose-500/30 shadow-md"
                  : "bg-black/40 text-white/80 hover:text-white hover:bg-black/60 border-white/10"
              }`}
              title={favorited ? "Remove from saved" : "Save property"}
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  favorited ? "fill-rose-500 scale-110" : ""
                }`}
              />
            </button>
          </div>

          {/* Price on bottom left of image */}
          <div className="absolute bottom-3 left-3">
            <div className="flex items-baseline gap-1 bg-pitch/85 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
              <span className="text-xs text-emerald-400 font-bold">PKR</span>
              <span className="text-lg font-extrabold text-white">
                {property.rent_amount.toLocaleString()}
              </span>
              <span className="text-[11px] text-zinc-300">/month</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4">
          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate">
              {property.area?.name ? `${property.area.name}, ` : ""}
              {property.city?.name || "Pakistan"}
            </span>
          </div>

          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 mb-3">
            {property.title}
          </h3>

          {/* Key Specs Pills */}
          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-zinc-50 dark:bg-darkcard border border-zinc-100 dark:border-zinc-800/80 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium">
              <Bed className="w-3.5 h-3.5 text-zinc-400" />
              <span>{property.bedrooms} Bed</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium">
              <Bath className="w-3.5 h-3.5 text-zinc-400" />
              <span>{property.bathrooms} Bath</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium truncate">
              <Square className="w-3.5 h-3.5 text-zinc-400" />
              <span>{property.area_sqft ? `${property.area_sqft} sqft` : "Standard"}</span>
            </div>
          </div>

          {/* Amenities Mini-Row & Verified Badge */}
          <div className="flex items-center justify-between mt-3 pt-2 text-[11px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Listing</span>
            </div>
            <span className="text-zinc-400">
              Sec. Dep: PKR {property.security_deposit ? `${(property.security_deposit / 1000).toFixed(0)}k` : "Nil"}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
