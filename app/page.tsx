"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowDownToLine,
  Ellipsis,
} from "lucide-react";

export default function Home() {
  const COLLAPSED_TITLE_HEIGHT = 56;
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [scrollScale, setScrollScale] = useState(1);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [titleHeight, setTitleHeight] = useState(COLLAPSED_TITLE_HEIGHT);
  const contextRef = useRef<HTMLTextAreaElement | null>(null);
  const supabase = getSupabaseBrowserClient();
  const hasMultipleLines = /\r?\n/.test(title);
  const exceedsCollapsedHeight = titleHeight > COLLAPSED_TITLE_HEIGHT + 1;
  const canCollapseTitle =
    (hasMultipleLines || exceedsCollapsedHeight) && title.trim().length > 0;
  const shouldCollapseTitle = hasScrolled && canCollapseTitle;
  const firstLine = title.split(/\r?\n/)[0] ?? "";
  const displayedTitleHeight = shouldCollapseTitle
    ? COLLAPSED_TITLE_HEIGHT
    : Math.max(titleHeight, COLLAPSED_TITLE_HEIGHT);
  const collapsedTitle =
    canCollapseTitle && firstLine ? `${firstLine}...` : firstLine;

  const router = useRouter();

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollTop = target.scrollTop;

      const maxScroll = 80;
      const minScale = 0.8;

      const scale = Math.max(
        minScale,
        1 - (scrollTop / maxScroll) * (1 - minScale)
      );
      console.log(scale);
      setScrollScale(scale);
      setHasScrolled(scrollTop > 0);
    };

    const container = pageRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const handleSave = async () => {
    try {
      const { data: userResult, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userResult.user?.id;
      if (!userId) throw new Error("Brak zalogowanego użytkownika");

      const now = new Date();

      const { data: newNote, error: insertError } = await supabase
        .from("notes")
        .insert([
          {
            owner_id: userId,
            title,
            context,
            created_at: now,
            updated_at: now,
          },
        ])
        .select("id")
        .single();

      if (insertError) throw insertError;

      router.refresh();
      if (newNote?.id) router.push(`/${newNote.id}`);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  useEffect(() => {
    setTitle("");
    setContext("");
  }, []);

  return (
    <div ref={pageRef} className=" w-full h-full overflow-auto">
      <motion.div
        className={` border-b h-14 sticky top-0 flex justify-end px-5 w-full items-center bg-zinc-50`}
      >
        <div className=" w-min items-center justify-center gap-x-2 flex h-full">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className=" w-5 h-5 text-amber-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className=" bg-white rounded-xl min-w-48"
            >
              <DropdownMenuItem
                onClick={() => handleSave()}
                disabled={
                  title.trim().length === 0 && context.trim().length === 0
                }
                className=" justify-between font-semibold rounded-lg hover:bg-neutral-100!"
              >
                Save
                <ArrowDownToLine className=" w-4 h-4 text-amber-500" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
      <motion.div
        animate={{
          scale: scrollScale,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={`w-full px-4 pt-4 origin-left min-h-14 h-auto sticky bg-transparent -top-3.5 overflow-hidden`}
      >
        {!title && (
          <motion.h1
            initial={true}
            className=" font-bold text-3xl text-black/20 -z-10 top-3 h-min bottom-0 my-auto left-4 absolute select-none pointer-events-none"
          >
            Title
          </motion.h1>
        )}
        <div className="relative" style={{ height: displayedTitleHeight }}>
          <motion.textarea
            key={"Title"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className=" w-full min-h-14 caret-amber-500 bg-transparen text-black text-3xl z-20 font-bold focus:outline-none resize-none p-0 py-2.5"
            style={{
              opacity: shouldCollapseTitle ? 0 : 1,
              pointerEvents: shouldCollapseTitle ? "none" : "auto",
              height: displayedTitleHeight,
            }}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (shouldCollapseTitle) {
                  e.preventDefault();
                } else {
                  e.preventDefault();
                  contextRef.current?.focus();
                }
              }
            }}
            onInput={(e) => {
              const textarea = e.currentTarget;
              textarea.style.height = "auto";
              const nextHeight = Math.max(
                textarea.scrollHeight,
                COLLAPSED_TITLE_HEIGHT
              );
              textarea.style.height = `${nextHeight}px`;
              setTitleHeight(nextHeight);
            }}
          />
          {shouldCollapseTitle && (
            <div className="pointer-events-none absolute inset-0 z-30 flex items-center">
              <div className="w-full text-black text-3xl font-bold py-2.5 truncate">
                {collapsedTitle}
              </div>
            </div>
          )}
        </div>
      </motion.div>
      <motion.textarea
        key={"Context"}
        ref={contextRef}
        value={context}
        onChange={(e) => setContext(e.target.value)}
        className=" w-full caret-amber-500 resize-none focus:outline-none px-4"
        onInput={(e) => {
          e.currentTarget.style.height = "auto";
          e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
        }}
      />
    </div>
  );
}
