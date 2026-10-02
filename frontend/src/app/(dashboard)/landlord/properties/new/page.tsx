"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { City, Area, PropertyType, Property } from "@/types/property";
import PropertyMap from "@/components/maps/PropertyMap";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Upload,
  X,
  Home,
  DollarSign,
  Sparkles,
  Zap,
  Flame,
  Droplet,
  Car,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const PAKISTAN_AMENITIES = [
  { id: "backup_generator", label: "Backup Generator / UPS", icon: Zap },
  { id: "sui_gas", label: "Sui Gas Connection", icon: Flame },
  { id: "sweet_water", label: "Borehole / Sweet Water", icon: Droplet },
  { id: "dedicated_parking", label: "Dedicated Car Parking", icon: Car },
  { id: "security_staff", label: "24/7 Gated Security", icon: ShieldCheck },
  { id: "elevators", label: "High-Speed Elevators", icon: Home },
  { id: "balcony", label: "Balcony / Terrace", icon: Sparkles },
  { id: "servant_quarter", label: "Servant Quarter", icon: Home },
];

export default function NewPropertyListingPage() {
  const router = useRouter();

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields - Step 1
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [rentAmount, setRentAmount] = useState<number | "">("");
  const [securityDeposit, setSecurityDeposit] = useState<number | "">("");
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [areaSqft, setAreaSqft] = useState<number | "">("");
  const [isFurnished, setIsFurnished] = useState(false);

  // Form Fields - Step 2 (Location)
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [cityId, setCityId] = useState<number | "">("");
  const [areaId, setAreaId] = useState<number | "">("");
  const [streetAddress, setStreetAddress] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 33.6844,
    lng: 73.0479, // Islamabad default
  });
  const [areaSearchFilter, setAreaSearchFilter] = useState("");
  const [isAddingCustomArea, setIsAddingCustomArea] = useState(false);
  const [customAreaName, setCustomAreaName] = useState("");
  const [isSubmittingArea, setIsSubmittingArea] = useState(false);

  const filteredAreas = useMemo(() => {
    if (!areaSearchFilter.trim()) return areas;
    const term = areaSearchFilter.toLowerCase();
    return areas.filter((a) => a.name.toLowerCase().includes(term));
  }, [areas, areaSearchFilter]);

  // Form Fields - Step 3 (Amenities & Photos)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "backup_generator",
    "sui_gas",
  ]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);

  // Load cities on mount
  useEffect(() => {
    async function loadCities() {
      try {
        const list = await apiClient<City[]>("/properties/cities", { requireAuth: false });
        setCities(list);
        if (list.length > 0) {
          // Default to Islamabad
          const isb = list.find((c) => c.name.toLowerCase().includes("islamabad")) || list[0];
          setCityId(isb.id);
        }
      } catch (err) {
        console.error("Failed to load cities:", err);
      }
    }
    loadCities();
  }, []);

  // Load areas when cityId changes
  useEffect(() => {
    if (!cityId) {
      setAreas([]);
      setAreaId("");
      return;
    }
    async function loadAreas() {
      try {
        const list = await apiClient<Area[]>(`/properties/cities/${cityId}/areas`, {
          requireAuth: false,
        });
        setAreas(list);
        if (list.length > 0) {
          setAreaId(list[0].id);
        }
      } catch (err) {
        console.error("Failed to load areas:", err);
      }
    }
    loadAreas();
  }, [cityId]);

  // Geocoding and upload state
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeMessage, setGeocodeMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    percent: number;
  } | null>(null);

  // Auto-center map when city changes
  useEffect(() => {
    if (!cityId) return;
    const selectedCity = cities.find((c) => c.id === Number(cityId));
    if (selectedCity) {
      const cityKey = selectedCity.name.toLowerCase().trim();
      const cityMap: Record<string, [number, number]> = {
        islamabad: [33.6844, 73.0479],
        rawalpindi: [33.5651, 73.0169],
        lahore: [31.5204, 74.3587],
        karachi: [24.8607, 67.0011],
        peshawar: [34.0151, 71.5249],
        quetta: [30.1798, 66.9750],
        faisalabad: [31.4504, 73.1350],
        multan: [30.1575, 71.5249],
      };
      if (cityMap[cityKey]) {
        setCoordinates({ lat: cityMap[cityKey][0], lng: cityMap[cityKey][1] });
      }
    }
  }, [cityId, cities]);

  // Handle sector selection: update area and automatically center map on sector
  const handleAreaChange = async (newAreaId: number | "") => {
    setAreaId(newAreaId);
    if (!newAreaId) return;
    const selectedArea = areas.find((a) => a.id === Number(newAreaId));
    const selectedCity = cities.find((c) => c.id === Number(cityId));
    if (!selectedArea || !selectedCity) return;

    try {
      const query = `${selectedArea.name}, ${selectedCity.name}, Pakistan`;
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`);
      const data = await res.json();
      if (data?.features?.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        setCoordinates({ lat, lng });
        setGeocodeMessage(`✓ Map centered on ${selectedArea.name}. Drag pin to exact building.`);
      }
    } catch {
      // Fallback silently
    }
  };

  // Handle registering a custom area if not in pre-seeded list
  const handleCreateCustomArea = async () => {
    if (!customAreaName.trim() || !cityId) return;
    setIsSubmittingArea(true);
    try {
      const newArea = await apiClient<Area>(`/properties/cities/${cityId}/areas`, {
        method: "POST",
        body: JSON.stringify({ name: customAreaName.trim() }),
      });
      setAreas((prev) => [...prev, newArea].sort((a, b) => a.name.localeCompare(b.name)));
      setAreaId(newArea.id);
      setIsAddingCustomArea(false);
      setCustomAreaName("");

      const selectedCity = cities.find((c) => c.id === Number(cityId));
      const query = `${newArea.name}, ${selectedCity?.name || "Pakistan"}`;
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`);
      const data = await res.json();
      if (data?.features?.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        setCoordinates({ lat, lng });
        setGeocodeMessage(`✓ Created and centered map on ${newArea.name}`);
      }
    } catch (err: any) {
      alert("Error adding custom area: " + (err.message || "Failed"));
    } finally {
      setIsSubmittingArea(false);
    }
  };

  // Handle address auto-geocoding via Photon with Nominatim fallback
  const handleAutoGeocode = async () => {
    if (!streetAddress.trim() && !areaId) return;
    setIsGeocoding(true);
    setGeocodeMessage(null);
    try {
      const selectedCity = cities.find((c) => c.id === Number(cityId));
      const selectedArea = areas.find((a) => a.id === Number(areaId));
      const parts = [
        streetAddress.trim(),
        selectedArea?.name,
        selectedCity?.name,
        "Pakistan",
      ].filter(Boolean);
      const query = parts.join(", ");

      // 1. Try Photon first
      try {
        const pRes = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1&lat=${coordinates.lat}&lon=${coordinates.lng}`
        );
        const pData = await pRes.json();
        if (pData?.features?.length > 0) {
          const [lng, lat] = pData.features[0].geometry.coordinates;
          setCoordinates({ lat, lng });
          const placeName = pData.features[0].properties?.name || selectedArea?.name || streetAddress;
          setGeocodeMessage(`✓ Located: ${placeName}`);
          return;
        }
      } catch {
        // Fallback to Nominatim
      }

      // 2. Fallback to Nominatim
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setCoordinates({ lat, lng });
        setGeocodeMessage(`✓ Located: ${data[0].display_name.split(",").slice(0, 3).join(", ")}`);
      } else {
        setGeocodeMessage("Could not locate exact street. You can click on the map to set.");
      }
    } catch (err) {
      setGeocodeMessage("Could not query map coordinates. Please click on the map.");
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handle image files selection with size limit check (< 10MB)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];
      const oversizeNames: string[] = [];

      files.forEach((f) => {
        if (f.size > 10 * 1024 * 1024) {
          oversizeNames.push(f.name);
        } else {
          validFiles.push(f);
        }
      });

      if (oversizeNames.length > 0) {
        alert(`The following images exceed the 10MB limit and were skipped:\n${oversizeNames.join(", ")}`);
      }

      if (validFiles.length > 0) {
        const newFiles = [...selectedFiles, ...validFiles];
        setSelectedFiles(newFiles);
        const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
        setFilePreviews((prev) => [...prev, ...newPreviews]);
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
    if (coverIndex === index) {
      setCoverIndex(0);
    } else if (coverIndex > index) {
      setCoverIndex((prev) => prev - 1);
    }
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Step 1 Validation
  const canProceedStep1 =
    title.trim().length >= 5 &&
    rentAmount !== "" &&
    Number(rentAmount) > 0 &&
    bedrooms >= 0 &&
    bathrooms >= 0;

  // Step 2 Validation
  const canProceedStep2 = cityId !== "" && areaId !== "";

  // Submit Handler with Upload Progress
  const handleSubmitListing = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    setUploadProgress(null);

    try {
      // 1. Create property record
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        property_type: propertyType,
        city_id: Number(cityId),
        area_id: Number(areaId),
        street_address: streetAddress.trim() || undefined,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        rent_amount: Number(rentAmount),
        security_deposit: securityDeposit !== "" ? Number(securityDeposit) : 0,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        area_sqft: areaSqft !== "" ? Number(areaSqft) : undefined,
        is_furnished: isFurnished,
        amenities: selectedAmenities,
      };

      const created = await apiClient<Property>("/properties", {
        method: "POST",
        body: JSON.stringify(payload),
        requireAuth: true,
      });

      // 2. Upload images if selected with progress tracking
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          setUploadProgress({
            current: i + 1,
            total: selectedFiles.length,
            percent: Math.round(((i + 1) / selectedFiles.length) * 100),
          });

          const file = selectedFiles[i];
          const formData = new FormData();
          formData.append("file", file);
          formData.append("is_cover", (i === coverIndex).toString());

          try {
            await apiClient(`/properties/${created.id}/images`, {
              method: "POST",
              body: formData,
              requireAuth: true,
              isFormData: true,
            });
          } catch (uploadErr) {
            console.error(`Failed to upload photo ${i + 1}:`, uploadErr);
          }
        }
      }

      // Redirect to the created property page
      router.push(`/properties/${created.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create listing.");
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/landlord/properties"
            className="p-2 hover:bg-zinc-100 dark:hover:bg-darkcard rounded-xl text-zinc-600 dark:text-zinc-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
              List a New Rental Property
            </h1>
            <p className="text-xs text-zinc-500">
              Reach verified tenants across Pakistan with standard provincial contracts.
            </p>
          </div>
        </div>
      </div>

      {/* 3-Step Wizard Navigation Indicator */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { step: 1, title: "1. Details & Pricing", desc: "Specs & PKR Rent" },
          { step: 2, title: "2. Location & Map", desc: "City, Sector & Pin" },
          { step: 3, title: "3. Photos & Utilities", desc: "Cloudinary & Amenities" },
        ].map((item) => (
          <div
            key={item.step}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              currentStep === item.step
                ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-md"
                : currentStep > item.step
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <p className="text-xs font-bold flex items-center justify-between">
              <span>{item.title}</span>
              {currentStep > item.step && <Check className="w-3.5 h-3.5 text-emerald-500" />}
            </p>
            <p className="text-[11px] opacity-75 mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs">
          {errorMessage}
        </div>
      )}

      {/* STEP 1: Details & PKR Pricing */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-obsidian p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Property Overview & PKR Pricing
          </h2>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Listing Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Modern 2-Bed Luxury Apartment facing Margalla Hills"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-[10px] text-zinc-400 mt-1">Minimum 5 characters</p>
          </div>

          {/* Type & Furnished */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Property Type *
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="apartment">Apartment / Flat</option>
                <option value="house">Independent House / Villa</option>
                <option value="portion">Upper / Lower Portion</option>
                <option value="room">Single Room / Studio</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Furnishing Status
              </label>
              <div className="flex items-center gap-4 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={isFurnished}
                    onChange={(e) => setIsFurnished(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Fully Furnished with Appliances</span>
                </label>
              </div>
            </div>
          </div>

          {/* Rent & Security Deposit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Monthly Rent (PKR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600">
                  PKR
                </span>
                <input
                  type="number"
                  placeholder="e.g. 85000"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value ? Number(e.target.value) : "")}
                  className="w-full pl-12 pr-3.5 py-2.5 bg-zinc-50 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Security Deposit (PKR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                  PKR
                </span>
                <input
                  type="number"
                  placeholder="e.g. 170000 (usually 2 months rent)"
                  value={securityDeposit}
                  onChange={(e) =>
                    setSecurityDeposit(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full pl-12 pr-3.5 py-2.5 bg-zinc-50 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                />
              </div>
            </div>
          </div>

          {/* Bedrooms, Bathrooms, Sqft */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Bedrooms
              </label>
              <input
                type="number"
                min="0"
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Bathrooms
              </label>
              <input
                type="number"
                min="0"
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Area (Sq. Ft.)
              </label>
              <input
                type="number"
                placeholder="e.g. 1350"
                value={areaSqft}
                onChange={(e) => setAreaSqft(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Detailed Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe nearby markets, schools, maintenance details, and tenant preferences..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-3">
            <button
              type="button"
              disabled={!canProceedStep1}
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-zinc-800 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <span>Next: Set Location & Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Location & Leaflet Pin Drop */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-obsidian p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Select Pakistani City, Sector & Drop Pin
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                City *
              </label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">Select City</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.province})
                  </option>
                ))}
              </select>
            </div>

            {/* Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Sector / Society / Area *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingCustomArea(!isAddingCustomArea)}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {isAddingCustomArea ? "← Choose from list" : "+ Add Other / New Society"}
                </button>
              </div>

              {!isAddingCustomArea ? (
                <div className="space-y-1.5">
                  {areas.length > 10 && (
                    <input
                      type="text"
                      placeholder="Quick filter sectors (e.g. G-13, Bahria, DHA, F-10)..."
                      value={areaSearchFilter}
                      onChange={(e) => setAreaSearchFilter(e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder:text-zinc-400"
                    />
                  )}
                  <select
                    value={areaId}
                    onChange={(e) => handleAreaChange(e.target.value ? Number(e.target.value) : "")}
                    disabled={areas.length === 0}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50"
                  >
                    <option value="">
                      {areas.length === 0 ? "Select a city first" : `Select Sector / Area (${areas.length} available)`}
                    </option>
                    {filteredAreas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter new sector or housing society name..."
                    value={customAreaName}
                    onChange={(e) => setCustomAreaName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateCustomArea()}
                    className="flex-1 px-3.5 py-2 bg-zinc-50 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isSubmittingArea || !customAreaName.trim()}
                    onClick={handleCreateCustomArea}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isSubmittingArea ? "Saving..." : "Save & Select"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Street Address with Auto-Locate Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Street / Building Address
              </label>
              <button
                type="button"
                onClick={handleAutoGeocode}
                disabled={isGeocoding || !streetAddress.trim()}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 disabled:opacity-40 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {isGeocoding ? (
                  <>
                    <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span>Locating...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3 h-3 text-emerald-500" />
                    <span>📍 Locate Address on Map</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. House 42-B, Street 18, Sector F-10/2"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAutoGeocode()}
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-darkcard border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            {geocodeMessage && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1.5 flex items-center gap-1">
                {geocodeMessage}
              </p>
            )}
          </div>

          {/* Interactive Leaflet Pin Drop Map */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Drop Pin on Map (Click map or drag marker to set exact location)
              </label>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
              </span>
            </div>

            <div className="h-72 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <PropertyMap
                isPickerMode={true}
                pickerCoordinates={coordinates}
                onCoordinatesChange={(lat, lng) => setCoordinates({ lat, lng })}
                defaultCenter={[coordinates.lat, coordinates.lng]}
                defaultZoom={13}
                height="100%"
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-3">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-darkcard hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={!canProceedStep2}
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-zinc-800 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <span>Next: Photos & Amenities</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Utilities & Cloudinary Photos */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-obsidian p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Amenities & Cloudinary Photos
          </h2>

          {/* Pakistani Amenities Multi-Select */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Select Available Amenities & Utilities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PAKISTAN_AMENITIES.map((am) => {
                const isSelected = selectedAmenities.includes(am.id);
                const IconComp = am.icon;
                return (
                  <button
                    key={am.id}
                    type="button"
                    onClick={() => toggleAmenity(am.id)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold"
                        : "bg-zinc-50 dark:bg-darkcard border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <IconComp className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs truncate">{am.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cloudinary Multi-Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Property Photos (Cloudinary Upload)
            </label>

            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors">
              <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Click to browse or drag photos here
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Upload clear photos of living room, bedrooms, kitchen, and exterior (WebP, JPG, PNG).
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="photo-upload-input"
              />
              <label
                htmlFor="photo-upload-input"
                className="inline-block mt-3 px-5 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-sm transition-colors"
              >
                Select Photos
              </label>
            </div>

            {/* Thumbnails preview */}
            {filePreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-zinc-500 mb-2">
                  Selected Photos ({filePreviews.length}) — Click "Cover" to set main photo
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {filePreviews.map((url, idx) => (
                    <div
                      key={idx}
                      className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 bg-zinc-900 group ${
                        coverIndex === idx ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 p-1 bg-pitch/80 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverIndex(idx)}
                        className={`absolute bottom-1 left-1 px-2 py-0.5 text-[10px] font-bold rounded ${
                          coverIndex === idx
                            ? "bg-emerald-600 text-white"
                            : "bg-pitch/80 text-zinc-300 hover:bg-pitch"
                        }`}
                      >
                        {coverIndex === idx ? "Cover Photo" : "Set Cover"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Upload Progress Bar */}
            {uploadProgress && (
              <div className="w-full bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2 mt-4">
                <div className="flex justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  <span>Uploading photos to Cloudinary CDN...</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Photo {uploadProgress.current} of {uploadProgress.total} ({uploadProgress.percent}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress.percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation & Submit */}
          <div className="flex items-center justify-between pt-3">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-darkcard hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitListing}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-emerald-600/25 transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing Listing to Cloudinary...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Property Listing</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
