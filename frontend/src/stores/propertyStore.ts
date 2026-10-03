// ============================================================
// Rentillect Property Cache Store (Zustand)
// ============================================================
// Caches the landlord's property list in memory so navigating
// between /landlord and /landlord/properties doesn't trigger a
// fresh network request every time.
//
// Strategy: "stale-while-revalidate"
//   - If data exists AND is fresher than CACHE_TTL_MS → return immediately (0ms lag)
//   - If data is stale OR absent → fetch fresh data from the API
//   - After any mutation (delete, create) → force-invalidate the cache
// ============================================================

import { create } from "zustand";
import { Property } from "@/types/property";
import { apiClient } from "@/lib/api";

/** How long cached data is considered fresh before a background refetch. */
const CACHE_TTL_MS = 60_000; // 60 seconds

interface PropertyStoreState {
  /** The cached list of the current user's properties. */
  properties: Property[];
  /** Epoch ms of the last successful fetch. null = never fetched. */
  lastFetched: number | null;
  /** True only during the very first fetch (no data in cache yet). */
  loading: boolean;
  /** Non-null if the last fetch errored. */
  error: string | null;

  /**
   * Fetch /properties/mine.
   * - Returns cached data immediately if still fresh.
   * - Accepts `{ force: true }` to bypass the TTL and always hit the API.
   */
  fetchProperties: (opts?: { force?: boolean }) => Promise<void>;

  /**
   * Invalidates the cache and re-fetches.
   * Call this after create / delete / update operations.
   */
  invalidate: () => Promise<void>;
}

export const usePropertyStore = create<PropertyStoreState>()((set, get) => ({
  properties: [],
  lastFetched: null,
  loading: false,
  error: null,

  fetchProperties: async ({ force = false } = {}) => {
    const { lastFetched, properties } = get();
    const isFresh =
      lastFetched !== null &&
      Date.now() - lastFetched < CACHE_TTL_MS &&
      properties.length >= 0;

    // ✅ Cache hit: data is fresh — return immediately without any network call
    if (isFresh && !force) return;

    // First load (no data yet) → show loading spinner
    if (!lastFetched) {
      set({ loading: true, error: null });
    }

    try {
      const data = await apiClient<Property[]>("/properties/mine", {
        requireAuth: true,
      });
      set({ properties: data ?? [], lastFetched: Date.now(), loading: false, error: null });
    } catch (err: any) {
      set({ loading: false, error: err.message || "Failed to load properties." });
    }
  },

  invalidate: async () => {
    // Clear lastFetched so the next fetchProperties call hits the API unconditionally
    set({ lastFetched: null });
    await get().fetchProperties({ force: true });
  },
}));
