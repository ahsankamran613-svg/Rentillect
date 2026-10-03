import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserProfile, UserRole } from "@/types";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/api";
import { setCachedToken } from "@/lib/tokenCache";

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  activeRole: UserRole | null;
  loading: boolean;
  /** True after the first successful session check — prevents duplicate network calls on navigation. */
  initialized: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  updateUser: (user: Partial<UserProfile>) => void;
  switchRole: (role: UserRole) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      activeRole: null,
      loading: true,
      initialized: false,

      setAuth: (user, token) => {
        // Choose initial active role: prefer landlord if user has it, else first available
        const initialRole = user.roles.includes("landlord")
          ? "landlord"
          : user.roles[0] || "tenant";

        // Populate the token cache so apiClient doesn't need to call Supabase
        setCachedToken(token);
        set({
          user,
          token,
          activeRole: initialRole,
          loading: false,
          initialized: true,
        });
      },

      updateUser: (updatedFields) => {
        const currentUser = get().user;
        if (!currentUser) return;
        set({ user: { ...currentUser, ...updatedFields } });
      },

      switchRole: (role) => {
        const { user } = get();
        if (!user) return;
        if (user.roles.includes(role)) {
          set({ activeRole: role });
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.error("Sign out error", e);
        }
        // Clear the token cache and reset initialized so next login checks freshly
        setCachedToken(null);
        set({
          user: null,
          token: null,
          activeRole: null,
          loading: false,
          initialized: false,
        });
      },

      checkSession: async () => {
        // ✅ KEY PERF FIX: If already initialized with a valid user, skip all network calls.
        const { initialized, user, token } = get();
        if (initialized && user) return;

        set({ loading: true });
        try {
          // Check stored token first, fallback to Supabase session
          let sessionToken = token;
          if (!sessionToken) {
            const { data } = await supabase.auth.getSession();
            sessionToken = data.session?.access_token || null;
          }

          if (sessionToken) {
            // Fetch updated profile from FastAPI backend
            try {
              const profile = await apiClient<UserProfile>("/profiles/me", {
                headers: { Authorization: `Bearer ${sessionToken}` },
                requireAuth: false,
              });

              const currentRole = get().activeRole;
              const validRole =
                currentRole && profile.roles.includes(currentRole)
                  ? currentRole
                  : profile.roles[0] || "tenant";

              setCachedToken(sessionToken);
              set({
                user: profile,
                token: sessionToken,
                activeRole: validRole,
                loading: false,
                initialized: true,
              });
              return;
            } catch (apiErr) {
              // If API verification failed, but we have stored user, keep user logged in if not explicitly 401
              if (user && token) {
                setCachedToken(token);
                set({ loading: false, initialized: true });
                return;
              }
            }
          }
        } catch (err) {
          console.warn("Session restore failed", err);
        }

        // Fallback: If user and token already exist in local store, preserve them
        if (user && token) {
          setCachedToken(token);
          set({ loading: false, initialized: true });
          return;
        }

        // No valid session
        setCachedToken(null);
        set({ user: null, token: null, activeRole: null, loading: false, initialized: true });
      },
    }),
    {
      name: "rentillect-auth-storage",
      // NOTE: 'initialized' is intentionally excluded — it must reset on every fresh page load
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        activeRole: state.activeRole,
      }),
    }
  )
);
