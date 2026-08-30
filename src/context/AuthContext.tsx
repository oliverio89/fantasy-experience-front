import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type UserRole = "admin" | "master" | "player";

const getProfileRole = async (userId: string): Promise<UserRole> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data.role;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let authRevision = 0;

    const applySession = async (nextSession: Session | null) => {
      const revision = ++authRevision;
      if (!mounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setUserRole(null);

      if (!nextSession?.user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const role = await getProfileRole(nextSession.user.id);
        if (mounted && revision === authRevision) setUserRole(role);
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (mounted && revision === authRevision) setUserRole(null);
      } finally {
        if (mounted && revision === authRevision) setLoading(false);
      }
    };

    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) =>
        applySession(initialSession)
      )
      .catch((error) => {
        console.error("Error initializing authentication:", error);
        if (mounted) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    const fallbackTimer = setTimeout(() => {
      if (mounted) {
        setLoading((prev) => {
          if (prev)
            console.warn(
              "Auth initialization timed out, forcing load completion"
            );
          return false;
        });
      }
    }, 3000);

    return () => {
      mounted = false;
      authRevision += 1;
      subscription.unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  const refreshProfile = async () => {
    if (!user) {
      setUserRole(null);
      return;
    }

    try {
      setUserRole(await getProfileRole(user.id));
    } catch (error) {
      console.error("Error refreshing profile:", error);
      setUserRole(null);
    }
  };

  const value = {
    user,
    session,
    userRole,
    loading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
