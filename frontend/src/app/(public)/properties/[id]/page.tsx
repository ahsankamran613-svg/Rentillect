"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Property } from "@/types/property";
import PropertyMap from "@/components/maps/PropertyMap";
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  Phone,
  MessageCircle,
  MessageSquare,
  PhoneCall,
  Copy,
  Clock,
  ArrowLeft,
  Share2,
  Heart,
  CheckCircle2,
  Zap,
  Flame,
  Droplet,
  Car,
  Home,
  Check,
  Sun,
  Waves,
  Gauge,
  Radio,
  Trees,
  Layers,
  Wifi,
  Warehouse,
  Trash2,
  Building,
} from "lucide-react";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Apartment / Flat",
  house: "Independent House / Villa",
  upper_portion: "Upper Portion",
  lower_portion: "Lower Portion",
  portion: "Portion",
  room: "Single Room / Studio",
  penthouse: "Penthouse",
  farm_house: "Farmhouse",
};

function formatPropertyType(type?: string): string {
  if (!type) return "Property";
  return PROPERTY_TYPE_LABELS[type.toLowerCase()] || type.replace(/_/g, " ");
}

// Amenity display config with relevant icons
const AMENITY_MAP: Record<string, { label: string; icon: any }> = {
  backup_generator: { label: "Backup Generator / UPS", icon: Zap },
  generator: { label: "Backup Generator", icon: Zap },
  sui_gas: { label: "Sui Gas Connection", icon: Flame },
  gas: { label: "Sui Gas", icon: Flame },
  solar_system: { label: "Solar System / Inverter", icon: Sun },
  sweet_water: { label: "Sweet / Boring Water", icon: Droplet },
  water_supply: { label: "24/7 Water Supply", icon: Droplet },
  ro_plant: { label: "Water Filtration Plant (RO)", icon: Waves },
  separate_meter: { label: "Separate Electricity Meter", icon: Gauge },
  gas_geyser: { label: "Water Geyser Installed", icon: Flame },
  water_storage: { label: "Water Tanks (Ground & Roof)", icon: Droplet },
  dedicated_parking: { label: "Dedicated Car Parking", icon: Car },
  parking: { label: "Car Parking", icon: Car },
  security_staff: { label: "24/7 Gated Security Guard", icon: ShieldCheck },
  gated_community: { label: "Gated Community", icon: ShieldCheck },
  cctv_security: { label: "CCTV Surveillance", icon: Radio },
  elevators: { label: "High-Speed Elevators", icon: Home },
  servant_quarter: { label: "Servant Quarter", icon: Home },
  driver_room: { label: "Driver Room / Rest Area", icon: Home },
  balcony: { label: "Balcony / Terrace", icon: Sparkles },
  private_lawn: { label: "Lawn / Private Garden", icon: Trees },
  rooftop_access: { label: "Private Rooftop Access", icon: Layers },
  guest_powder_room: { label: "Powder Room (Guest Bath)", icon: Sparkles },
  store_room: { label: "Store Room / Laundry", icon: Warehouse },
  fiber_internet: { label: "High-Speed Fiber Internet", icon: Wifi },
  waste_disposal: { label: "Daily Trash Collection", icon: Trash2 },
  central_heating_ac: { label: "Central Heating / AC", icon: Zap },
  mosque_nearby: { label: "Mosque / Masjid Nearby", icon: Building },
  market_park_nearby: { label: "Market & Park Nearby", icon: Sparkles },
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);

  const handleCopyPhone = () => {
    if (property?.owner_phone) {
      navigator.clipboard.writeText(property.owner_phone);
      setPhoneCopied(true);
      setTimeout(() => setPhoneCopied(false), 2000);
    }
  };

  useEffect(() => {
    async function loadProperty() {
      try {
        setLoading(true);
        const data = await apiClient<Property>(`/properties/${propertyId}`, {
          requireAuth: false,
        });
        setProperty(data);
      } catch (err: any) {
        setError(err.message || "Failed to load property listing.");
      } finally {
        setLoading(false);
      }
    }
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-pitch flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Loading listing details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-pitch flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center bg-white dark:bg-obsidian p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Property Not Found
          </h2>
          <p className="text-sm text-zinc-500 mb-6">
            {error || "This property listing may have been rented or delisted by the landlord."}
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-pitch hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const allImages =
    property.images && property.images.length > 0
      ? property.images.map((img) => img.cloudinary_url)
      : [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1280&q=80",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1280&q=80",
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1280&q=80",
        ];

  const whatsappPhone = property.owner_phone ? property.owner_phone.replace(/[^0-9]/g, "") : "";
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    `Assalam-o-Alaikum, I saw your listing for "${property.title}" on Rentillect (PKR ${property.rent_amount.toLocaleString()}/mo) and would like to schedule a viewing.`
  )}`;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-pitch text-zinc-900 dark:text-zinc-100 pb-20">
      {/* Top Navigation Bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-obsidian/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-darkcard rounded-xl text-zinc-600 dark:text-zinc-400 transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="text-xs text-zinc-500 font-medium flex items-center gap-1.5 truncate">
              <Link href="/properties" className="hover:text-emerald-500 transition-colors">
                Properties
              </Link>
              <span>/</span>
              <span>{property.city?.name || "Pakistan"}</span>
              <span>/</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-semibold truncate">
                {property.area?.name || property.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 bg-zinc-100 dark:bg-darkcard hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-zinc-200 dark:border-zinc-800"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{isCopied ? "Link Copied!" : "Share"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-pitch text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-white/10">
              {formatPropertyType(property.property_type)}
            </span>
            {property.is_furnished && (
              <span className="bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Fully Furnished
              </span>
            )}
            <span className="bg-zinc-100 dark:bg-darkcard text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium px-2 py-0.5 rounded-md">
              Listing ID: {property.id.slice(0, 8)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {property.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-zinc-500 mt-2">
            <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {property.street_address ? `${property.street_address}, ` : ""}
              {property.area?.name ? `${property.area.name}, ` : ""}
              {property.city?.name || "Pakistan"}
            </span>
          </div>
        </div>

        {/* Cloudinary Photo Gallery (Interactive Multi-Photo Grid) */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-950">
            {/* Main Featured Photo */}
            <div className="md:col-span-8 aspect-[16/10] relative overflow-hidden group">
              <img
                src={allImages[selectedPhotoIndex] || allImages[0]}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
              />
              <div className="absolute bottom-3 left-3 bg-pitch/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-semibold text-white border border-white/10">
                Photo {selectedPhotoIndex + 1} of {allImages.length}
              </div>
            </div>

            {/* Thumbnail Sidebar / Grid */}
            <div className="md:col-span-4 flex flex-row md:flex-col gap-2 p-2 bg-zinc-900 overflow-x-auto md:overflow-y-auto max-h-[460px]">
              {allImages.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`relative aspect-[16/10] md:h-24 w-full rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    selectedPhotoIndex === idx
                      ? "border-emerald-500 scale-[0.98] shadow-md"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Layout: Details on Left (7 cols), Sticky Rent & Contact Box on Right (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Details Column */}
          <div className="lg:col-span-7 space-y-8">
            {/* Key Specs Row - Modern Tinted Capsule Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 rounded-3xl bg-white dark:bg-obsidian border border-zinc-200/80 dark:border-zinc-800 shadow-md shadow-zinc-100/50 dark:shadow-none">
              {/* Bedrooms */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100/80 dark:border-emerald-900/40">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-emerald-500/20">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-none">
                    {property.bedrooms}
                  </p>
                  <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mt-1">
                    Bedrooms
                  </p>
                </div>
              </div>

              {/* Bathrooms */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-100/80 dark:border-teal-900/40">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-teal-500/20">
                  <Bath className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-none">
                    {property.bathrooms}
                  </p>
                  <p className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider mt-1">
                    Bathrooms
                  </p>
                </div>
              </div>

              {/* Area Sq. Ft. */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-100/80 dark:border-sky-900/40">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-sky-500/20">
                  <Square className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-none">
                    {property.area_sqft ? property.area_sqft.toLocaleString() : "N/A"}
                  </p>
                  <p className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider mt-1">
                    Sq. Ft.
                  </p>
                </div>
              </div>

              {/* Available Date */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100/80 dark:border-amber-900/40">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-amber-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-zinc-900 dark:text-zinc-50 leading-tight truncate">
                    {property.available_from ? new Date(property.available_from).toLocaleDateString() : "Immediate"}
                  </p>
                  <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mt-1">
                    Available
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-obsidian p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                About this Property
              </h2>
              <div className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {property.description ||
                  "Spacious residential rental in a prime Pakistani neighborhood. Features modern fittings, secure access, and proximity to commercial centers, public transit, and schools."}
              </div>
            </div>

            {/* Pakistani Amenities Grid */}
            <div className="bg-white dark:bg-obsidian p-6 sm:p-7 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Amenities & Utilities
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Verified features & utility provisions</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
                  {property.amenities?.length || 0} Listed
                </span>
              </div>
              {property.amenities && property.amenities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.amenities.map((amenityKey, idx) => {
                    const cleanKey = amenityKey.trim().toLowerCase();
                    const conf = AMENITY_MAP[cleanKey] || {
                      label: cleanKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                      icon: CheckCircle2,
                    };
                    const IconComp = conf.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-darkcard border border-zinc-100 dark:border-zinc-800/80 hover:border-emerald-300 dark:hover:border-emerald-800/60 transition-all hover:shadow-xs group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          {conf.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">Standard utilities provided by landlord.</p>
              )}
            </div>

            {/* Location & Leaflet Map */}
            <div className="bg-white dark:bg-obsidian p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Neighborhood & Location
              </h2>
              <p className="text-xs text-zinc-500 mb-4">
                {property.street_address ? `${property.street_address}, ` : ""}
                {property.area?.name ? `${property.area.name}, ` : ""}
                {property.city?.name || "Pakistan"}
              </p>

              <div className="h-72 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <PropertyMap
                  properties={[property]}
                  selectedPropertyId={property.id}
                  defaultCenter={
                    property.latitude && property.longitude
                      ? [property.latitude, property.longitude]
                      : [33.6844, 73.0479]
                  }
                  defaultZoom={14}
                  height="100%"
                />
              </div>
            </div>
          </div>

          {/* Sticky Sidebar: Rent & Landlord Contact Box */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              {/* Premium Rent Booking Card */}
              <div className="bg-white dark:bg-obsidian p-6 sm:p-7 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none">
                {/* Rent Amount & Status Header */}
                <div className="flex items-start justify-between pb-5 mb-5 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                      Monthly Rent
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-zinc-400">PKR</span>
                      <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                        {property.rent_amount.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-zinc-400">/mo</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {property.status.toUpperCase()}
                  </span>
                </div>

                {/* Lease Terms Breakdown (Platform Fee Removed!) */}
                <div className="space-y-3 text-xs mb-6 bg-zinc-50/80 dark:bg-darkcard p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/60">
                  <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                    <span>Security Deposit (Refundable)</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      PKR {property.security_deposit ? property.security_deposit.toLocaleString() : "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                    <span>Advance Rent Policy</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">1 Month Standard</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                    <span>Standard Lease Duration</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">11 Months (Renewable)</span>
                  </div>
                </div>

                {/* Multi-Channel Contact Actions (Option 1) */}
                <div className="space-y-2.5">
                  {/* Primary CTA: Message Landlord (In-App Rentillect Chat) */}
                  <Link
                    href={`/tenant/chat?recipient_id=${property.owner_id}&property_id=${property.id}`}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Message Landlord (In-App)</span>
                  </Link>

                  {/* Secondary Actions Side-by-Side: WhatsApp + Call */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* WhatsApp Button */}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all hover:shadow-md hover:shadow-green-500/20"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Call Landlord Button */}
                    <button
                      type="button"
                      onClick={() => setShowCallModal((prev) => !prev)}
                      className="py-3 px-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-zinc-700/50 shadow-xs"
                    >
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>Call Landlord</span>
                    </button>
                  </div>
                </div>

                {/* Call Popover / Modal when clicked */}
                {showCallModal && (
                  <div className="mt-3 p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-700 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-3">
                      <span className="text-xs font-bold text-zinc-300">Verified Landlord Contact</span>
                      <button
                        type="button"
                        onClick={() => setShowCallModal(false)}
                        className="text-xs text-zinc-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-zinc-800/80 p-3 rounded-xl mb-3">
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        {property.owner_phone || "+92 300 1234567"}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyPhone}
                        className="flex items-center gap-1 text-[11px] font-semibold text-zinc-300 hover:text-white bg-zinc-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        {phoneCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`tel:${property.owner_phone || ""}`}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-center text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Dial Number Now</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Legal Guarantee Badge */}
                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-start gap-2.5 text-[11px] text-zinc-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Tenancy contracts generated on Rentillect comply with Pakistani Provincial Rent
                    Restriction Laws (Punjab, Sindh, ICT).
                  </span>
                </div>
              </div>

              {/* High-Trust Landlord Profile Box */}
              <div className="bg-white dark:bg-obsidian p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-md shadow-zinc-100/50 dark:shadow-none">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0 overflow-hidden">
                      {property.owner_avatar ? (
                        <img
                          src={property.owner_avatar}
                          alt={property.owner_name || "Landlord"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{(property.owner_name || "L")[0].toUpperCase()}</span>
                      )}
                    </div>
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 absolute -bottom-0.5 -right-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {property.owner_name || "Verified Landlord"}
                      </p>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      CNIC Verified Landlord
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Replies in &lt; 1 hr</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Direct Property Owner</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
