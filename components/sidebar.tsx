"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "./ui/button";
import SearchButton from "./searchButton";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, NotepadText } from "lucide-react";

import { useUserStore } from "@/store/user";

export default function Sidebar() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { name, setName } = useUserStore();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [notes, setNotes] = useState<Array<{ id: string; title: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      setIsSigningOut(true);
      await supabase.auth.signOut();
      setName("");
      router.replace("/login");
    } catch (error) {
      console.error("Failed to sign out", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const fetchNotes = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .select("id, title")
      .eq("owner_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch notes", error);
    } else {
      setNotes(data ?? []);
    }
    setIsLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Failed to fetch user", error);
        return;
      }

      setUserId(user?.id ?? null);
    };

    loadUser();
  }, [supabase]);

  useEffect(() => {
    if (!userId) {
      setNotes([]);
      return;
    }

    fetchNotes();
  }, [fetchNotes, userId]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("notes-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `owner_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setNotes((prev) =>
              prev.filter((note) => note.id !== (payload.old?.id as string))
            );
            return;
          }

          const incoming = {
            id: payload.new.id as string,
            title: (payload.new.title as string) ?? "Untitled Note",
          };

          setNotes((prev) => {
            const idx = prev.findIndex((note) => note.id === incoming.id);
            if (idx === -1) {
              return [incoming, ...prev];
            }
            const copy = [...prev];
            copy[idx] = incoming;
            return copy;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  if (!name) {
    return null;
  }

  return (
    <main className=" min-w-[18rem] h-full flex flex-col bg-neutral-50 border-r px-2 pt-10">
      <div className=" flex flex-col gap-y-1 h-fit">
        <Button
          onClick={() => {
            router.push("/");
          }}
          className=" w-full justify-start text-base bg-transparent hover:bg-neutral-200/50 rounded-lg font-semibold"
        >
          <Image src="/newNote.png" alt="New Note" width={18} height={18} />
          New Note
        </Button>
        <SearchButton />
      </div>
      <div className=" mt-5 h-fit min-h-80">
        <h1 className=" px-4 text-sm font-medium text-black/40">Your Notes</h1>
        <div className=" h-full relative w-full">
          <div
            className=" mt-2 flex flex-col gap-y-1 max-h-96 overflow-y-auto overflow-x-hidden pr-1"
            ref={listRef}
          >
            {notes.length > 0 ? (
              notes.map((note) => (
                <Button
                  key={note.id}
                  onClick={() => router.push(`/${note.id}`)}
                  className=" w-full font-semibold flex items-center bg-neutral-50 justify-start text-base gap-x-2 hover:bg-neutral-200/50 text-black overflow-hidden"
                >
                  <NotepadText
                    width={26}
                    height={26}
                    className=" text-amber-500 shrink-0"
                  />
                  <span className=" flex-1 truncate text-left">
                    {note.title || "Untitled Note"}
                  </span>
                </Button>
              ))
            ) : (
              <p className=" py-4 text-center text-sm font-semibold text-black/50">
                No notes available
              </p>
            )}
            <div ref={sentinelRef} />
            {isLoading && (
              <p className=" text-center text-xs text-black/40 py-2">
                Loading...
              </p>
            )}
          </div>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="">
          <Button className=" bg-neutral-50 px-2 hover:bg-neutral-200/70 rounded-lg mt-auto mb-2 h-11 w-full justify-start text-base font-semibold gap-x-2">
            <div className=" bg-linear-to-b from-neutral-400/70 to-neutral-400 rounded-full border border-neutral-400 size-8 font-medium flex text-sm items-center justify-center text-white">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <p>{name}</p>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className=" bg-white rounded-xl min-w-56">
          <DropdownMenuItem
            onClick={handleLogout}
            variant="destructive"
            className=" justify-between font-semibold rounded-lg hover:bg-neutral-200/70"
            disabled={isSigningOut}
          >
            {isSigningOut ? "Logging out" : "Logout"}
            <LogOut className=" w-4 h-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </main>
  );
}
