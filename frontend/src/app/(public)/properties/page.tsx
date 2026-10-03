"use client";

import { useEffect, useState, useMemo, useRef } from "react";
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
  BedDouble,
  ChevronDown,
  Check,
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

  // Bedrooms Multi-Select Popover State
  const [isBedsDropdownOpen, setIsBedsDropdownOpen] = useState(false);
  const bedsDropdownRef = useRef<HTMLDivElement>(null);

  const BED_OPTIONS = [
    { id: "1", label: "1 Bed" },
    { id: "2", label: "2 Beds" },
    { id: "3", label: "3 Beds" },
    { id: "4", label: "4 Beds" },
    { id: "5", label: "5 Beds" },
    { id: "6", label: "6 Beds" },
    { id: "7", label: "7 Beds" },
    { id: "7+", label: "7+ Beds" },
  ];

  const selectedBedsList = useMemo(() => {
    if (!bedrooms) return [];
    return bedrooms
      .split(",")
      .filter(Boolean)
      .sort((a, b) => {
        const valA = a === "7+" ? 99 : parseInt(a, 10);
        const valB = b === "7+" ? 99 : parseInt(b, 10);
        return valA - valB;
      });
  }, [bedrooms]);

  const toggleBedOption = (bedId: string) => {
    let updated: string[];
    if (selectedBedsList.includes(bedId)) {
      updated = selectedBedsList.filter((b) => b !== bedId);
    } else {
      updated = [...selectedBedsList, bedId];
    }
    setBedrooms(updated.join(","));
  };

  const clearBedrooms = () => {
    setBedrooms("");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bedsDropdownRef.current && !bedsDropdownRef.current.contains(event.target as Node)) {
        setIsBedsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
  const fetchProperties = async (overrides?: {
    keyword?: string;
    cityId?: number;
    areaId?: number;
    type?: PropertyType;
    min?: string;
    max?: string;
    beds?: string;
    furnished?: boolean;
  }) => {
    setLoading(true);
    try {
      const keywordVal = overrides?.keyword !== undefined ? overrides.keyword : searchKeyword;
      const cityVal = overrides?.cityId !== undefined ? overrides.cityId : selectedCityId;
      const areaVal = overrides?.areaId !== undefined ? overrides.areaId : selectedAreaId;
      const typeVal = overrides?.type !== undefined ? overrides.type : selectedType;
      const minVal = overrides?.min !== undefined ? overrides.min : minRent;
      const maxVal = overrides?.max !== undefined ? overrides.max : maxRent;
      const bedsVal = overrides?.beds !== undefined ? overrides.beds : bedrooms;
      const furnVal = overrides?.furnished !== undefined ? overrides.furnished : isFurnished;

      const params = new URLSearchParams();
      if (keywordVal.trim()) params.append("search", keywordVal.trim());
      if (cityVal) params.append("city_id", cityVal.toString());
      if (areaVal) params.append("area_id", areaVal.toString());
      if (typeVal) params.append("property_type", typeVal);
      if (minVal) params.append("min_rent", minVal);
      if (maxVal) params.append("max_rent", maxVal);
      if (bedsVal) params.append("bedrooms", bedsVal);
      if (furnVal !== undefined) params.append("is_furnished", furnVal.toString());

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
    setIsBedsDropdownOpen(false);

    fetchProperties({
      keyword: "",
      cityId: undefined,
      areaId: undefined,
      type: undefined,
      min: "",
      max: "",
      beds: "",
      furnished: undefined,
    });
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
                    fetchProperties({ keyword: "" });
                  }}
                  className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => fetchProperties()}
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
            <div className="relative min-w-[155px]">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <select
                value={selectedType || ""}
                onChange={(e) => setSelectedType(e.target.value ? (e.target.value as PropertyType) : undefined)}
                className="w-full pl-9 pr-7 py-2 text-xs font-semibold bg-zinc-100 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none cursor-pointer text-zinc-800 dark:text-zinc-200 capitalize"
              >
                <option value="">Any Type</option>
                <option value="apartment">Apartment / Flat</option>
                <option value="house">House / Villa</option>
                <option value="upper_portion">Upper Portion</option>
                <option value="lower_portion">Lower Portion</option>
                <option value="portion">All Portions</option>
                <option value="room">Single Room / Studio</option>
                <option value="penthouse">Penthouse</option>
                <option value="farm_house">Farmhouse</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            </div>

            {/* Custom Modern Bedrooms Multi-Select Selector */}
            <div className="relative" ref={bedsDropdownRef}>
              <button
                type="button"
                onClick={() => setIsBedsDropdownOpen((prev) => !prev)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                  selectedBedsList.length > 0
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20"
                    : "bg-zinc-100 dark:bg-darkcard border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-300"
                }`}
              >
                <BedDouble className={`w-3.5 h-3.5 ${selectedBedsList.length > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`} />
                <span>
                  {selectedBedsList.length === 0
                    ? "Any Beds"
                    : selectedBedsList.length === 1
                    ? BED_OPTIONS.find((b) => b.id === selectedBedsList[0])?.label || `${selectedBedsList[0]} Bed`
                    : `${selectedBedsList.join(", ")} Beds`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isBedsDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Popover Card */}
              {isBedsDropdownOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-72 bg-white dark:bg-obsidian border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-3.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800/80 mb-3">
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Number of Bedrooms</span>
                      <p className="text-[10px] text-zinc-400">Select one or multiple options</p>
                    </div>
                    {selectedBedsList.length > 0 && (
                      <button
                        type="button"
                        onClick={clearBedrooms}
                        className="text-[11px] font-semibold text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {BED_OPTIONS.map((opt) => {
                      const isSelected = selectedBedsList.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => toggleBedOption(opt.id)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                              : "bg-zinc-50 dark:bg-darkcard border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400">
                      {selectedBedsList.length === 0
                        ? "Showing all bedroom counts"
                        : `${selectedBedsList.length} count${selectedBedsList.length > 1 ? "s" : ""} selected`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsBedsDropdownOpen(false)}
                      className="px-3 py-1 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black rounded-lg text-xs font-semibold transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Price Filter (Min - Max PKR, direct entry without up/down stepper arrows) */}
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Min PKR"
                value={minRent}
                onChange={(e) => setMinRent(e.target.value)}
                onBlur={() => fetchProperties()}
                onKeyDown={(e) => e.key === "Enter" && fetchProperties()}
                className="w-24 px-2.5 py-2 text-xs bg-zinc-100 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-zinc-800 dark:text-zinc-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-zinc-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max PKR"
                value={maxRent}
                onChange={(e) => setMaxRent(e.target.value)}
                onBlur={() => fetchProperties()}
                onKeyDown={(e) => e.key === "Enter" && fetchProperties()}
                className="w-24 px-2.5 py-2 text-xs bg-zinc-100 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-zinc-800 dark:text-zinc-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
