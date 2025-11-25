"use client";

import { useSearchOpen } from "@/store/searchOpen";
import { motion } from "motion/react";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function SearchUI() {
  const { isSearchOpen, closeSearch } = useSearchOpen();
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const PAGE_SIZE = 20;
  const [notes, setNotes] = useState<
    Array<{
      id: string;
      title: string | null;
      created_at: string;
      updated_at: string | null;
    }>
  >([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const pageRef = useRef(0);

  const getSectionTitle = (date: Date) => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - 7);

    if (date >= todayStart) {
      return "Today";
    }
    if (date >= yesterdayStart) {
      return "Yesterday";
    }
    if (date >= weekStart) {
      return "Last 7 days";
    }
    return "Earlier";
  };

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) {
      return;
    }
    setIsLoading(true);

    const pageToFetch = pageRef.current;
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user?.id) {
      console.error("Error getting user:", userError);
      setHasMore(false);
      setIsLoading(false);
      return;
    }

    const from = pageToFetch * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("notes")
      .select("id, title, created_at, updated_at")
      .eq("owner_id", userData.user.id)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching notes:", error);
      setIsLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setHasMore(false);
      setIsLoading(false);
      return;
    }

    setNotes((prev) => {
      const knownIds = new Set(prev.map((note) => note.id));
      const merged = [...prev];
      data.forEach((note) => {
        if (!knownIds.has(note.id)) {
          merged.push(note);
        }
      });
      return merged;
    });

    pageRef.current += 1;

    if (data.length < PAGE_SIZE) {
      setHasMore(false);
    }

    setIsLoading(false);
  }, [PAGE_SIZE, hasMore, isLoading, supabase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        closeSearch();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }
    setNotes([]);
    setHasMore(true);
    pageRef.current = 0;
    setIsLoading(false);
    setSearchTerm("");
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }
    loadMore();
  }, [isSearchOpen, loadMore]);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      {
        root: listRef.current,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [isSearchOpen, loadMore]);

  const groupedNotes = useMemo(() => {
    const sections = new Map<
      string,
      Array<{ note: (typeof notes)[number]; activityDate: Date }>
    >();

    const normalizedQuery = searchTerm.trim().toLowerCase();

    const filtered = normalizedQuery
      ? notes
          .map((note) => ({
            note,
            score: fuzzyMatchScore(normalizedQuery, note.title ?? ""),
          }))
          .filter((entry) => entry.score !== null)
          .sort((a, b) => (a.score ?? Infinity) - (b.score ?? Infinity))
          .map((entry) => entry.note)
      : notes;

    filtered.forEach((note) => {
      const activityDate = new Date(note.updated_at ?? note.created_at);
      const sectionKey = getSectionTitle(activityDate);
      if (!sections.has(sectionKey)) {
        sections.set(sectionKey, []);
      }
      sections.get(sectionKey)!.push({ note, activityDate });
    });

    return Array.from(sections.entries());
  }, [notes, searchTerm]);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);
  return (
    <motion.main
      initial={false}
      animate={{
        display: isSearchOpen ? "block" : "none",
      }}
      className=" absolute w-full h-full"
    >
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{
          opacity: isSearchOpen ? 1 : 0,
          scale: isSearchOpen ? 1 : 1.1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className=" max-w-200 h-full max-h-120 z-10 border border-zinc-300 shadow-[0_0_30px_20px_rgba(0,0,0,0.15)] w-full absolute right-0 left-0 top-0 bottom-0 my-auto rounded-2xl mx-auto bg-white flex flex-col overflow-hidden"
      >
        <div className=" border-b border-zinc-300 px-2 pl-6 flex items-center shrink-0">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search notes..."
            className=" w-full h-15 rounded-t-3xl placeholder:text-zinc-400 font-medium focus:outline-none caret-amber-500"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <Button
            onClick={() => closeSearch()}
            size={"icon-lg"}
            className=" bg-transparent hover:bg-neutral-200/70"
          >
            <X size={24} />
          </Button>
        </div>
        <div
          className=" px-2 pt-2 pb-2 overflow-auto flex-1 min-h-0"
          ref={listRef}
        >
          <Button
            onClick={() => {
              router.push("/");
              router.refresh();
              closeSearch();
            }}
            className=" w-full h-11 rounded-xl bg-transparent text-base font-semibold justify-start hover:bg-neutral-100"
          >
            <Image src="/newNote.png" alt="New Note" width={18} height={18} />
            New Note
          </Button>
          {groupedNotes.length === 0 && !isLoading ? (
            <p className=" text-center text-sm text-zinc-400 mt-6">
              {searchTerm.trim()
                ? `Brak wyników dla "${searchTerm.trim()}"`
                : "Brak notatek do wyświetlenia"}
            </p>
          ) : (
            groupedNotes.map(([sectionLabel, items]) => (
              <div key={sectionLabel} className=" mt-4">
                <h1 className=" px-4 text-xs text-zinc-400 font-medium mb-2">
                  {sectionLabel}
                </h1>
                {items.map(({ note, activityDate }) => (
                  <Button
                    key={note.id}
                    onClick={() => {
                      router.push(`/${note.id}`);
                      router.refresh();
                      closeSearch();
                    }}
                    className=" w-full h-auto py-3 rounded-xl bg-transparent text-base font-semibold justify-start hover:bg-neutral-100 gap-3"
                  >
                    <Image
                      src="/notes.png"
                      alt="Note"
                      width={18}
                      height={18}
                      className=" mt-0.5"
                    />
                    <div className=" flex flex-col text-left gap-1">
                      <span className=" text-base font-semibold">
                        {note.title?.trim() || "Untitled Note"}
                      </span>
                      <span className=" text-xs text-zinc-400 font-medium">
                        {formatActivityTimestamp(activityDate)}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            ))
          )}
          <div ref={sentinelRef} />
          {isLoading && (
            <p className=" text-center text-sm text-zinc-400 py-2">
              Ładowanie…
            </p>
          )}
        </div>
      </motion.div>
    </motion.main>
  );
}

const fuzzyMatchScore = (query: string, text: string) => {
  const normalizedText = text.toLowerCase();
  let score = 0;
  let lastIndex = -1;

  for (const char of query) {
    const index = normalizedText.indexOf(char, lastIndex + 1);
    if (index === -1) {
      return null;
    }
    if (lastIndex >= 0) {
      score += index - lastIndex - 1;
    } else {
      score += index;
    }
    lastIndex = index;
  }

  return score + (normalizedText.length - (lastIndex + 1));
};

const formatActivityTimestamp = (date: Date) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
