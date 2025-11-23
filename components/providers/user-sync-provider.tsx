"use client";

import { type PropsWithChildren, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/user";

const extractName = (user: { user_metadata?: Record<string, unknown>; email?: string } | null) => {
  if (!user) {
    return "";
  }

  const fullName = user.user_metadata && typeof user.user_metadata.full_name === "string"
    ? user.user_metadata.full_name
    : undefined;

  return fullName ?? user.email ?? "";
};

export function UserSyncProvider({ children }: PropsWithChildren) {
  const { setName } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let isMounted = true;

    const syncUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) {
        return;
      }
      setHasSession(Boolean(data.session));
      setName(extractName(data.session?.user ?? null));
    };

    syncUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }
      setHasSession(Boolean(session));
      setName(extractName(session?.user ?? null));
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [setName]);

  useEffect(() => {
    if (hasSession === null) {
      return;
    }

    if (!hasSession && pathname !== "/login") {
      router.replace("/login");
    } else if (hasSession && pathname === "/login") {
      router.replace("/");
    }
  }, [hasSession, pathname, router]);

  return children;
}
