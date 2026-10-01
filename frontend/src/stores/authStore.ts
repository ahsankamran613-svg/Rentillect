import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserProfile, UserRole } from "@/types";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/api";

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  activeRole: UserRole | null;
  loading: boolean;
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

      setAuth: (user, token) => {
        // Choose initial active role: prefer landlord if user has it, else first available
        const initialRole = user.roles.includes("landlord")
          ? "landlord"
          : user.roles[0] || "tenant";

        set({
          user,
          token,
          activeRole: initialRole,
          loading: false,
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
        set({
          user: null,
          token: null,
          activeRole: null,
          loading: false,
        });
      },

      checkSession: async () => {
        set({ loading: true });
        try {
          const { data } = await supabase.auth.getSession();
          const sessionToken = data.session?.access_token;

          if (sessionToken) {
            // Fetch updated profile from FastAPI backend
            const profile = await apiClient<UserProfile>("/profiles/me", {
              headers: { Authorization: `Bearer ${sessionToken}` },
              requireAuth: false,
            });

            const currentRole = get().activeRole;
            const validRole = currentRole && profile.roles.includes(currentRole)
              ? currentRole
              : profile.roles[0] || "tenant";

            set({
              user: profile,
              token: sessionToken,
              activeRole: validRole,
              loading: false,
            });
            return;
          }
        } catch (err) {
          console.warn("Session restore failed", err);
        }
        set({ user: null, token: null, activeRole: null, loading: false });
      },
    }),
    {
      name: "rentillect-auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        activeRole: state.activeRole,
      }),
    }
  )
);
