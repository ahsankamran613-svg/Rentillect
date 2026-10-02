"use client";

import { useEffect, useState, useMemo } from "react";
import { apiClient } from "@/lib/api";
import { Property, City, Area, PropertyType } from "@/types/property";
import PropertyCard from "@/components/properties/PropertyCard";
import PropertyMap from "@/components/maps/PropertyMap";
import { useFavoritesStore } from "@/stores/favoritesStore";
import {
  Search,
  MapPin,
  Home,
  RotateCcw,
  Sparkles,
  Map as MapIcon,
  List,
  Heart,
  X,
} from "lucide-react";

// Standard coordinates for major Pakistani cities
const PAKISTAN_CITY_COORDINATES: Record<string, [number, number]> = {
  islamabad: [33.6844, 73.0479],
  rawalpindi: [33.5651, 73.0169],
  lahore: [31.5204, 74.3587],
  karachi: [24.8607, 67.0011],
  peshawar: [34.0151, 71.5249],
  quetta: [30.1798, 66.9750],
  faisalabad: [31.4504, 73.1350],
  multan: [30.1575, 71.5249],
};

export default function PropertiesMarketplacePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  // Favorites store
  const { favorites } = useFavoritesStore();
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Filters state
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedCityId, setSelectedCityId] = useState<number | undefined>(undefined);
  const [selectedAreaId, setSelectedAreaId] = useState<number | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<PropertyType | undefined>(undefined);
  const [minRent, setMinRent] = useState<string>("");
  const [maxRent, setMaxRent] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<string>("");
  const [isFurnished, setIsFurnished] = useState<boolean | undefined>(undefined);

  // 1. Fetch cities on mount
  useEffect(() => {
    async function loadCities() {
      try {
        const cityList = await apiClient<City[]>("/properties/cities", { requireAuth: false });
        setCities(cityList);
      } catch (err) {
        console.error("Failed to load cities:", err);
      }
    }
    loadCities();
  }, []);

  // 2. Fetch areas when selectedCityId changes
  useEffect(() => {
    if (!selectedCityId) {
      setAreas([]);
      setSelectedAreaId(undefined);
      return;
    }
    async function loadAreas() {
      try {
        const areaList = await apiClient<Area[]>(`/properties/cities/${selectedCityId}/areas`, {
          requireAuth: false,
        });
        setAreas(areaList);
      } catch (err) {
        console.error("Failed to load areas:", err);
      }
    }
    loadAreas();
  }, [selectedCityId]);

  // 3. Fetch properties with active filters and search
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchKeyword.trim()) params.append("search", searchKeyword.trim());
      if (selectedCityId) params.append("city_id", selectedCityId.toString());
      if (selectedAreaId) params.append("area_id", selectedAreaId.toString());
      if (selectedType) params.append("property_type", selectedType);
      if (minRent) params.append("min_rent", minRent);
      if (maxRent) params.append("max_rent", maxRent);
      if (bedrooms) params.append("bedrooms", bedrooms);
      if (isFurnished !== undefined) params.append("is_furnished", isFurnished.toString());

      const url = `/properties${params.toString() ? `?${params.toString()}` : ""}`;
      const data = await apiClient<Property[]>(url, { requireAuth: false });
      setProperties(data);
    } catch (err) {
      console.error("Failed to search properties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [selectedCityId, selectedAreaId, selectedType, bedrooms, isFurnished]);

  // Filter properties by favorites if toggled
  const displayedProperties = useMemo(() => {
    if (!onlyFavorites) return properties;
    return properties.filter((p) => favorites.includes(p.id));
  }, [properties, onlyFavorites, favorites]);

  // Determine dynamic map center based on selected city or first property
  const mapCenter = useMemo<[number, number]>(() => {
    if (selectedCityId) {
      const cityObj = cities.find((c) => c.id === selectedCityId);
      if (cityObj) {
        const cleanName = cityObj.name.toLowerCase().trim();
        if (PAKISTAN_CITY_COORDINATES[cleanName]) {
          return PAKISTAN_CITY_COORDINATES[cleanName];
        }
      }
    }
    // If we have properties with coordinates, center on the first one
    const firstWithCoords = properties.find((p) => p.latitude && p.longitude);
    if (firstWithCoords) {
      return [firstWithCoords.latitude!, firstWithCoords.longitude!];
    }
    return [33.6844, 73.0479]; // Islamabad default
  }, [selectedCityId, cities, properties]);

  const handleResetFilters = () => {
    setSearchKeyword("");
    setSelectedCityId(undefined);
    setSelectedAreaId(undefined);
    setSelectedType(undefined);
    setMinRent("");
    setMaxRent("");
    setBedrooms("");
    setIsFurnished(undefined);
    setOnlyFavorites(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-pitch text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Top Filter & Search Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-obsidian/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          {/* Row 1: Keyword Search Bar & Quick Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Free-text Keyword Search Input */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by keywords, title, or society (e.g. Margalla, Villa, Clifton, DHA, Penthouse)..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchProperties()}
                className="w-full pl-10 pr-20 py-2.5 text-xs bg-zinc-100 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-medium"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword("");
                    setTimeout(fetchProperties, 50);
                  }}
                  className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={fetchProperties}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Search
              </button>
            </div>

            {/* Favorites & Mobile Toggle */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Saved Wishlist Toggle */}
              <button
                type="button"
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 shadow-sm ${
                  onlyFavorites
                    ? "bg-rose-500 text-white border-rose-500 shadow-rose-500/20"
                    : "bg-zinc-100 dark:bg-darkcard text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                }`}
                title="View your saved wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? "fill-white" : "text-rose-500"}`} />
                <span>Saved ({favorites.length})</span>
              </button>

              {/* Mobile View Toggle */}
              <div className="lg:hidden flex items-center bg-zinc-100 dark:bg-darkcard p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setMobileView("list")}
                  className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                    mobileView === "list"
                      ? "bg-black text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span>List</span>
                </button>
                <button
                  onClick={() => setMobileView("map")}
                  className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                    mobileView === "map"
                      ? "bg-black text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <MapIcon className="w-4 h-4" />
                  <span>Map</span>
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Structured Filters (City, Sector, Type, Beds, Price) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* City Selector */}
            <div className="relative min-w-[150px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
              <select
                value={selectedCityId || ""}
                onChange={(e) => setSelectedCityId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full pl-9 pr-8 py-2 text-xs font-semibold bg-zinc-100 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none cursor-pointer text-zinc-800 dark:text-zinc-200"
              >
                <option value="">All Cities (Pakistan)</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Area Selector */}
            {areas.length > 0 && (
              <div className="relative min-w-[160px]">
                <select
                  value={selectedAreaId || ""}
                  onChange={(e) => setSelectedAreaId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-zinc-100 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none cursor-pointer text-zinc-800 dark:text-zinc-200"
                >
                  <option value="">All Sectors / Areas</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Property Type Selector */}
            <div className="relative min-w-[140px]">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <select
                value={selectedType || ""}
                onChange={(e) => setSelectedType(e.target.value ? (e.target.value as PropertyType) : undefined)}
                className="w-full pl-9 pr-8 py-2 text-xs font-semibold bg-zinc-100 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none cursor-pointer text-zinc-800 dark:text-zinc-200 capitalize"
              >
                <option value="">Any Type</option>
                <option value="apartment">Apartment</option>
                <option value="house">House / Villa</option>
                <option value="portion">Upper/Lower Portion</option>
                <option value="room">Single Room</option>
              </select>
            </div>

            {/* Bedrooms Selector */}
            <div className="relative min-w-[110px]">
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-zinc-100 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none cursor-pointer text-zinc-800 dark:text-zinc-200"
              >
                <option value="">Any Beds</option>
                <option value="1">1+ Bed</option>
                <option value="2">2+ Beds</option>
                <option value="3">3+ Beds</option>
                <option value="4">4+ Beds</option>
              </select>
            </div>

            {/* Price Filter (Min - Max PKR) */}
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Min PKR"
                value={minRent}
                onChange={(e) => setMinRent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchProperties()}
                className="w-24 px-2.5 py-2 text-xs bg-zinc-100 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-zinc-800 dark:text-zinc-200"
              />
              <span className="text-zinc-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max PKR"
                value={maxRent}
                onChange={(e) => setMaxRent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchProperties()}
                className="w-24 px-2.5 py-2 text-xs bg-zinc-100 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-zinc-800 dark:text-zinc-200"
              />
            </div>

            {/* Furnished Pill */}
            <button
              type="button"
              onClick={() => setIsFurnished((prev) => (prev === true ? undefined : true))}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
                isFurnished === true
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                  : "bg-zinc-100 dark:bg-darkcard text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Furnished
            </button>

            {/* Reset Button */}
            {(searchKeyword || selectedCityId || selectedAreaId || selectedType || minRent || maxRent || bedrooms || isFurnished !== undefined || onlyFavorites) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1 text-xs"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Split Layout: Cards on Left, Map on Right */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Left Column: Property Cards Feed */}
          <div
            className={`lg:col-span-7 flex flex-col ${
              mobileView === "map" ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* Header info */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {onlyFavorites
                    ? "My Saved Wishlist"
                    : selectedCityId
                    ? `Properties in ${cities.find((c) => c.id === selectedCityId)?.name || "Pakistan"}`
                    : searchKeyword
                    ? `Results for "${searchKeyword}"`
                    : "Available Rental Homes in Pakistan"}
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {loading
                    ? "Searching verified listings..."
                    : `Showing ${displayedProperties.length} residential ${
                        displayedProperties.length === 1 ? "property" : "properties"
                      }`}
                </p>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-80 rounded-2xl bg-zinc-200 dark:bg-obsidian animate-pulse border border-zinc-200 dark:border-zinc-800"
                  />
                ))}
              </div>
            ) : displayedProperties.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16 px-4 bg-white dark:bg-obsidian rounded-2xl border border-zinc-200 dark:border-zinc-800 my-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
                  {onlyFavorites ? <Heart className="w-8 h-8 text-rose-500" /> : <Home className="w-8 h-8" />}
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {onlyFavorites ? "No Saved Properties" : "No Properties Found"}
                </h3>
                <p className="text-sm text-zinc-500 max-w-md mx-auto mt-1 mb-6">
                  {onlyFavorites
                    ? "You haven't bookmarked any listings yet. Click the heart icon on any property to save it here."
                    : "No active listings match your current search or filters. Try adjusting your keyword, city, or PKR budget."}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-medium text-xs rounded-xl shadow-md transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {displayedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isSelected={selectedPropertyId === property.id}
                    onMouseEnter={() => setSelectedPropertyId(property.id)}
                    onMouseLeave={() => setSelectedPropertyId(null)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Map Explorer with Auto-Pan */}
          <div
            className={`lg:col-span-5 ${
              mobileView === "list" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="sticky top-24 h-[calc(100vh-7.5rem)] rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800">
              <PropertyMap
                properties={displayedProperties}
                selectedPropertyId={selectedPropertyId}
                onSelectProperty={(id) => setSelectedPropertyId(id)}
                defaultCenter={mapCenter}
                defaultZoom={selectedCityId ? 12 : 11}
                height="100%"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
