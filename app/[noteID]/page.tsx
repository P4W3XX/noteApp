"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowDownToLine,
  Ellipsis,
  LoaderCircle,
  Trash,
} from "lucide-react";

export default function NotePage() {
  const COLLAPSED_TITLE_HEIGHT = 56;
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [scrollScale, setScrollScale] = useState(1);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [titleHeight, setTitleHeight] = useState(COLLAPSED_TITLE_HEIGHT);
  const contextRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();
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

  const params = useParams();
  const noteID = params.noteID;
  const [isLoading, setIsLoading] = useState(false);

  const resizeContextTextarea = useCallback(
    (textarea?: HTMLTextAreaElement | null) => {
      const target = textarea ?? contextRef.current;
      if (!target) return;
      target.style.height = "auto";
      target.style.height = `${target.scrollHeight}px`;
    },
    []
  );

  useEffect(() => {
    resizeContextTextarea();
  }, [context, resizeContextTextarea]);

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

  const handleDelete = async () => {
    try {
      const { data: userResult, error: userError } =
        await supabase.auth.getUser();
      if (userError) {
        throw userError;
      }
      const userId = userResult.user?.id;
      if (!userId) {
        throw new Error("Brak zalogowanego użytkownika");
      }

      const { error: deleteError } = await supabase
        .from("notes")
        .delete()
        .eq("owner_id", userId)
        .eq("id", noteID);
      if (deleteError) {
        throw deleteError;
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
    router.push("/");
  };

  const handleSave = async () => {
    try {
      const { data: userResult, error: userError } =
        await supabase.auth.getUser();
      if (userError) {
        throw userError;
      }
      const userId = userResult.user?.id;
      if (!userId) {
        throw new Error("Brak zalogowanego użytkownika");
      }

      const now = new Date();

      const { data: existingNote, error: existingError } = await supabase
        .from("notes")
        .select("id")
        .eq("owner_id", userId)
        .eq("id", noteID)
        .maybeSingle();

      if (existingError && existingError.code !== "PGRST116") {
        throw existingError;
      }

      if (existingNote) {
        const { error: updateError } = await supabase
          .from("notes")
          .update({
            title,
            context,
            updated_at: now,
          })
          .eq("id", existingNote.id);

        if (updateError) {
          throw updateError;
        }
        console.log("Note updated");
      } else {
        const { error: insertError } = await supabase.from("notes").insert([
          {
            owner_id: userId,
            title,
            context,
            created_at: now,
            updated_at: now,
          },
        ]);

        if (insertError) {
          throw insertError;
        }
        console.log("Note created");
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  useEffect(() => {
    async function loadNote() {
      try {
        setIsLoading(true);
        console.log("Loading note...");
        const { data: userResult, error: userError } =
          await supabase.auth.getUser();
        if (userError) {
          throw userError;
        }
        const userId = userResult.user?.id;
        if (!userId) {
          throw new Error("Brak zalogowanego użytkownika");
        }
        const { data: noteData, error: noteError } = await supabase
          .from("notes")
          .select("title, context, created_at")
          .eq("owner_id", userId)
          .eq("id", noteID)
          .maybeSingle();
        if (noteError) {
          throw noteError;
        }
        if (noteData) {
          setTitle(noteData.title);
          setContext(noteData.context);
        }
      } catch (error) {
        console.error("Error loading note:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadNote();
  }, [noteID, supabase]);

  if (isLoading) {
    return (
      <div className=" w-full h-full">
        <LoaderCircle className=" w-20 h-20 text-amber-500 animate-spin bottom-0 top-0 my-auto right-0 left-0 absolute mx-auto" />
      </div>
    );
  }
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
                disabled={title.trim().length === 0 && context.trim().length === 0}
                className=" justify-between font-semibold rounded-lg hover:bg-neutral-100!"
              >
                Save
                <ArrowDownToLine className=" w-4 h-4 text-amber-500" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete()}
                variant="destructive"
                className=" justify-between font-semibold rounded-lg hover:bg-red-100!"
              >
                Delete
                <Trash className=" w-4 h-4" />
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
          resizeContextTextarea(e.currentTarget);
        }}
      />
    </div>
  );
}
