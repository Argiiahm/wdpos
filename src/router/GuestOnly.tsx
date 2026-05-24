import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { Navigate } from "react-router";

const GuestOnly = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Memuat..</div>;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default GuestOnly;
