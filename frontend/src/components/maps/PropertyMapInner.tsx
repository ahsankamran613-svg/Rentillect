"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Property } from "@/types/property";

// Formatter for PKR rent
function formatRent(amount: number): string {
  if (amount >= 100000) {
    return `₨ ${(amount / 100000).toFixed(1)} Lac`;
  }
  if (amount >= 1000) {
    return `₨ ${(amount / 1000).toFixed(0)}k`;
  }
  return `₨ ${amount.toLocaleString()}`;
}

// Custom DivIcon for map markers in Browse Mode
function createPriceIcon(rent: number, isSelected: boolean = false) {
  const priceText = formatRent(rent);
  return L.divIcon({
    className: "custom-rent-marker",
    html: `
      <div style="
        background: ${isSelected ? "#059669" : "#09090b"};
        color: #ffffff;
        font-family: inherit;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 9999px;
        border: 2px solid ${isSelected ? "#34d399" : "#27272a"};
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
        transform: translate(-50%, -50%);
        cursor: pointer;
        transition: transform 0.2s, background-color 0.2s;
      ">
        <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#10b981;"></span>
        ${priceText}
      </div>
    `,
    iconSize: [60, 24],
    iconAnchor: [30, 12],
  });
}

// Custom DivIcon for Draggable Pin-Drop Mode
function createPinDropIcon() {
  return L.divIcon({
    className: "custom-pindrop-marker",
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: #059669;
        border: 3px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg) translate(0, -10px);
        box-shadow: 0 4px 16px rgba(5, 150, 105, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: #ffffff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}

// Controller to smoothly fly to selected coordinates
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Map Click Listener for Pin-Drop Picker Mode
function LocationPickerEvents({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export interface PropertyMapProps {
  properties?: Property[];
  selectedPropertyId?: string | null;
  onSelectProperty?: (id: string | null) => void;
  // Picker mode props
  isPickerMode?: boolean;
  pickerCoordinates?: { lat: number; lng: number } | null;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  // Styling
  height?: string;
  defaultCenter?: [number, number];
  defaultZoom?: number;
}

export default function PropertyMapInner({
  properties = [],
  selectedPropertyId = null,
  onSelectProperty,
  isPickerMode = false,
  pickerCoordinates = null,
  onCoordinatesChange,
  height = "100%",
  defaultCenter = [33.6844, 73.0479], // Islamabad center default
  defaultZoom = 12,
}: PropertyMapProps) {
  // If coordinates are provided in picker mode, center on them
  const currentCenter = useMemo<[number, number]>(() => {
    if (isPickerMode && pickerCoordinates) {
      return [pickerCoordinates.lat, pickerCoordinates.lng];
    }
    if (properties.length > 0 && properties[0].latitude && properties[0].longitude) {
      return [properties[0].latitude, properties[0].longitude];
    }
    return defaultCenter;
  }, [isPickerMode, pickerCoordinates, properties, defaultCenter]);

  return (
    <div style={{ height, width: "100%", position: "relative" }} className="rounded-xl overflow-hidden shadow-inner border border-zinc-200 dark:border-zinc-800">
      <MapContainer
        center={currentCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 10 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles by <a href="https://www.hotosm.org/" target="_blank">HOT</a>'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapController center={currentCenter} zoom={defaultZoom} />

        {/* Pin-Drop Picker Mode */}
        {isPickerMode && (
          <>
            <LocationPickerEvents
              onPick={(lat, lng) => {
                if (onCoordinatesChange) onCoordinatesChange(lat, lng);
              }}
            />
            {pickerCoordinates && (
              <Marker
                position={[pickerCoordinates.lat, pickerCoordinates.lng]}
                icon={createPinDropIcon()}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    if (onCoordinatesChange) {
                      onCoordinatesChange(position.lat, position.lng);
                    }
                  },
                }}
              >
                <Popup className="custom-map-popup">
                  <div className="p-1 text-center font-medium text-xs text-zinc-900">
                    <p className="font-semibold text-emerald-700">Property Location</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {pickerCoordinates.lat.toFixed(5)}, {pickerCoordinates.lng.toFixed(5)}
                    </p>
                    <p className="text-[9px] text-zinc-400 mt-1">Drag marker to adjust location</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </>
        )}

        {/* Browse Mode: Show all properties with price tags */}
        {!isPickerMode &&
          properties
            .filter((p) => p.latitude && p.longitude)
            .map((property) => {
              const isSelected = selectedPropertyId === property.id;
              const coverImage = property.images?.find((img) => img.is_cover)?.cloudinary_url ||
                property.images?.[0]?.cloudinary_url ||
                "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80";

              return (
                <Marker
                  key={property.id}
                  position={[property.latitude!, property.longitude!]}
                  icon={createPriceIcon(property.rent_amount, isSelected)}
                  eventHandlers={{
                    click: () => {
                      if (onSelectProperty) onSelectProperty(property.id);
                    },
                  }}
                >
                  <Popup className="custom-map-popup">
                    <div className="w-56 overflow-hidden rounded-lg font-sans">
                      <div className="h-28 w-full relative bg-zinc-800 overflow-hidden">
                        <img
                          src={coverImage}
                          alt={property.title}
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-pitch/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-semibold text-white uppercase tracking-wider">
                          {property.property_type}
                        </div>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-obsidian">
                        <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                          {property.title}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {property.area?.name || "Prime Sector"}, {property.city?.name || "Pakistan"}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          <div>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                              ₨ {property.rent_amount.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-zinc-400"> /mo</span>
                          </div>
                          <Link
                            href={`/properties/${property.id}`}
                            className="bg-pitch hover:bg-zinc-800 text-white text-[11px] font-medium px-2.5 py-1 rounded transition-colors"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
      </MapContainer>
    </div>
  );
}
